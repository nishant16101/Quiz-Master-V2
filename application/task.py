# application/tasks.py

from celery import shared_task
from application.models import User, QuizAttempt, Subject, Chapter, Quiz, Question
from application.database import db
from application.__init__ import mail # Import celery_app and mail from __init__.py
from flask import current_app
from flask_mail import Message
import csv
import io
import os
from datetime import datetime, timedelta
import tempfile
import requests
import json

# Helper function to send email
def send_email_helper(to_email, subject, body, html=None):
    try:
        msg = Message(subject, recipients=[to_email], body=body, html=html)
        with current_app.app_context(): # Ensure app context for Mail
            mail.send(msg)
        current_app.logger.info(f"Email sent to {to_email} with subject: {subject}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to_email}: {e}")
        return False

@shared_task(ignore_result=False, name="download_csv")
def csv_report():
    return "initiated csv"

@shared_task(ignore_result=False, name="monthly_report")
def monthly_report():
    
    try:
        users = User.query.all()
        reports_sent = 0

        for user in users:
            last_month = datetime.now() - timedelta(days=30)
            monthly_attempts = QuizAttempt.query.filter(
                QuizAttempt.user_id == user.id,
                QuizAttempt.date_attempted >= last_month
            ).all()

            if monthly_attempts:
                total_quizzes_last_month = len(monthly_attempts)
                if total_quizzes_last_month > 0:
                    avg_score_last_month = sum(a.score for a in monthly_attempts) / total_quizzes_last_month
                else:
                    avg_score_last_month = 0

                subject = f"Quiz Master: Your Monthly Performance Report for {datetime.now().strftime('%B %Y')}"
                body = f"""
Dear {user.user_name},

Here is a summary of your quiz activity over the past 30 days:

- Total Quizzes Attempted: {total_quizzes_last_month}
- Average Score: {avg_score_last_month:.2f}%

We encourage you to continue practicing to improve your knowledge!

Best regards,
The Quiz Master Team
"""
                if send_email_helper(user.email, subject, body):
                    reports_sent += 1
                else:
                    current_app.logger.warning(f"Failed to send monthly report to {user.email}")

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
    Send daily reminders to users who haven't attempted quizzes in the last 3 days.
    """
    try:
        three_days_ago = datetime.now() - timedelta(days=3)

        active_user_ids_tuples = db.session.query(QuizAttempt.user_id).filter(
            QuizAttempt.date_attempted >= three_days_ago
        ).distinct().all()
        active_user_ids = [user_id[0] for user_id in active_user_ids_tuples]

        all_users = User.query.all()
        inactive_users = [user for user in all_users if user.id not in active_user_ids]

        reminders_sent = 0
        for user in inactive_users:
            subject = "Quiz Master: Time to brush up your knowledge!"
            body = f"""
Dear {user.user_name},

It looks like you haven't attempted any quizzes in the last 3 days.

Regular practice is key to mastering new subjects! Log in now and take a quick quiz to keep your skills sharp.

Start practicing: [Your App URL Here, e.g., http://localhost:5000]

Best regards,
The Quiz Master Team
"""
            if send_email_helper(user.email, subject, body):
                reminders_sent += 1
            else:
                current_app.logger.warning(f"Failed to send daily reminder to {user.email}")

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

@shared_task(ignore_result=True, name="send_gchat_notification")
def send_gchat_notification(user_name, quiz_title, score):
    # Retrieve the webhook URL from Flask's current application configuration
    webhook_url = current_app.config.get('GCHAT_WEBHOOK_URL')

    # Simplify the check: only fail if the webhook_url is truly not configured (None or empty string)
    if not webhook_url: # This correctly checks for None or empty string
        current_app.logger.error("GCHAT_WEBHOOK_URL is not configured.")
        return {"status": "failed", "message": "G-Chat webhook URL not found."}

    message = {
        "text": f"🎉 Quiz Attempted! {user_name} just completed the quiz '{quiz_title}' with a score of {score}%."
    }

    try:
        response = requests.post(webhook_url, json=message)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        current_app.logger.info(f"G-Chat notification sent for {user_name}.")
        return {"status": "success", "message": "G-Chat notification sent."}
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Error sending G-Chat notification: {e}")
        return {"status": "failed", "error": str(e)}

@shared_task(ignore_result=False, name="export_user_quiz_attempts")
def export_user_quiz_attempts(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found", "status": "failed"}

        attempts = QuizAttempt.query.filter_by(user_id=user_id).order_by(QuizAttempt.date_attempted.desc()).all()

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            'Quiz ID', 'Quiz Title', 'Subject', 'Chapter',
            'Date Attempted', 'Score (%)', 'Total Questions',
            'Correct Answers', 'Performance Level', 'Remarks'
        ])

        for attempt in attempts:
            quiz = attempt.quiz
            if quiz and quiz.chapter and quiz.chapter.subject:
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

                total_questions = len(quiz.questions) if quiz.questions else 0
                correct_answers = int((attempt.score / 100) * total_questions) if total_questions > 0 else 0

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
        users = User.query.all()

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            'User ID', 'Username', 'Email', 'Registration Date',
            'Total Quizzes Taken', 'Average Score (%)', 'Best Score (%)',
            'Worst Score (%)', 'Favorite Subject', 'Last Activity',
            'Performance Rating', 'Total Study Time (Minutes)'
        ])

        for user in users:
            attempts = QuizAttempt.query.filter_by(user_id=user.id).all()

            if attempts:
                scores = [attempt.score for attempt in attempts]
                avg_score = sum(scores) / len(scores)
                best_score = max(scores)
                worst_score = min(scores)
                last_activity = max(attempt.date_attempted for attempt in attempts)

                subject_attempts = {}
                for attempt in attempts:
                    if attempt.quiz and attempt.quiz.chapter and attempt.quiz.chapter.subject:
                        subject_name = attempt.quiz.chapter.subject.name
                        if subject_name not in subject_attempts:
                            subject_attempts[subject_name] = 0
                        subject_attempts[subject_name] += 1

                favorite_subject = max(subject_attempts, key=subject_attempts.get) if subject_attempts else "None"

                if avg_score >= 85:
                    performance_rating = "Excellent"
                elif avg_score >= 75:
                    performance_rating = "Good"
                elif avg_score >= 60:
                    performance_rating = "Average"
                else:
                    performance_rating = "Needs Improvement"

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