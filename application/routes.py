from flask import current_app as app,jsonify,request,render_template
from flask_security import auth_required,roles_required,current_user,roles_accepted,current_user,login_user,logout_user
from application.models import User,QuizAttempt,Subject,Chapter,Quiz,Question
from werkzeug.security import check_password_hash, generate_password_hash
from application.database import db
from flask_security.utils import verify_and_update_password
from datetime import datetime
import bcrypt
from app import app


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

# Read Single Chapter
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
    quiz = Quiz(name=data['name'], chapter_id=chapter_id)
    db.session.add(quiz)
    db.session.commit()
    return {"message": "Quiz created", "id": quiz.id}

# Read All Quizzes
@app.route('/admin/quizzes', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_quizzes():
    quizzes = Quiz.query.all()
    return jsonify([{
        "id": quiz.id,
        "name": quiz.name,
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
        "name": quiz.name,
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
        "name": quiz.name,
        "chapter_id": quiz.chapter_id,
        "chapter_name": quiz.chapter.name if hasattr(quiz, 'chapter') else None,
        "subject_name": quiz.chapter.subject.name if hasattr(quiz, 'chapter') and hasattr(quiz.chapter, 'subject') else None,
        "questions": [{
            "id": question.id,
            "text": question.text,
            "options": question.options,
            "correct_answer": question.correct_answer
        } for question in quiz.questions] if hasattr(quiz, 'questions') else []
    })

# Update Quiz
@app.route('/admin/quiz/<int:quiz_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def update_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    data = request.json
    quiz.name = data.get('name', quiz.name)
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
    
    question = Question(
        text=data['text'],
        options=data['options'],  # Should be a list
        correct_answer=data['correct_answer'],
        quiz=quiz
    )
    db.session.add(question)
    db.session.commit()
    return jsonify({"message": "Question added successfully", "question_id": question.id}), 201

# Read All Questions
@app.route('/admin/questions', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_questions():
    questions = Question.query.all()
    return jsonify([{
        "id": question.id,
        "text": question.text,
        "options": question.options,
        "correct_answer": question.correct_answer,
        "quiz_id": question.quiz_id,
        "quiz_name": question.quiz.name if hasattr(question, 'quiz') else None,
        "chapter_name": question.quiz.chapter.name if hasattr(question, 'quiz') and hasattr(question.quiz, 'chapter') else None,
        "subject_name": question.quiz.chapter.subject.name if hasattr(question, 'quiz') and hasattr(question.quiz, 'chapter') and hasattr(question.quiz.chapter, 'subject') else None
    } for question in questions])

# Read Questions by Quiz
@app.route('/admin/quiz/<int:quiz_id>/questions', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_questions_by_quiz(quiz_id):
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    return jsonify([{
        "id": question.id,
        "text": question.text,
        "options": question.options,
        "correct_answer": question.correct_answer,
        "quiz_id": question.quiz_id
    } for question in questions])

# Read Single Question
@app.route('/admin/question/<int:question_id>', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_question(question_id):
    question = Question.query.get_or_404(question_id)
    return jsonify({
        "id": question.id,
        "text": question.text,
        "options": question.options,
        "correct_answer": question.correct_answer,
        "quiz_id": question.quiz_id,
        "quiz_name": question.quiz.name if hasattr(question, 'quiz') else None,
        "chapter_name": question.quiz.chapter.name if hasattr(question, 'quiz') and hasattr(question.quiz, 'chapter') else None,
        "subject_name": question.quiz.chapter.subject.name if hasattr(question, 'quiz') and hasattr(question.quiz, 'chapter') and hasattr(question.quiz.chapter, 'subject') else None
    })

# Update Question
@app.route('/admin/question/<int:question_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def update_question(question_id):
    question = Question.query.get_or_404(question_id)
    data = request.json
    
    question.text = data.get('text', question.text)
    question.options = data.get('options', question.options)
    question.correct_answer = data.get('correct_answer', question.correct_answer)
    if 'quiz_id' in data:
        question.quiz_id = data['quiz_id']
    
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
    return jsonify({"message": f"Question id {question_id} deleted successfully"}), 200



#===================User routes
#user registration
@app.route('/user/register', methods=['POST'])
def user_register():
    data = request.json
    
    # Check if user is existing
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exist and user registered"}), 400
    
    if User.query.filter_by(user_name=data['user_name']).first():
        return jsonify({"error": "User name already taken"}), 400  # Added status code
    
    user = User(
        user_name=data['user_name'],
        email=data['email'],
        password=generate_password_hash(data['password']),  # This is correct
        active=True
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully", "user":{
        "id":user.id,
        "email":user.email,
        "password":user.password,
        "user_name":user.user_name
    }}), 201

# Login

@app.route('/api/login', methods=['POST'])
def user_login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()

    if verify_and_update_password(data['password'], user):
        login_user(user)

        
        token = user.get_auth_token()

        return jsonify({
            "message": "Login successful",
            "auth_token": token,  # ✅ Include this
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.user_name,
                "roles": [role.name for role in user.roles] if user.roles else []
            }
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401


#user home
@app.route('/api/home')
@auth_required('token')
@roles_required('user')
def user_home():
    user = current_user
    return jsonify({
        "username":user.user_name,
        "email":user.email,
        
    })
# User Logout
@app.route('/user/logout', methods=['POST'])
@auth_required('token')
def user_logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


#get user profile
@app.route('/user/profile',methods=['GET'])
@auth_required('token')
def get_user_profile():
    user = current_user
    attempts = QuizAttempt.query.filter_by(user_id=user.id).all()
    subject_summary = {}
    for attempt in attempts:
        subject = attempt.quiz.chapter.subject
        subject_name = subject.name
        if subject_name not in subject_summary:
            subject_summary[subject_name] = {
                "subject_id":subject.id,
                "subject_name":subject.name,
                "quizzes_attempted":0,
                "total_score":0.0
            }
        subject_summary[subject_name]["quizzes_attempted"] +=1
        subject_summary[subject_name]["total_score"] += attempt.score
    return jsonify({
        "id": user.id,
        "username": user.user_name,
        "email": user.email,
        "subject_statistics": list(subject_summary.values()),
        "recent_attempts": [{
            "quiz_id": attempt.quiz_id,
            "quiz_title": attempt.quiz.title,
            "score": attempt.score,
            "subject": attempt.quiz.chapter.subject.name,
            "date_attempted": attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
        } for attempt in attempts[-5:]]  # Last 5 attempts
    })

# Update User Profile
@app.route('/user/profile', methods=['PUT'])
@auth_required('token')
def update_user_profile():
    user = current_user
    data = request.json
    
    # Update username if provided and not taken by another user
    if 'username' in data:
        existing_user = User.query.filter_by(user_name=data['username']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Username already taken"}), 400
        user.user_name = data['username']
    
    # Update email if provided and not taken by another user
    if 'email' in data:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Email already registered"}), 400
        user.email = data['email']
    
    # Update password if provided
    if 'password' in data:
        user.password = generate_password_hash(data['password'])
    
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})

@app.route('/user/subjects', methods=['GET'])
@auth_required('token')
def get_subjects_for_user():
    subjects = Subject.query.all()
    return jsonify([{
        "id": subject.id,
        "name": subject.name,
        "description": subject.description,
        "chapters_count": len(subject.chapters)
    } for subject in subjects])


# Get Subject Details with Chapters
@app.route('/user/subject/<int:subject_id>', methods=['GET'])
@auth_required('token')
def get_subject_details(subject_id):
    subject = Subject.query.get_or_404(subject_id)
    return jsonify({
        "id": subject.id,
        "name": subject.name,
        "description": subject.description,
        "chapters": [{
            "id": chapter.id,
            "name": chapter.name,
            "description": chapter.description,
            "quizzes_count": len(chapter.quizzes)
        } for chapter in subject.chapters]
    })

# Get Chapter Details with Quizzes
@app.route('/user/chapter/<int:chapter_id>', methods=['GET'])
@auth_required('token')
def get_chapter_details(chapter_id):
    chapter = Chapter.query.get_or_404(chapter_id)
    
    # Get user's attempts for quizzes in this chapter
    user_attempts = {}
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).all()
    for attempt in attempts:
        if attempt.quiz.chapter_id == chapter_id:
            if attempt.quiz_id not in user_attempts:
                user_attempts[attempt.quiz_id] = []
            user_attempts[attempt.quiz_id].append({
                "score": attempt.score,
                "date": attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
            })
    
    return jsonify({
        "id": chapter.id,
        "name": chapter.name,
        "description": chapter.description,
        "subject": {
            "id": chapter.subject.id,
            "name": chapter.subject.name
        },
        "quizzes": [{
            "id": quiz.id,
            "title": quiz.title,
            "duration": quiz.duration,
            "questions_count": len(quiz.questions),
            "user_attempts": user_attempts.get(quiz.id, [])
        } for quiz in chapter.quizzes]
    })
# ===== QUIZ ATTEMPT SYSTEM =====

# Start Quiz (Get Quiz Questions)
@app.route('/user/quiz/<int:quiz_id>/start', methods=['GET'])
@auth_required('token')
def start_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Return quiz details without correct answers
    return jsonify({
        "id": quiz.id,
        "title": quiz.title,
        "duration": quiz.duration,
        "chapter": quiz.chapter.name,
        "subject": quiz.chapter.subject.name,
        "questions": [{
            "id": question.id,
            "content": question.content,
            "options": {
                "A": question.option_a,
                "B": question.option_b,
                "C": question.option_c,
                "D": question.option_d
            }
        } for question in quiz.questions]
    })

# Submit Quiz Attempt
@app.route('/user/quiz/<int:quiz_id>/submit', methods=['POST'])
@auth_required('token')
def submit_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    data = request.json
    
    # data should contain: {"answers": {"question_id": "A", "question_id": "B", ...}}
    user_answers = data.get('answers', {})
    
    # Calculate score
    correct_answers = 0
    total_questions = len(quiz.questions)
    detailed_results = []
    
    for question in quiz.questions:
        question_id = str(question.id)
        user_answer = user_answers.get(question_id, "")
        is_correct = user_answer.upper() == question.correct_answer.upper()
        
        if is_correct:
            correct_answers += 1
        
        detailed_results.append({
            "question_id": question.id,
            "question": question.content,
            "user_answer": user_answer,
            "correct_answer": question.correct_answer,
            "is_correct": is_correct,
            "options": {
                "A": question.option_a,
                "B": question.option_b,
                "C": question.option_c,
                "D": question.option_d
            }
        })
    
    # Calculate percentage score
    score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    # Save quiz attempt
    quiz_attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=round(score_percentage, 2),
        date_attempted=datetime.utcnow()
    )
    
    db.session.add(quiz_attempt)
    db.session.commit()
    
    return jsonify({
        "message": "Quiz submitted successfully",
        "attempt_id": quiz_attempt.id,
        "score": {
            "correct_answers": correct_answers,
            "total_questions": total_questions,
            "percentage": round(score_percentage, 2)
        },
        "results": detailed_results
    })

# Get Quiz Attempt Details
@app.route('/user/attempt/<int:attempt_id>', methods=['GET'])
@auth_required('token')
def get_attempt_details(attempt_id):
    attempt = QuizAttempt.query.get_or_404(attempt_id)
    
    # Ensure user can only see their own attempts
    if attempt.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    return jsonify({
        "id": attempt.id,
        "quiz": {
            "id": attempt.quiz.id,
            "title": attempt.quiz.title,
            "chapter": attempt.quiz.chapter.name,
            "subject": attempt.quiz.chapter.subject.name
        },
        "score": attempt.score,
        "date_attempted": attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
    })

# Get User's Quiz History
@app.route('/user/quiz-history', methods=['GET'])
@auth_required('token')
def get_quiz_history():
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).order_by(QuizAttempt.date_attempted.desc()).all()
    
    return jsonify([{
        "attempt_id": attempt.id,
        "quiz": {
            "id": attempt.quiz.id,
            "title": attempt.quiz.title,
            "chapter": attempt.quiz.chapter.name,
            "subject": attempt.quiz.chapter.subject.name
        },
        "score": attempt.score,
        "date_attempted": attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
    } for attempt in attempts])

# Get User's Performance by Subject
@app.route('/user/performance', methods=['GET'])
@auth_required('token')
def get_user_performance():
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).all()
    
    # Group by subject
    subject_performance = {}
    
    for attempt in attempts:
        subject_name = attempt.quiz.chapter.subject.name
        
        if subject_name not in subject_performance:
            subject_performance[subject_name] = {
                "subject_name": subject_name,
                "total_attempts": 0,
                "total_score": 0,
                "best_score": 0,
                "attempts": []
            }
        
        subject_performance[subject_name]["total_attempts"] += 1
        subject_performance[subject_name]["total_score"] += attempt.score
        subject_performance[subject_name]["best_score"] = max(
            subject_performance[subject_name]["best_score"], 
            attempt.score
        )
        subject_performance[subject_name]["attempts"].append({
            "quiz_title": attempt.quiz.title,
            "score": attempt.score,
            "date": attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    # Calculate averages
    for subject in subject_performance.values():
        subject["average_score"] = round(
            subject["total_score"] / subject["total_attempts"], 2
        ) if subject["total_attempts"] > 0 else 0
    
    return jsonify(list(subject_performance.values()))

# ===== LEADERBOARD =====

# Get Quiz Leaderboard
@app.route('/user/quiz/<int:quiz_id>/leaderboard', methods=['GET'])
@auth_required('token')
def get_quiz_leaderboard(quiz_id):
    # Get best attempt for each user for this quiz
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
@app.route('/api/stats',methods=['GET'])
def get_stats():
    try:
        # Fetch counts from the database
        total_quizzes = Quiz.query.count()
        total_users = User.query.count()
        total_subjects = Subject.query.count()
        total_attempts = QuizAttempt.query.count()

        return jsonify({
            "totalQuizzes": total_quizzes,
            "totalUsers": total_users,
            "totalSubjects": total_subjects,
            "totalAttempts": total_attempts
        }), 200

    except Exception as e:
        print("Error fetching stats:", str(e))
        return jsonify({"error": "Unable to fetch statistics"}), 500