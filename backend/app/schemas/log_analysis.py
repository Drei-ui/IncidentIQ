from pydantic import BaseModel


class DetectedIssue(BaseModel):
    type: str
    count: int | None = None
    timeframe: str | None = None
    detail: str | None = None


class TicketSuggestion(BaseModel):
    title: str
    description: str
    priority: str


class LogAnalysisResponse(BaseModel):
    detected_issues: list[DetectedIssue]
    most_likely_cause: str
    affected_service: str
    severity: str
    suggested_actions: list[str]
    raw_errors: list[str]
    ticket_suggestion: TicketSuggestion
