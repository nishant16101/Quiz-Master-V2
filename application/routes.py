from flask import current_app,render_template,request
from flask import Blueprint, jsonify, request, current_app
from flask_security import auth_required,roles_required,current_user,roles_accepted,login_user,logout_user,hash_password
from application.models import User,QuizAttempt,Subject,Chapter,Quiz,Question
from werkzeug.security import check_password_hash, generate_password_hash
from application.database import db
from celery.result import AsyncResult
from flask import send_file
import os
from .task import export_user_quiz_attempts,export_admin_all_users,send_gchat_notification
from .task import csv_report

from flask_security.utils import verify_and_update_password

from datetime import datetime
import bcrypt
from app import app
from application.__init__ import cache,limiter



#--------- admin routes
@app.route('/admin')#authenication
@auth_required('token')
@roles_required('admin')
def admin_home():
    return {
        "mesaage":"admin login succesfully"
    }

#get all users
@app.route('/admin/users',methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_users():
    users = User.query.all()
    return jsonify([
       { "id":user.id,
        "email":user.email,
        "username":user.user_name
        }for user in users
    
    ])

#get a single user by id
@app.route('/admin/user/<int:user_id>',methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.user_name
    })


#delete user
@app.route('/admin/user/<int:user_id>',methods=['DELETE'])
@auth_required('token')
@roles_accepted('admin')
@limiter.limit("5 per minute")
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return {"message":"User deleted successfully"}

# ===== SUBJECT CRUD =====

# Create Subject
@app.route('/admin/subject', methods=['POST'])
@auth_required('token')
@roles_required('admin')
@limiter.limit("10 per minute")
def create_subject():
    data = request.json
    subject = Subject(name=data['name'])
    db.session.add(subject)
    db.session.commit()
    return {"message": "Subject created", "id": subject.id}

