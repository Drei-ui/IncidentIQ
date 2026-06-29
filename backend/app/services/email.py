import httpx
from app.core.config import settings


async def send_critical_ticket_alert(ticket_id: str, title: str, description: str) -> bool:
    """Send email alert for critical tickets via Resend. Silently skips if not configured."""
    if not settings.RESEND_API_KEY or not settings.ALERT_EMAIL_TO:
        return False

    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f3f4f6;padding:32px;border-radius:12px;border:1px solid #ef4444">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <div style="background:#ef4444;border-radius:8px;padding:8px;display:inline-block">
          <span style="color:white;font-size:18px">⚡</span>
        </div>
        <div>
          <h1 style="margin:0;font-size:18px;color:white">IncidentIQ</h1>
          <p style="margin:0;font-size:12px;color:#6b7280">Critical Alert</p>
        </div>
      </div>
      <div style="background:#1f2937;border-radius:8px;padding:16px;margin-bottom:20px;border-left:4px solid #ef4444">
        <p style="margin:0 0 8px;font-size:12px;color:#ef4444;text-transform:uppercase;letter-spacing:0.05em">🚨 Critical Ticket Created</p>
        <h2 style="margin:0 0 8px;font-size:16px;color:white">{title}</h2>
        <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.5">{description[:300]}{"..." if len(description) > 300 else ""}</p>
      </div>
      <a href="http://localhost:3000" style="display:inline-block;background:#ef4444;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
        View Ticket →
      </a>
      <p style="margin-top:24px;font-size:12px;color:#4b5563">Ticket ID: {ticket_id}</p>
    </div>
    """

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.ALERT_EMAIL_FROM,
                    "to": [settings.ALERT_EMAIL_TO],
                    "subject": f"🚨 Critical Ticket: {title}",
                    "html": html,
                },
                timeout=10,
            )
            return response.status_code == 200
    except Exception:
        return False
