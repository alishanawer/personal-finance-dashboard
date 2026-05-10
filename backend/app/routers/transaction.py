from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.schemas.transaction import (
    TransactionCreate,
    TransactionOut,
    TransactionUpdate,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if tx_in.category_id is not None:
        category = (
            db.query(Category)
            .filter(
                Category.id == tx_in.category_id,
                Category.user_id == current_user.id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=400, detail="Invalid category for this user."
            )

    tx = Transaction(
        amount=tx_in.amount,
        type=tx_in.type,
        description=tx_in.description,
        date=tx_in.date,
        category_id=tx_in.category_id,
        user_id=current_user.id,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/", response_model=list[TransactionOut])
def list_transactions(
    response: Response,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    q: str | None = None,
    tx_type: TransactionType | None = None,
    category_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    min_amount: float | None = Query(default=None, gt=0),
    max_amount: float | None = Query(default=None, gt=0),
    page: int | None = Query(default=None, ge=1),
    page_size: int | None = Query(default=None, ge=1, le=200),
):
    query = db.query(Transaction).filter(
        Transaction.user_id == current_user.id)

    if q:
        query = query.filter(Transaction.description.ilike(f"%{q}%"))
    if tx_type:
        query = query.filter(Transaction.type == tx_type)
    if category_id is not None:
        query = query.filter(Transaction.category_id == category_id)
    if start_date is not None:
        query = query.filter(Transaction.date >= start_date)
    if end_date is not None:
        query = query.filter(Transaction.date <= end_date)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    query = query.order_by(Transaction.date.desc())

    if page is not None or page_size is not None:
        page = page or 1
        page_size = page_size or 20
        total = query.count()
        response.headers["X-Total-Count"] = str(total)
        response.headers["X-Page"] = str(page)
        response.headers["X-Page-Size"] = str(page_size)
        query = query.offset((page - 1) * page_size).limit(page_size)

    return query.all()


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    tx_in: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx_in.category_id is not None:
        category = (
            db.query(Category)
            .filter(
                Category.id == tx_in.category_id,
                Category.user_id == current_user.id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=400, detail="Invalid category for this user."
            )

    if tx_in.amount is not None:
        tx.amount = tx_in.amount
    if tx_in.type is not None:
        tx.type = tx_in.type
    if tx_in.description is not None:
        tx.description = tx_in.description
    if tx_in.date is not None:
        tx.date = tx_in.date
    if tx_in.category_id is not None:
        tx.category_id = tx_in.category_id

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()
    return None
