from flask import Flask
from application.database import db
from application.models import User, Role
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore, hash_password

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    db.init_app(app)

    # Setup Flask-Security
    user_datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, user_datastore)

    with app.app_context():
        db.create_all()

        # Create roles if they don't exist
        for role_name in ['admin', 'user']:
            if not user_datastore.find_role(role_name):
                user_datastore.create_role(name=role_name)

        # Create admin user
        if not user_datastore.find_user(email="user@admin.com"):
            user_datastore.create_user(
                email="user@admin.com",
                user_name="admin01",
                password=hash_password("1234"),
                roles=[user_datastore.find_or_create_role('admin')]
            )

        # Create regular user
        if not user_datastore.find_user(email="user1@user.com"):
            user_datastore.create_user(
                email="user1@user.com",
                user_name="user01",
                password=hash_password("1234"),
                roles=[user_datastore.find_or_create_role('user')]
            )

        db.session.commit()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
