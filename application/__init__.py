from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_security import Security, SQLAlchemySessionUserDatastore
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


db = SQLAlchemy()
mail = Mail()
security = Security()
cache = Cache()
limiter = Limiter(key_func=get_remote_address)

def get_user_datastore(db_session,User,Role):
    return SQLAlchemySessionUserDatastore(db_session,User,Role)
