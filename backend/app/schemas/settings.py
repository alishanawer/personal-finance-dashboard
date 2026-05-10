from pydantic import BaseModel


class SettingsBase(BaseModel):
    currency: str | None = None
    theme: str | None = None


class SettingsUpdate(SettingsBase):
    pass


class SettingsOut(SettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
