from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType
from app.schemas.category import (
    CategoryCreate,
    CategoryMergeIn,
    CategoryOut,
    CategoryUpdate,
    CategoryUsageOut,
)

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=CategoryOut)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Check if category name already exists for this user
    existing = (
        db.query(Category)
        .filter(Category.user_id == current_user.id, Category.name == category_in.name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="Category with this name already exists."
        )

    category = Category(
        name=category_in.name,
        type=category_in.type,
        color=category_in.color,
        icon=category_in.icon,
        user_id=current_user.id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/", response_model=list[CategoryOut])
def list_categories(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    categories = db.query(Category).filter(
        Category.user_id == current_user.id).all()
    return categories


@router.get("/usage", response_model=list[CategoryUsageOut])
def category_usage(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    rows = (
        db.query(
            Category.id.label("category_id"),
            func.count(Transaction.id).label("transaction_count"),
            func.coalesce(
                func.sum(
                    case(
                        (Transaction.type == TransactionType.INCOME,
                         Transaction.amount),
                        else_=0,
                    )
                ),
                0,
            ).label("income_total"),
            func.coalesce(
                func.sum(
                    case(
                        (Transaction.type == TransactionType.EXPENSE,
                         Transaction.amount),
                        else_=0,
                    )
                ),
                0,
            ).label("expense_total"),
        )
        .outerjoin(Transaction, Transaction.category_id == Category.id)
        .filter(Category.user_id == current_user.id)
        .group_by(Category.id)
        .all()
    )
    return [
        CategoryUsageOut(
            category_id=row.category_id,
            transaction_count=row.transaction_count,
            income_total=row.income_total,
            expense_total=row.expense_total,
        )
        for row in rows
    ]


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category_in.name is not None:
        category.name = category_in.name
    if category_in.type is not None:
        category.type = category_in.type
    if category_in.color is not None:
        category.color = category_in.color
    if category_in.icon is not None:
        category.icon = category_in.icon

    db.commit()
    db.refresh(category)
    return category


@router.post("/{category_id}/merge", response_model=CategoryOut)
def merge_category(
    category_id: int,
    payload: CategoryMergeIn,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if category_id == payload.target_id:
        raise HTTPException(
            status_code=400, detail="Cannot merge into the same category")

    source = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    target = (
        db.query(Category)
        .filter(Category.id == payload.target_id, Category.user_id == current_user.id)
        .first()
    )

    if not source or not target:
        raise HTTPException(status_code=404, detail="Category not found")

    db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.category_id == source.id,
    ).update({Transaction.category_id: target.id})

    db.delete(source)
    db.commit()
    db.refresh(target)
    return target


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()
    return None
