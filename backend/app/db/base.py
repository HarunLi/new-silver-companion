# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa

# Import all models here to ensure they are registered with SQLAlchemy
from app.models.health_record import HealthRecord  # noqa
from app.models.pet import Pet, PetInteraction  # noqa
from app.models.activity import Activity, ActivityParticipant  # noqa
from app.models.guide import Guide, GuideStep  # noqa
from app.models.user import User  # noqa
from app.models.app_user import AppUser  # noqa

# Make sure all models are imported
__all__ = [
    "Base",
    "HealthRecord",
    "Pet",
    "PetInteraction",
    "Activity",
    "ActivityParticipant",
    "Guide",
    "GuideStep",
    "User",
    "AppUser",
]
