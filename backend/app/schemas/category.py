from enum import Enum

from pydantic import BaseModel

from app.models.transaction import TransactionType


class CategoryBase(BaseModel):
    name: str
    type: TransactionType
    color: str | None = None
    icon: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    type: TransactionType | None = None
    color: str | None = None
    icon: str | None = None


class CategoryUsageOut(BaseModel):
    category_id: int
    transaction_count: int
    income_total: float
    expense_total: float


class CategoryMergeIn(BaseModel):
    target_id: int


class CategoryOut(CategoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
