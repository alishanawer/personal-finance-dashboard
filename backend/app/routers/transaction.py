from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.category import Category
from app.models.transaction import Transaction
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
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.date.desc())
        .all()
    )


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
