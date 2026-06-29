import json
import re
import anthropic
from app.core.config import settings
from app.schemas.log_analysis import LogAnalysisResponse

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

# Patterns that indicate problems in logs
ERROR_PATTERNS = [
    r"(?i)(error|exception|fatal|critical|fail|traceback|stacktrace|panic)",
    r"HTTP [45]\d{2}",
    r"(?i)(timeout|timed.?out|connection.?refused|refused.?connection)",
    r"(?i)(out.?of.?memory|oom|heap.?space)",
    r"(?i)(deadlock|lock.?wait)",
    r"(?i)(null.?pointer|nullpointer|npe)",
]

SYSTEM_PROMPT = """You are an expert SRE/DevOps engineer analyzing application logs.
Given log excerpts containing errors, identify the root cause and provide actionable remediation steps.

Respond in this exact JSON format:
{
  "detected_issues": [
    {"type": "<issue type>", "count": <number or null>, "timeframe": "<e.g. last 5 minutes or null>", "detail": "<one line detail>"}
  ],
  "most_likely_cause": "<root cause in one sentence>",
  "affected_service": "<service or component name>",
  "severity": "<critical|high|medium|low>",
  "suggested_actions": ["<action 1>", "<action 2>", ...],
  "raw_errors": ["<up to 5 most significant error lines from the logs>"],
  "ticket_suggestion": {
    "title": "<concise ticket title>",
    "description": "<2-3 sentence description suitable for a support ticket>",
    "priority": "<critical|high|medium|low>"
  }
}"""


def extract_error_lines(content: str, max_lines: int = 200) -> list[str]:
    """Pull error-bearing lines from potentially large log files."""
    lines = content.splitlines()
    compiled = [re.compile(p) for p in ERROR_PATTERNS]
    error_lines = [l for l in lines if any(p.search(l) for p in compiled)]

    if not error_lines:
        # No obvious errors — return last N lines as context
        return lines[-max_lines:]

    # Deduplicate similar lines, cap total
    seen: set[str] = set()
    unique: list[str] = []
    for line in error_lines:
        key = re.sub(r"\d+", "N", line)[:80]
        if key not in seen:
            seen.add(key)
            unique.append(line)
        if len(unique) >= max_lines:
            break
    return unique


def analyze_logs(filename: str, content: str) -> LogAnalysisResponse:
    error_lines = extract_error_lines(content)
    log_excerpt = "\n".join(error_lines)

    # Keep under ~6000 chars to stay well within token budget
    if len(log_excerpt) > 6000:
        log_excerpt = log_excerpt[:6000] + "\n... [truncated]"

    user_message = f"Log file: {filename}\n\nLog excerpt ({len(error_lines)} error lines extracted):\n\n{log_excerpt}"

    response = client.messages.create(
        model=settings.LLM_MODEL,
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw_text = response.content[0].text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    data = json.loads(raw_text)
    return LogAnalysisResponse(**data)
