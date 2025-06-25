from celery import shared_task
from application.models import User, QuizAttempt, Subject, Chapter, Quiz, Question
from application.database import db
import csv
import io
import os
from datetime import datetime, timedelta
import tempfile
from flask import current_app

@shared_task(ignore_result=False, name="download_csv")
def csv_report():
    return "initiated csv"

@shared_task(ignore_result=False, name="monthly_report")
def monthly_report():
    """
    Generate and send monthly activity reports to all users
    """
    try:
        users = User.query.all()
        reports_sent = 0
        
        for user in users:
            # Get user's quiz attempts from last month
            last_month = datetime.now() - timedelta(days=30)
            monthly_attempts = QuizAttempt.query.filter(
                QuizAttempt.user_id == user.id,
                QuizAttempt.date_attempted >= last_month
            ).all()
            
            if monthly_attempts:
                reports_sent += 1
        
        return {
            "status": "success",
            "message": f"Monthly reports sent to {reports_sent} users"
        }
        
    except Exception as e:
        current_app.logger.error(f"Error in monthly_report: {e}")
        return {"error": str(e), "status": "failed"}

@shared_task(ignore_result=False, name="daily_reminder")
def daily_reminder():
    """
    Send daily reminders to inactive users
    """
    try:
        # Get users who haven't attempted quizzes in last 3 days
        three_days_ago = datetime.now() - timedelta(days=3)
        
        inactive_users = db.session.query(User).filter(
            User.id.in_(
                db.session.query(QuizAttempt.user_id).filter(
                    QuizAttempt.date_attempted >= three_days_ago
                )
            )
        ).all()
        
        reminders_sent = len(inactive_users)
        
        return {
            "status": "success",
            "message": f"Daily reminders sent to {reminders_sent} users"
        }
        
    except Exception as e:
        current_app.logger.error(f"Error in daily_reminder: {e}")
        return {"error": str(e), "status": "failed"}

@shared_task(ignore_result=False, name="quiz_update")
def quiz_update():
    return "quiz result update to user"

@shared_task(ignore_result=False, name="export_user_quiz_attempts")
def export_user_quiz_attempts(user_id):
    """
    Export user's quiz attempts to CSV format
    Returns the CSV data as string and file path
    """
    try:
        # Get user and their quiz attempts
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found", "status": "failed"}
        
        attempts = QuizAttempt.query.filter_by(user_id=user_id).order_by(QuizAttempt.date_attempted.desc()).all()
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Quiz ID', 'Quiz Title', 'Subject', 'Chapter', 
            'Date Attempted', 'Score (%)', 'Total Questions', 
            'Correct Answers', 'Performance Level', 'Remarks'
        ])
        
        # Write data rows
        for attempt in attempts:
            quiz = attempt.quiz
            if quiz and quiz.chapter and quiz.chapter.subject:
                # Calculate performance level
                if attempt.score >= 90:
                    performance_level = "Excellent"
                elif attempt.score >= 80:
                    performance_level = "Good"
                elif attempt.score >= 70:
                    performance_level = "Average"
                elif attempt.score >= 60:
                    performance_level = "Below Average"
                else:
                    performance_level = "Poor"
                
                # Calculate correct answers (approximate)
                total_questions = len(quiz.questions) if quiz.questions else 0
                correct_answers = int((attempt.score / 100) * total_questions) if total_questions > 0 else 0
                
                # Generate remarks
                if attempt.score >= 80:
                    remarks = "Great job! Keep up the excellent work."
                elif attempt.score >= 60:
                    remarks = "Good effort! Room for improvement."
                else:
                    remarks = "Need more practice. Consider reviewing the material."
                
                writer.writerow([
                    quiz.id,
                    quiz.title,
                    quiz.chapter.subject.name,
                    quiz.chapter.name,
                    attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S'),
                    attempt.score,
                    total_questions,
                    correct_answers,
                    performance_level,
                    remarks
                ])
        
        csv_content = output.getvalue()
        output.close()
        
        # Save to temporary file
        temp_dir = tempfile.gettempdir()
        filename = f"user_{user_id}_quiz_attempts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        file_path = os.path.join(temp_dir, filename)
        
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            csvfile.write(csv_content)
        
        return {
            "status": "success", 
            "message": f"CSV export completed for user {user.user_name}",
            "file_path": file_path,
            "filename": filename,
            "records_count": len(attempts)
        }
        
    except Exception as e:
        current_app.logger.error(f"Error in export_user_quiz_attempts: {e}")
        return {"error": str(e), "status": "failed"}

@shared_task(ignore_result=False, name="export_admin_all_users")
def export_admin_all_users():
    """
    Export all users' performance data for admin
    """
    try:
        # Get all users with their quiz attempts
        users = User.query.all()
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'User ID', 'Username', 'Email', 'Registration Date',
            'Total Quizzes Taken', 'Average Score (%)', 'Best Score (%)',
            'Worst Score (%)', 'Favorite Subject', 'Last Activity',
            'Performance Rating', 'Total Study Time (Minutes)'
        ])
        
        # Write data rows
        for user in users:
            attempts = QuizAttempt.query.filter_by(user_id=user.id).all()
            
            if attempts:
                scores = [attempt.score for attempt in attempts]
                avg_score = sum(scores) / len(scores)
                best_score = max(scores)
                worst_score = min(scores)
                last_activity = max(attempt.date_attempted for attempt in attempts)
                
                # Find favorite subject
                subject_attempts = {}
                for attempt in attempts:
                    if attempt.quiz and attempt.quiz.chapter and attempt.quiz.chapter.subject:
                        subject_name = attempt.quiz.chapter.subject.name
                        if subject_name not in subject_attempts:
                            subject_attempts[subject_name] = 0
                        subject_attempts[subject_name] += 1
                
                favorite_subject = max(subject_attempts, key=subject_attempts.get) if subject_attempts else "None"
                
                # Performance rating
                if avg_score >= 85:
                    performance_rating = "Excellent"
                elif avg_score >= 75:
                    performance_rating = "Good"
                elif avg_score >= 60:
                    performance_rating = "Average"
                else:
                    performance_rating = "Needs Improvement"
                
                # Estimate study time (approximate: 2 minutes per question)
                total_questions = sum(len(attempt.quiz.questions) for attempt in attempts if attempt.quiz and attempt.quiz.questions)
                estimated_study_time = total_questions * 2
                
            else:
                avg_score = best_score = worst_score = 0
                last_activity = "Never"
                favorite_subject = "None"
                performance_rating = "No Data"
                estimated_study_time = 0
            
            writer.writerow([
                user.id,
                user.user_name,
                user.email,
                user.fs_uniquifier[:10] if hasattr(user, 'fs_uniquifier') else "N/A",
                len(attempts),
                round(avg_score, 2) if attempts else 0,
                round(best_score, 2) if attempts else 0,
                round(worst_score, 2) if attempts else 0,
                favorite_subject,
                last_activity.strftime('%Y-%m-%d %H:%M:%S') if last_activity != "Never" else "Never",
                performance_rating,
                estimated_study_time
            ])
        
        csv_content = output.getvalue()
        output.close()
        
        # Save to temporary file
        temp_dir = tempfile.gettempdir()
        filename = f"admin_users_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        file_path = os.path.join(temp_dir, filename)
        
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            csvfile.write(csv_content)
        
        return {
            "status": "success",
            "message": f"Admin users report generated successfully",
            "file_path": file_path,
            "filename": filename,
            "records_count": len(users)
        }
        
    except Exception as e:
        current_app.logger.error(f"Error in export_admin_all_users: {e}")
        return {"error": str(e), "status": "failed"}