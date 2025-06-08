from flask import current_app as app,jsonify
from flask_security import auth_required,roles_required,current_user
@app.route('/admin')#authenication
@auth_required('token')
@roles_required('admin')
def admin_home():
    return {
        "mesaage":"admin login succesfully"
    }

@app.route('/user/<user_id>')
@auth_required('token')
@roles_required('user')
def user_home():
    user = current_user()
    return jsonify({
        "username":user.username,
        "email":user.email,
        "password":user.password
    })