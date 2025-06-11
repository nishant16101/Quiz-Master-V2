from flask_security import UserMixin, RoleMixin
from .database import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid

# Association table
roles_users = db.Table(
    'roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)

class User(UserMixin, db.Model):
    name = db.Column(db.String(20),nullable=False)
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    
    active = db.Column(db.Boolean(), default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, default=lambda: str(uuid.uuid4()))
    
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    quiz_attempt = db.relationship('QuizAttempt', backref='user', lazy=True, cascade='all, delete-orphan')


# Rest of your models remain the same...
class Role(RoleMixin, db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String)
    chapters = db.relationship('Chapter', backref='subject', lazy=True, cascade='all,delete-orphan')

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id', ondelete='CASCADE'), nullable=False)
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True, cascade='all, delete-orphan')

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id', ondelete='CASCADE'), nullable=False)
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan')
    attempts = db.relationship('QuizAttempt', backref='quiz', lazy=True, cascade='all, delete-orphan')

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(200), nullable=False)
    option_b = db.Column(db.String(200), nullable=False)
    option_c = db.Column(db.String(200), nullable=False)
    option_d = db.Column(db.String(200), nullable=False)
    correct_answer = db.Column(db.String(200), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)

class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    date_attempted = db.Column(db.DateTime, default=datetime.utcnow)