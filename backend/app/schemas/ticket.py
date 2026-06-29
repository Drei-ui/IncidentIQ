from datetime import datetime
from pydantic import BaseModel
from app.models.ticket import TicketStatus, TicketPriority


class TicketCreate(BaseModel):
    title: str
    description: str
    priority: TicketPriority = TicketPriority.medium


class TicketUpdate(BaseModel):
    status: TicketStatus | None = None
    resolution: str | None = None
    priority: TicketPriority | None = None


class TicketResponse(BaseModel):
    id: str
    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    resolution: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
