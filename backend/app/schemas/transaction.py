from datetime import datetime

from pydantic import BaseModel, Field

from app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    amount: float = Field(gt=0)
    type: TransactionType
    description: str | None = None
    date: datetime | None = None
    category_id: int | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: float | None = Field(default=None, gt=0)
    type: TransactionType | None = None
    description: str | None = None
    date: datetime | None = None
    category_id: int | None = None


class TransactionOut(TransactionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
