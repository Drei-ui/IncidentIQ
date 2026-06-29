from datetime import datetime, UTC, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse
from app.services.embedding import embed
from app.services.email import send_critical_ticket_alert

router = APIRouter()


@router.get("", response_model=list[TicketResponse])
async def list_tickets(
    status: str | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    query = select(Ticket).order_by(Ticket.created_at.desc()).limit(limit)
    if status:
        query = query.where(Ticket.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=TicketResponse, status_code=201)
async def create_ticket(
    payload: TicketCreate,
    db: AsyncSession = Depends(get_db),
):
    ticket = Ticket(**payload.model_dump())
    ticket.embedding = embed(f"{payload.title}\n{payload.description}")
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    if ticket.priority == TicketPriority.critical:
        await send_critical_ticket_alert(ticket.id, ticket.title, ticket.description)

    return ticket


@router.get("/stats")
async def ticket_stats(db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.count()).select_from(Ticket))
    resolved = await db.scalar(select(func.count()).select_from(Ticket).where(Ticket.status == "resolved"))
    pending = await db.scalar(select(func.count()).select_from(Ticket).where(Ticket.status == "open"))
    in_progress = await db.scalar(select(func.count()).select_from(Ticket).where(Ticket.status == "in_progress"))
    return {"total": total, "resolved": resolved, "pending": pending, "in_progress": in_progress}


@router.get("/charts")
async def ticket_charts(db: AsyncSession = Depends(get_db)):
    # Tickets by priority
    priority_rows = await db.execute(
        select(Ticket.priority, func.count().label("count"))
        .group_by(Ticket.priority)
    )
    by_priority = [{"priority": r.priority, "count": r.count} for r in priority_rows]

    # Tickets by status
    status_rows = await db.execute(
        select(Ticket.status, func.count().label("count"))
        .group_by(Ticket.status)
    )
    by_status = [{"status": r.status, "count": r.count} for r in status_rows]

    # Tickets created per day for last 7 days
    seven_days_ago = datetime.now(UTC) - timedelta(days=7)
    daily_rows = await db.execute(
        select(
            func.date(Ticket.created_at).label("day"),
            func.count().label("total"),
            func.sum(case((Ticket.status == TicketStatus.resolved, 1), else_=0)).label("resolved"),
        )
        .where(Ticket.created_at >= seven_days_ago)
        .group_by(func.date(Ticket.created_at))
        .order_by(func.date(Ticket.created_at))
    )
    daily = [{"day": str(r.day), "total": r.total, "resolved": int(r.resolved or 0)} for r in daily_rows]

    return {"by_priority": by_priority, "by_status": by_status, "daily": daily}


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    payload: TicketUpdate,
    db: AsyncSession = Depends(get_db),
):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(ticket, field, value)
    await db.commit()
    await db.refresh(ticket)
    return ticket
