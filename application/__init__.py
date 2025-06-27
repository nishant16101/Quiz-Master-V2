from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_security import Security, SQLAlchemySessionUserDatastore

db = SQLAlchemy()
mail = Mail()
security = Security()

def get_user_datastore(db_session,User,Role):
    return SQLAlchemySessionUserDatastore(db_session,User,Role)
