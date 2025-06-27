import os
class Config:
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    #Flask-Mail configuration
    MAIL_SERVER = 'smtp.googlemail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME','spamofuser55@gmail.com@gmail.com')
    MAIL_PASSOWRD = os.environ.get('MAIL_PASSWORD','9604708144')
    MAIL_DEFAULT_SENDER = 'spamofuser55@gmail.com'

class LocalDevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///lmsv2.sqlite3"

    SECRET_KEY = "this-is-a-secret-key"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "this-is-a-password-salt"
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    SECURITY_API_ENABLED = True
    SECURITY_LOGIN_WITHOUT_CONFIRMATION = True
    WTF_CSRF_ENABLED = False
    SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS = True
    GCHAT_WEBHOOK_URL = os.environ.get('GCHAT_WEBHOOK_URL', 'https://chat.googleapis.com/v1/spaces/AAQAaluKEXM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=subIMzvaaMIDA_ZAksaoKOezRyJDLCp5Cw-b9MCTydc')

