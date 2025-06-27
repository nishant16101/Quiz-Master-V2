import os
from datetime import timedelta
from celery.schedules import crontab


broker_url = os.environ.get('CELERY_BROKER_URL',"redis://localhost:6379/0")
result_backend = os.environ.get('CELERY_RESULT_BACKEND',"redis://localhost:6379/1")
accept_content = ['json']
task_serializer = 'json'
result_serializer = 'json'

Timezone = "Asia/Kolkata"
enable_utc = False


beat_schedule = {
    'daily-quiz-reminder': {
        'task': 'daily_reminder',
        'schedule': timedelta(days=1), # Runs approximately every 24 hours
        
        
        'args': (),
        'options': {'queue': 'default'}
    },
    'monthly-performance-report': {
        'task': 'monthly_report',
        'schedule': timedelta(days=30), 
        
        
        'args': (),
        'options': {'queue': 'default'} 
    },
}
