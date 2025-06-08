from flask import current_app as app,jsonify,request
from flask_security import auth_required,roles_required,current_user,roles_accepted,current_user
from application.models import User,QuizAttempt,Subject,Chapter,Quiz,Question
from application.database import db


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
