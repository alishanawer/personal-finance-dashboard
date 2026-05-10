from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.settings import Settings
from app.schemas.settings import SettingsOut, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=SettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    settings = (
        db.query(Settings).filter(Settings.user_id == current_user.id).first()
    )
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/", response_model=SettingsOut)
def update_settings(
    updates: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    settings = (
        db.query(Settings).filter(Settings.user_id == current_user.id).first()
    )
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    if updates.currency is not None:
        settings.currency = updates.currency
    if updates.display_currency is not None:
        settings.display_currency = updates.display_currency
    if updates.theme is not None:
        settings.theme = updates.theme
    if updates.email_notifications is not None:
        settings.email_notifications = updates.email_notifications
    if updates.budget_alerts is not None:
        settings.budget_alerts = updates.budget_alerts
    if updates.weekly_summary is not None:
        settings.weekly_summary = updates.weekly_summary

    db.commit()
    db.refresh(settings)
    return settings
