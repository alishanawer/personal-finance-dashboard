from enum import Enum

from pydantic import BaseModel

from app.models.transaction import TransactionType


class CategoryBase(BaseModel):
    name: str
    type: TransactionType


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    type: TransactionType | None = None


class CategoryOut(CategoryBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