# Read All Subjects
@app.route('/admin/subjects', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_subjects():
    subjects = Subject.query.all()
    return jsonify([{
        "id": subject.id,
        "name": subject.name,
        "chapters_count": len(subject.chapters) if hasattr(subject, 'chapters') else 0
    } for subject in subjects])

# Read Single Subject
@app.route('/admin/subject/<int:subject_id>', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    return jsonify({
        "id": subject.id,
        "name": subject.name,
        "chapters": [{
            "id": chapter.id,
            "name": chapter.name
        } for chapter in subject.chapters] if hasattr(subject, 'chapters') else []
    })

# Update Subject
@app.route('/admin/subject/<int:subject_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
@limiter.limit("10 per minute")
def update_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    data = request.json
    subject.name = data.get('name', subject.name)
    db.session.commit()
    return {"message": "Subject updated"}

# Delete Subject
@app.route('/admin/subject/<int:subject_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    db.session.delete(subject)
    db.session.commit()
    return {"message": "Subject deleted"}

# ===== CHAPTER CRUD =====

# Create Chapter
@app.route('/admin/subject/<int:subject_id>/chapter', methods=['POST'])
@auth_required('token')
@roles_required('admin')
@limiter.limit("10 per minute")
def create_chapter(subject_id):
    data = request.json
    chapter = Chapter(name=data['name'], subject_id=subject_id)
    db.session.add(chapter)
    db.session.commit()
    return {"message": "Chapter created", "id": chapter.id}

# Read All Chapters
@app.route('/admin/chapters', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_chapters():
    chapters = Chapter.query.all()
    return jsonify([{
        "id": chapter.id,
        "name": chapter.name,
        "subject_id": chapter.subject_id,
        "subject_name": chapter.subject.name if hasattr(chapter, 'subject') else None,
        "quizzes_count": len(chapter.quizzes) if hasattr(chapter, 'quizzes') else 0
    } for chapter in chapters])

# Read Chapters by Subject
@app.route('/admin/subject/<int:subject_id>/chapters', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_chapters_by_subject(subject_id):
    chapters = Chapter.query.filter_by(subject_id=subject_id).all()
    return jsonify([{
        "id": chapter.id,
        "name": chapter.name,
        "subject_id": chapter.subject_id,
        "quizzes_count": len(chapter.quizzes) if hasattr(chapter, 'quizzes') else 0
    } for chapter in chapters])

@app.route('/admin/chapter/<int:chapter_id>', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_chapter(chapter_id):
    chapter = Chapter.query.get_or_404(chapter_id)
    return jsonify({
        "id": chapter.id,
        "name": chapter.name,
        "subject_id": chapter.subject_id,
        "subject_name": chapter.subject.name if hasattr(chapter, 'subject') else None,
        "quizzes": [{
            "id": quiz.id,
            "name": quiz.name
        } for quiz in chapter.quizzes] if hasattr(chapter, 'quizzes') else []
    })

# Update Chapter
@app.route('/admin/chapter/<int:chapter_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
@limiter.limit("10 per minute")
def update_chapter(chapter_id):
    chapter = Chapter.query.get_or_404(chapter_id)
    data = request.json
    chapter.name = data.get('name', chapter.name)
    if 'subject_id' in data:
        chapter.subject_id = data['subject_id']
    db.session.commit()
    return {"message": "Chapter updated"}

# Delete Chapter
@app.route('/admin/chapter/<int:chapter_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_chapter(chapter_id):
    chapter = Chapter.query.get_or_404(chapter_id)
    db.session.delete(chapter)
    db.session.commit()
    return {"message": "Chapter deleted"}


# ===== QUIZ CRUD =====

# Create Quiz
@app.route('/admin/chapter/<int:chapter_id>/quiz', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_quiz(chapter_id):
    data = request.json
    quiz = Quiz(
        title=data['name'],  # Frontend sends 'name', but model uses 'title'
        duration=data.get('duration', 30),  # Default 30 minutes if not provided
        chapter_id=chapter_id
    )
    db.session.add(quiz)
    db.session.commit()
    return {"message": "Quiz created", "id": quiz.id}

# Read All Quizzes
@app.route('/admin/quizzes', methods=['GET'])
@auth_required('token')
@roles_required('admin')
@cache.cached(timeout=60)
def get_all_quizzes():
    quizzes = Quiz.query.all()
    return jsonify([{
        "id": quiz.id,
        "name": quiz.title,  # Map 'title' to 'name' for frontend
        "title": quiz.title,
        "duration": quiz.duration,
        "chapter_id": quiz.chapter_id,
        "chapter_name": quiz.chapter.name if hasattr(quiz, 'chapter') else None,
        "subject_name": quiz.chapter.subject.name if hasattr(quiz, 'chapter') and hasattr(quiz.chapter, 'subject') else None,
        "questions_count": len(quiz.questions) if hasattr(quiz, 'questions') else 0
    } for quiz in quizzes])

# Read Quizzes by Chapter
@app.route('/admin/chapter/<int:chapter_id>/quizzes', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_quizzes_by_chapter(chapter_id):
    quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
    return jsonify([{
        "id": quiz.id,
        "name": quiz.title,  # Map 'title' to 'name' for frontend
        "title": quiz.title,
        "duration": quiz.duration,
        "chapter_id": quiz.chapter_id,
        "questions_count": len(quiz.questions) if hasattr(quiz, 'questions') else 0
    } for quiz in quizzes])

# Read Single Quiz
@app.route('/admin/quiz/<int:quiz_id>', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    return jsonify({
        "id": quiz.id,
        "name": quiz.title,  # Map 'title' to 'name' for frontend
        "title": quiz.title,
        "duration": quiz.duration,
        "chapter_id": quiz.chapter_id,
        "chapter_name": quiz.chapter.name if hasattr(quiz, 'chapter') else None,
        "subject_name": quiz.chapter.subject.name if hasattr(quiz, 'chapter') and hasattr(quiz.chapter, 'subject') else None,
        "questions": [{
            "id": question.id,
            "text": question.content,  # Map 'content' to 'text' for frontend
            "content": question.content,
            "options": [
                question.option_a,
                question.option_b, 
                question.option_c,
                question.option_d
            ],
            "correct_answer": ['A', 'B', 'C', 'D'].index(question.correct_answer) if question.correct_answer in ['A', 'B', 'C', 'D'] else 0
        } for question in quiz.questions] if hasattr(quiz, 'questions') else []
    })

# Update Quiz
@app.route('/admin/quiz/<int:quiz_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def update_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    data = request.json
    
    quiz.title = data.get('name', quiz.title)  # Frontend sends 'name'
    if 'duration' in data:
        quiz.duration = data['duration']
    if 'chapter_id' in data:
        quiz.chapter_id = data['chapter_id']
    
    db.session.commit()
    return {"message": "Quiz updated"}

# Delete Quiz
@app.route('/admin/quiz/<int:quiz_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    db.session.delete(quiz)
    db.session.commit()
    return {"message": "Quiz deleted"}

# ===== QUESTION CRUD =====

# Create Question
@app.route('/admin/quiz/<int:quiz_id>/questions', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def add_question_to_quiz(quiz_id):
    data = request.get_json()
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Convert frontend format to your model format
    options = data['options']  # Should be a list like ['Option A', 'Option B', 'Option C', 'Option D']
    correct_index = data['correct_answer']  # Index (0, 1, 2, 3)
    correct_letter = ['A', 'B', 'C', 'D'][correct_index]  # Convert to letter
    
    question = Question(
        content=data['text'],  # Frontend sends 'text', model uses 'content'
        option_a=options[0] if len(options) > 0 else '',
        option_b=options[1] if len(options) > 1 else '',
        option_c=options[2] if len(options) > 2 else '',
        option_d=options[3] if len(options) > 3 else '',
        correct_answer=correct_letter,
        quiz_id=quiz_id
    )
    db.session.add(question)
    db.session.commit()
    return jsonify({"message": "Question added successfully", "question_id": question.id}), 201

# Read Questions by Quiz
@app.route('/admin/quiz/<int:quiz_id>/questions', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_questions_by_quiz(quiz_id):
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    return jsonify([{
        "id": question.id,
        "text": question.content,
        "content": question.content,
        "options": [
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d
        ],
        "correct_answer": ['A', 'B', 'C', 'D'].index(question.correct_answer) if question.correct_answer in ['A', 'B', 'C', 'D'] else 0,
        "quiz_id": question.quiz_id
    } for question in questions])

# Update Question
@app.route('/admin/question/<int:question_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def update_question(question_id):
    question = Question.query.get_or_404(question_id)
    data = request.json
    if 'text' in data:
        question.content = data['text']
    if 'options' in data:
        options = data['options']
        question.option_a = options[0] if len(options) > 0 else question.option_a
        question.option_b = options[1] if len(options) > 1 else question.option_b
        question.option_c = options[2] if len(options) > 2 else question.option_c
        question.option_d = options[3] if len(options) > 3 else question.option_d
    if 'correct_answer' in data:
        correct_index = data['correct_answer']
        question.correct_answer = ['A', 'B', 'C', 'D'][correct_index]
    db.session.commit()
    return {"message": "Question updated"}

# Delete Question
@app.route('/admin/question/<int:question_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_question(question_id):
    question = Question.query.get_or_404(question_id)
    db.session.delete(question)
    db.session.commit()
    return {"message": "Question deleted"}

#===================User routes
#user registration
@app.route('/user/register', methods=['POST'])
def user_register():
    data = request.json
    # Check if user is existing
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exist"}), 409
    
    # Check if username is existing
    if User.query.filter_by(user_name=data['user_name']).first():
        return jsonify({"error": "Username already exist"}), 409

    hashed_password = hash_password(data['password'])
    user = User(email=data['email'], user_name=data['user_name'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

#user login
@app.route('/api/login',methods=['POST'])
def user_login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    
    
    if user and verify_and_update_password(data.get('password'), user):
        db.session.commit() 
            
        login_user(user, remember=data.get('rememberMe', False))
        return jsonify({
            "message": "Login successful!",
            "auth_token": user.get_auth_token(),
            "user": {
                "id": user.id,
                "username": user.user_name,
                "email": user.email,
                "roles": [role.name for role in user.roles]
            }
        })
    return jsonify({"error": "Invalid credentials"}), 401

#user logout
@app.route('/user/logout', methods=['POST'])
@auth_required('token')
def user_logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

#get user profile
@app.route('/user/profile', methods=['GET'])
@auth_required('token')
def get_user_profile():
    user_attempts = QuizAttempt.query.filter_by(user_id=current_user.id).all()
    performance_by_subject = {}
    for attempt in user_attempts:
        subject_name = attempt.quiz.chapter.subject.name if attempt.quiz and attempt.quiz.chapter and attempt.quiz.chapter.subject else "Unknown"
        if subject_name not in performance_by_subject:
            performance_by_subject[subject_name] = {'total_score': 0, 'total_quizzes': 0}
        performance_by_subject[subject_name]['total_score'] += attempt.score
        performance_by_subject[subject_name]['total_quizzes'] += 1

    subject_performance_list = []
    for subject, data in performance_by_subject.items():
        avg_score = (data['total_score'] / data['total_quizzes']) if data['total_quizzes'] > 0 else 0
        subject_performance_list.append({
            'subject_name': subject,
            'average_score': round(avg_score, 2),
            'quizzes_attempted': data['total_quizzes']
        })

    return jsonify({
        "id": current_user.id,
        "username": current_user.user_name,
        "email": current_user.email,
        "total_quizzes_attempted": len(user_attempts),
        "performance_by_subject": subject_performance_list
    })

#update user profile
@app.route('/user/profile', methods=['PUT'])
@auth_required('token')
def update_user_profile():
    data = request.json
    user = current_user

    if 'username' in data:
        user.user_name = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data and data['password']:
        # This will securely update the password hash
        if not verify_and_update_password(data['password'], user):
            return jsonify({"error": "Failed to update password"}), 400
    
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200

#delete user account
@app.route('/user/profile', methods=['DELETE'])
@auth_required('token')
def delete_user_account():
    user = current_user
    db.session.delete(user)
    db.session.commit()
    logout_user() # Log out the user after deleting the account
    return jsonify({"message": "Account deleted successfully"}), 200

# Get all subjects for a user
@app.route('/user/subjects', methods=['GET'])
@auth_required('token')
@cache.cached(timeout=60, key_prefix="user_subjects_")
def get_user_subjects():
    subjects = Subject.query.all()
    subjects_data = []
    for subject in subjects:
        chapters_data = []
        for chapter in subject.chapters:
            quizzes_data = []
            for quiz in chapter.quizzes:
                last_attempt = QuizAttempt.query.filter_by(
                    user_id=current_user.id, quiz_id=quiz.id
                ).order_by(QuizAttempt.date_attempted.desc()).first()
                quizzes_data.append({
                    "id": quiz.id,
                    "title": quiz.title,
                    "duration": quiz.duration,
                    "questions_count": len(quiz.questions),
                    "last_attempt_score": last_attempt.score if last_attempt else None,
                    "last_attempt_date": last_attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S') if last_attempt else None
                })
            chapters_data.append({
                "id": chapter.id,
                "name": chapter.name,
                "description": chapter.description,
                "quizzes": quizzes_data
            })
        subjects_data.append({
            "id": subject.id,
            "name": subject.name,
            "chapters": chapters_data
        })
    return jsonify(subjects_data)

# Get a single subject with its chapters for a user
@app.route('/user/subject/<int:subject_id>', methods=['GET'])
@auth_required('token')
def get_user_subject(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    chapters_data = []
    for chapter in subject.chapters:
        quizzes_data = []
        for quiz in chapter.quizzes:
            last_attempt = QuizAttempt.query.filter_by(
                user_id=current_user.id, quiz_id=quiz.id
            ).order_by(QuizAttempt.date_attempted.desc()).first()
            quizzes_data.append({
                "id": quiz.id,
                "title": quiz.title,
                "duration": quiz.duration,
                "questions_count": len(quiz.questions),
                "last_attempt_score": last_attempt.score if last_attempt else None,
                "last_attempt_date": last_attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S') if last_attempt else None
            })
        chapters_data.append({
            "id": chapter.id,
            "name": chapter.name,
            "description": chapter.description,
            "quizzes": quizzes_data
        })
    return jsonify({
        "id": subject.id,
        "name": subject.name,
        "chapters": chapters_data
    })

# Get a single chapter with its quizzes for a user
@app.route('/user/chapter/<int:chapter_id>', methods=['GET'])
@auth_required('token')
def get_user_chapter(chapter_id):
    try:
        chapter = Chapter.query.get_or_404(chapter_id)
        quizzes_data = []

        # Ensure chapter.quizzes is iterable and not None
        if chapter.quizzes:
            for quiz in chapter.quizzes:
                # Defensive check: Ensure quiz is not None before accessing attributes
                if quiz is None:
                    app.logger.warning(f"Found None quiz object in chapter {chapter_id}'s quizzes. Skipping.")
                    continue

                # Defensive access to quiz attributes
                quiz_id = quiz.id if hasattr(quiz, 'id') else None
                quiz_title = quiz.title if hasattr(quiz, 'title') else "Unknown Quiz"
                quiz_duration = quiz.duration if hasattr(quiz, 'duration') else 0
                
                # Check if quiz_id is valid before querying QuizAttempt
                user_attempts_for_quiz = []
                if quiz_id is not None:
                    user_attempts_for_quiz = QuizAttempt.query.filter_by(
                        user_id=current_user.id, quiz_id=quiz_id
                    ).all()

                questions_count = len(quiz.questions) if hasattr(quiz, 'questions') and quiz.questions is not None else 0

                attempts_data = []
                for attempt in user_attempts_for_quiz:
                    attempts_data.append({
                        "score": attempt.score,
                        "date_attempted": attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
                    })

                quizzes_data.append({
                    "id": quiz_id,
                    "title": quiz_title,
                    "duration": quiz_duration,
                    "questions_count": questions_count,
                    "user_attempts": attempts_data
                })
        
        # Safely access subject information
        subject_data = None
        if chapter.subject:
            subject_data = {
                "id": chapter.subject.id,
                "name": chapter.subject.name
            }

        return jsonify({
            "id": chapter.id,
            "name": chapter.name,
            "description": chapter.description,
            "subject": subject_data,
            "quizzes": quizzes_data
        })
    except Exception as e:
        app.logger.error(f"Error fetching user chapter {chapter_id}: {e}")
        return jsonify({"error": "Failed to fetch chapter details", "details": str(e)}), 500

# User attempts quiz - GET quiz data
@app.route('/user/quiz/<int:quiz_id>', methods=['GET'])
@auth_required('token')
def get_user_quiz(quiz_id):
    try:
        quiz = Quiz.query.get_or_404(quiz_id)

        # Prepare questions for the user (without correct answers)
        questions_data = []
        for question in quiz.questions:
            questions_data.append({
                "id": question.id,
                "content": question.content,
                "options": {
                    'A': question.option_a,
                    'B': question.option_b,
                    'C': question.option_c,
                    'D': question.option_d
                }
            })
        
        chapter_name = quiz.chapter.name if quiz.chapter else None
        subject_name = quiz.chapter.subject.name if quiz.chapter and quiz.chapter.subject else None

        return jsonify({
            "id": quiz.id,
            "title": quiz.title,
            "duration": quiz.duration,
            "chapter_id": quiz.chapter.id if quiz.chapter else None, # Added chapter_id
            "chapter": chapter_name,
            "subject_id": quiz.chapter.subject.id if quiz.chapter and quiz.chapter.subject else None, # Added subject_id
            "subject": subject_name,
            "questions": questions_data
        })
    except Exception as e:
        app.logger.error(f"Error fetching user quiz {quiz_id}: {e}")
        return jsonify({"error": "Failed to fetch quiz details", "details": str(e)}), 500



# User submits quiz
@app.route('/user/quiz/<int:quiz_id>/submit', methods=['POST'])
@auth_required('token')
def submit_quiz_attempt(quiz_id):
    data = request.json
    user_answers = data.get('answers', {})
    
    quiz = Quiz.query.get_or_404(quiz_id)
    
    correct_answers_count = 0
    total_questions = len(quiz.questions)
    detailed_results = []

    for question in quiz.questions:
        user_answer_key = user_answers.get(str(question.id)) # user_answers keys are strings
        
        is_correct = False
        if user_answer_key and user_answer_key == question.correct_answer:
            is_correct = True
            correct_answers_count += 1
        
        options_dict = {
            'A': question.option_a,
            'B': question.option_b,
            'C': question.option_c,
            'D': question.option_d
        }

        detailed_results.append({
            "question_id": question.id,
            "question": question.content,
            "options": options_dict,
            "user_answer": user_answer_key,
            "correct_answer": question.correct_answer,
            "is_correct": is_correct
        })

    
    score_percentage = (correct_answers_count / total_questions) * 100 if total_questions > 0 else 0
    score_percentage = round(score_percentage, 2)

    # Save the quiz attempt
    new_attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score_percentage,
        date_attempted=datetime.now()
    )
    db.session.add(new_attempt)
    try:
        db.session.commit()

        # Get user details for the notification
        user = User.query.get(current_user.id)
        if user:

            send_gchat_notification.delay(user.user_name, quiz.title, score_percentage)
            current_app.logger.info(f"G-Chat notification task queued for user {user.user_name}.")

        return jsonify({
            "message": "Quiz submitted successfully and notification queued!",
            "score": {
                "percentage": score_percentage,
                "correct_answers": correct_answers_count,
                "total_questions": total_questions
            },
            "results": detailed_results
        })

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error submitting quiz attempt: {e}")
        return jsonify({"message": "Failed to submit quiz attempt", "error": str(e)}), 500

# Get quiz history for a user
@app.route('/user/attempts', methods=['GET'])
@auth_required('token')
def get_user_attempts():
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).order_by(QuizAttempt.date_attempted.desc()).all()
    return jsonify([{
        "id": attempt.id,
        "quiz_title": attempt.quiz.title if attempt.quiz else "Unknown Quiz",
        "subject_name": attempt.quiz.chapter.subject.name if attempt.quiz and attempt.quiz.chapter and attempt.quiz.chapter.subject else "Unknown Subject",
        "chapter_name": attempt.quiz.chapter.name if attempt.quiz and attempt.quiz.chapter else "Unknown Chapter",
        "score": attempt.score,
        "date_attempted": attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
    } for attempt in attempts])

# Get performance by subject for a user
@app.route('/user/performance', methods=['GET'])
@auth_required('token')
def get_user_performance():
    performance_data = {}
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).all()

    for attempt in attempts:
        if attempt.quiz and attempt.quiz.chapter and attempt.quiz.chapter.subject:
            subject_name = attempt.quiz.chapter.subject.name
            if subject_name not in performance_data:
                performance_data[subject_name] = {
                    'total_score': 0,
                    'attempt_count': 0,
                    'best_score': 0 # Initialize best_score
                }
            performance_data[subject_name]['total_score'] += attempt.score
            performance_data[subject_name]['attempt_count'] += 1
            # Update best_score if current attempt's score is higher
            performance_data[subject_name]['best_score'] = max(
                performance_data[subject_name]['best_score'], 
                attempt.score
            )
    
    result = []
    for subject, data in performance_data.items():
        avg_score = (data['total_score'] / data['attempt_count']) if data['attempt_count'] > 0 else 0
        result.append({
            "subject_name": subject,
            "average_score": round(avg_score, 2),
            "total_attempts": data['attempt_count'],
            "best_score": data['best_score'] # Include best_score in the response
        })
    return jsonify(result)

@app.route('/api/leaderboard/<int:quiz_id>', methods=['GET'])
def get_leaderboard(quiz_id):
    # Subquery to get the best score for each user for the given quiz
    subquery = db.session.query(
        QuizAttempt.user_id,
        db.func.max(QuizAttempt.score).label('best_score')
    ).filter_by(quiz_id=quiz_id).group_by(QuizAttempt.user_id).subquery()
    
    leaderboard = db.session.query(
        QuizAttempt, User
    ).join(User).join(
        subquery, 
        db.and_(
            QuizAttempt.user_id == subquery.c.user_id,
            QuizAttempt.score == subquery.c.best_score,
            QuizAttempt.quiz_id == quiz_id
        )
    ).order_by(QuizAttempt.score.desc()).limit(10).all()
    
    quiz = Quiz.query.get_or_404(quiz_id)
    
    return jsonify({
        "quiz": {
            "id": quiz.id,
            "title": quiz.title
        },
        "leaderboard": [{
            "rank": idx + 1,
            "username": user.user_name,
            "score": attempt.score,
            "date_attempted": attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
        } for idx, (attempt, user) in enumerate(leaderboard)]
    })
@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        # Fetch counts from the database
        total_quizzes = Quiz.query.count()
        total_users = User.query.count()
        total_subjects = Subject.query.count()
        total_attempts = QuizAttempt.query.count()
        
        return jsonify({
            'totalQuizzes': total_quizzes,      # Changed to camelCase
            'totalUsers': total_users,          # Changed to camelCase
            'totalSubjects': total_subjects,    # Changed to camelCase
            'totalAttempts': total_attempts     # Changed to camelCase
        }), 200
    
    except Exception as e:
        app.logger.error(f"Error fetching stats: {e}")
        return jsonify({"error": "Failed to fetch statistics"}), 500
    

@app.route('/api/export/user/quiz-attempts', methods=['POST'])
@auth_required('token')
def trigger_user_csv_export():
    """
    Trigger CSV export for current user's quiz attempts
    """
    try:
        # Get current user's ID from the authenticated session
        user_id = current_user.id
        
        # Start the background task with actual user ID
        task = export_user_quiz_attempts.delay(user_id)
        
        return jsonify({
            "message": "CSV export started",
            "task_id": task.id,
            "status": "processing"
        }), 202
        
    except Exception as e:
        app.logger.error(f"Error triggering user CSV export: {e}")
        return jsonify({"error": "Failed to start export"}), 500

# Admin CSV Export Routes
@app.route('/api/admin/export/users', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def trigger_admin_users_export():
    """
    Trigger CSV export for all users (admin only)
    """
    try:
        # Start the background task
        task = export_admin_all_users.delay()
        
        return jsonify({
            "message": "Admin users export started",
            "task_id": task.id,
            "status": "processing"
        }), 202
        
    except Exception as e:
        app.logger.error(f"Error triggering admin users export: {e}")
        return jsonify({"error": "Failed to start export"}), 500

# Task Status Check Route
@app.route('/api/export/status/<task_id>', methods=['GET'])
@auth_required('token')
def check_export_status(task_id):
    """
    Check the status of an export task
    """
    try:
        # Get task result using AsyncResult
        task_result = AsyncResult(task_id)
        
        if task_result.state == 'PENDING':
            response = {
                'state': task_result.state,
                'status': 'Task is waiting to be processed'
            }
        elif task_result.state == 'PROGRESS':
            response = {
                'state': task_result.state,
                'status': 'Task is being processed'
            }
        elif task_result.state == 'SUCCESS':
            response = {
                'state': task_result.state,
                'status': 'Task completed successfully',
                'result': task_result.result
            }
        elif task_result.state == 'FAILURE':
            response = {
                'state': task_result.state,
                'status': 'Task failed',
                'error': str(task_result.info)
            }
        else:
            response = {
                'state': task_result.state,
                'status': f'Task state: {task_result.state}'
            }
        
        return jsonify(response), 200
        
    except Exception as e:
        app.logger.error(f"Error checking task status: {e}")
        return jsonify({"error": "Failed to check task status"}), 500

# File Download Route
@app.route('/api/export/download/<task_id>', methods=['GET'])
@auth_required('token')
def download_export_file(task_id):
    """
    Download the generated CSV file
    """
    try:
        # Get task result
        task_result = AsyncResult(task_id)
        
        if task_result.state != 'SUCCESS':
            return jsonify({"error": "Task not completed or failed"}), 400
        
        result = task_result.result
        if 'file_path' not in result:
            return jsonify({"error": "No file available for download"}), 404
        
        file_path = result['file_path']
        filename = result['filename']
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        # Send file as download
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='text/csv'
        )
        
    except Exception as e:
        app.logger.error(f"Error downloading file: {e}")
        return jsonify({"error": "Failed to download file"}), 500

# Alternative: Direct download with file cleanup
@app.route('/api/export/download-and-cleanup/<task_id>', methods=['GET'])
@auth_required('token')
def download_and_cleanup_export_file(task_id):
    """
    Download the CSV file and clean up the temporary file
    """
    try:
        # Get task result
        task_result = AsyncResult(task_id)
        
        if task_result.state != 'SUCCESS':
            return jsonify({"error": "Task not completed or failed"}), 400
        
        result = task_result.result
        if 'file_path' not in result:
            return jsonify({"error": "No file available for download"}), 404
        
        file_path = result['file_path']
        filename = result['filename']
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        def remove_file(response):
            try:
                os.remove(file_path)
            except Exception as e:
                app.logger.error(f"Error removing temp file: {e}")
            return response
        
        # Send file as download and cleanup afterwards
        response = send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='text/csv'
        )
        
        # Register cleanup function to run after response
        response.call_on_close(lambda: os.remove(file_path) if os.path.exists(file_path) else None)
        
        return response
        
    except Exception as e:
        app.logger.error(f"Error downloading file: {e}")
        return jsonify({"error": "Failed to download file"}), 500

# Bulk task status check (optional - for multiple tasks)
@app.route('/api/export/status/bulk', methods=['POST'])
@auth_required('token')
def check_bulk_export_status():
    """
    Check status of multiple export tasks
    """
    try:
        from flask import request
        
        data = request.get_json()
        task_ids = data.get('task_ids', [])
        
        if not task_ids:
            return jsonify({"error": "No task IDs provided"}), 400
        
        results = {}
        for task_id in task_ids:
            task_result = AsyncResult(task_id)
            results[task_id] = {
                'state': task_result.state,
                'ready': task_result.ready(),
                'successful': task_result.successful() if task_result.ready() else False
            }
        
        return jsonify({"results": results}), 200
        
    except Exception as e:
        app.logger.error(f"Error checking bulk task status: {e}")
        return jsonify({"error": "Failed to check bulk task status"}), 500

