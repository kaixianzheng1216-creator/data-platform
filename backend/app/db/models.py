from sqlmodel import SQLModel

from app.modules.files.models import StoredFile  # noqa: F401
from app.modules.users.models import User  # noqa: F401

metadata = SQLModel.metadata
