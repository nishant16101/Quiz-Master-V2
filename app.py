from flask import Flask
from application.database import db
from application.models import User, Role
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore, hash_password


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db,User,Role)
    app.security = Security(app,datastore)
    app.app_context().push()
    return app
app = create_app()
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template("index.html")
with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name="admin",description="Super User of App")
    app.security.datastore.find_or_create_role(name="user",description="General User of App")
    db.session.commit
    if not app.security.datastore.find_user(email="user@admin.com"):
        app.security.datastore.create_user(
            
            email="user@admin.com",
            user_name="admin01",  # ✅ Correct key
            password=hash_password("1234"),
            roles=['admin']
    )
    if not app.security.datastore.find_user(email="user1@user.com"):
        app.security.datastore.create_user(
            
            email="user1@user.com",
            user_name="user01",  # ✅ Correct key
            password=hash_password("1234"),
            roles=['user']
    )
    db.session.commit()

from application.routes import *  

if __name__ == "__main__":
    app.run(debug=True)
