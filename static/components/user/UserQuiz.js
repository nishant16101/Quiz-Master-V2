const UserQuiz = {
    template: `
        <div class="container mt-4">
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <div v-else-if="!quiz.questions || quiz.questions.length === 0" class="card">
                <div class="card-body text-center">
                    <h2 class="card-title">No Questions Available</h2>
                    <p class="text-muted">This quiz does not have any questions yet.</p>
                    <router-link :to="'/subject/' + quiz.subject_id" class="btn btn-primary mt-3">
                        <i class="fas fa-arrow-left"></i> Back to Subject
                    </router-link>
                </div>
            </div>

            <div v-else class="card">
                <!-- Timer Section -->
                <div v-if="quiz.duration && !results.score && timerActive" class="card-header bg-warning text-dark sticky-top">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0">
                                <i class="fas fa-clock"></i> Time Remaining
                            </h5>
                        </div>
                        <div class="timer-display">
                            <h4 class="mb-0" :class="timeWarning ? 'text-danger' : 'text-dark'">
                                <i class="fas fa-stopwatch"></i> {{ formatTime(timeRemaining) }}
                            </h4>
                        </div>
                    </div>
                    <div class="progress mt-2" style="height: 8px;">
                        <div class="progress-bar" 
                             :class="timeWarning ? 'bg-danger' : 'bg-success'"
                             :style="{ width: timeProgressPercentage + '%' }">
                        </div>
                    </div>
                </div>

                <div class="card-header" v-if="!timerActive || results.score">
                    <h2 class="card-title mb-0">{{ quiz.title }}</h2>
                    <p class="text-muted mb-0">{{ quiz.subject }} - {{ quiz.chapter }}</p>
                    <div v-if="quiz.duration" class="text-info">
                        <i class="fas fa-clock"></i> Duration: {{ quiz.duration }} minutes
                    </div>
                </div>

                <div class="card-body">
                    <!-- Quiz Instructions -->
                    <div v-if="!quizStarted && !results.score" class="text-center mb-4 p-4 bg-light rounded">
                        <h4 class="mb-3">Quiz Instructions</h4>
                        <div class="row">
                            <div class="col-md-6">
                                <p><i class="fas fa-question-circle text-primary"></i> <strong>Questions:</strong> {{ quiz.questions.length }}</p>
                            </div>
                            <div class="col-md-6" v-if="quiz.duration">
                                <p><i class="fas fa-clock text-warning"></i> <strong>Time Limit:</strong> {{ quiz.duration }} minutes</p>
                            </div>
                        </div>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i> Once you start the quiz, the timer will begin. Make sure you're ready before clicking "Start Quiz".
                        </div>
                        <button @click="startQuiz" class="btn btn-primary btn-lg">
                            <i class="fas fa-play"></i> Start Quiz
                        </button>
                    </div>

                    <!-- Quiz Form -->
                    <form v-if="quizStarted && !results.score" @submit.prevent="submitQuiz">
                        <div v-for="(question, index) in quiz.questions" :key="question.id" class="mb-4 border p-3 rounded shadow-sm">
                            <p class="fw-bold">Q{{ index + 1 }}. {{ question.content }}</p>
                            <div v-for="(option, key) in question.options" :key="key" class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    :name="'question_' + question.id"
                                    :id="'q' + question.id + key"
                                    :value="key"
                                    v-model="userAnswers[question.id]"
                                    :disabled="submittingQuiz"
                                    required
                                >
                                <label class="form-check-label" :for="'q' + question.id + key">
                                    <strong>{{ key }}.</strong> {{ option }}
                                </label>
                            </div>
                        </div>
                        
                        <div class="text-center">
                            <button type="submit" class="btn btn-success btn-lg" :disabled="submittingQuiz">
                                <i class="fas fa-check"></i> 
                                {{ submittingQuiz ? 'Submitting...' : 'Submit Quiz' }}
                            </button>
                        </div>
                    </form>

                    <!-- Results Section -->
                    <div v-if="results.score" class="mt-5 p-4 border rounded shadow-lg bg-light">
                        <h4 class="text-center mb-4">Quiz Results</h4>
                        
                        <!-- Time Completion Status -->
                        <div v-if="quiz.duration" class="alert" :class="timeExpired ? 'alert-warning' : 'alert-success'">
                            <i :class="timeExpired ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'"></i>
                            {{ timeExpired ? 'Time expired! Quiz was auto-submitted.' : 'Quiz completed on time!' }}
                            <br>
                            <small>Time taken: {{ formatTime(timeTaken) }}</small>
                        </div>

                        <div class="row text-center mb-4">
                            <div class="col-md-4">
                                <div class="card bg-success text-white mb-2">
                                    <div class="card-body py-2">
                                        <h5 class="mb-0">{{ results.score.percentage }}%</h5>
                                        <small>Your Score</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-info text-white mb-2">
                                    <div class="card-body py-2">
                                        <h5 class="mb-0">{{ results.score.correct_answers }}</h5>
                                        <small>Correct Answers</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-primary text-white mb-2">
                                    <div class="card-body py-2">
                                        <h5 class="mb-0">{{ results.score.total_questions }}</h5>
                                        <small>Total Questions</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h5 class="mb-3">Detailed Answers:</h5>
                        <div v-for="(res, index) in results.results" :key="res.question_id" class="card mb-3">
                            <div class="card-body">
                                <p class="mb-1">
                                    <strong>Q{{ index + 1 }}.</strong> {{ res.question }}
                                    <span class="badge ms-2" :class="res.is_correct ? 'bg-success' : 'bg-danger'">
                                        {{ res.is_correct ? 'Correct' : 'Incorrect' }}
                                    </span>
                                </p>
                                <p class="mb-1">
                                    Your Answer:
                                    <span :class="!res.is_correct && res.user_answer ? 'text-danger' : 'text-success'">
                                        {{ res.user_answer ? res.user_answer + '. ' + res.options[res.user_answer] : 'Not Answered' }}
                                    </span>
                                </p>
                                <p class="mb-0">
                                    Correct Answer: <span class="text-success">{{ res.correct_answer }}. {{ res.options[res.correct_answer] }}</span>
                                </p>
                            </div>
                        </div>

                        <div class="text-center mt-4">
                            <router-link :to="'/subject/' + quiz.subject_id" class="btn btn-outline-primary me-3">
                                <i class="fas fa-arrow-left"></i> Back to Subject
                            </router-link>
                            <button @click="retakeQuiz" class="btn btn-outline-secondary">
                                <i class="fas fa-redo"></i> Retake Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            loading: true,
            quiz: {},
            userAnswers: {},
            results: {},
            quizStarted: false,
            timerActive: false,
            timeRemaining: 0, // in seconds
            totalTime: 0, // in seconds
            timerInterval: null,
            timeExpired: false,
            submittingQuiz: false,
            startTime: null,
            timeTaken: 0
        }
    },
    computed: {
        timeWarning() {
            const percentage = (this.timeRemaining / this.totalTime) * 100;
            return percentage <= 20; // Show warning when 20% or less time remaining
        },
        timeProgressPercentage() {
            if (this.totalTime === 0) return 100;
            return (this.timeRemaining / this.totalTime) * 100;
        }
    },
    methods: {
        async fetchQuiz() {
            this.loading = true;
            try {
                const token = localStorage.getItem('auth_token');
                const quizId = this.$route.params.id;
                const headers = {
                    'Authentication-Token': token,
                    'Content-Type': 'application/json'
                };

                console.log(`Fetching quiz with ID: ${quizId}`);
                const response = await fetch(`/user/quiz/${quizId}`, { headers });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to fetch quiz. Status:', response.status);
                    console.error('Server response (non-OK):', errorText);
                    try {
                        const errorData = JSON.parse(errorText);
                        console.error('Parsed error data:', errorData.error || errorData.message);
                    } catch (parseError) {
                        // Not JSON, just log the raw text
                    }
                    this.quiz = { questions: [] };
                    return;
                }

                const data = await response.json();
                console.log('Successfully fetched quiz data:', data);
                this.quiz = data;

                if (!Array.isArray(this.quiz.questions)) {
                    console.error('Error: quiz.questions is not an array or is missing:', this.quiz.questions);
                    this.quiz.questions = [];
                }

                // Initialize userAnswers with empty values
                this.quiz.questions.forEach(question => {
                    this.userAnswers[question.id] = null;
                });

                // Set up timer if duration exists
                if (this.quiz.duration) {
                    this.totalTime = this.quiz.duration * 60; // convert minutes to seconds
                    this.timeRemaining = this.totalTime;
                }

            } catch (error) {
                console.error('Error in fetchQuiz during fetch or JSON parsing:', error);
                this.quiz = { questions: [] };
            } finally {
                this.loading = false;
                console.log('Loading state set to false. Final quiz object:', this.quiz);
            }
        },

        startQuiz() {
            this.quizStarted = true;
            this.startTime = Date.now();
            
            if (this.quiz.duration) {
                this.startTimer();
            }
        },

        startTimer() {
            this.timerActive = true;
            this.timerInterval = setInterval(() => {
                this.timeRemaining--;
                
                if (this.timeRemaining <= 0) {
                    this.timeExpired = true;
                    this.stopTimer();
                    this.autoSubmitQuiz();
                }
            }, 1000);
        },

        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            this.timerActive = false;
            
            // Calculate time taken
            if (this.startTime) {
                this.timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
            }
        },

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        async submitQuiz() {
            if (this.submittingQuiz) return;
            
            this.submittingQuiz = true;
            this.stopTimer();
            
            try {
                const token = localStorage.getItem('auth_token');
                const quizId = this.$route.params.id;

                const response = await fetch(`/user/quiz/${quizId}/submit`, {
                    method: 'POST',
                    headers: {
                        'Authentication-Token': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        answers: this.userAnswers,
                        time_taken: this.timeTaken,
                        time_expired: this.timeExpired
                    })
                });

                if (response.ok) {
                    this.results = await response.json();
                } else {
                    const errorData = await response.json();
                    console.error('Failed to submit Quiz. Status:', response.status, 'Error:', errorData.error);
                }
            } catch (error) {
                console.error('Error submitting quiz:', error);
            } finally {
                this.submittingQuiz = false;
            }
        },

        async autoSubmitQuiz() {
            console.log('Auto-submitting quiz due to time expiry');
            await this.submitQuiz();
        },

        retakeQuiz() {
            // Reset all quiz states
            this.results = {};
            this.userAnswers = {};
            this.quizStarted = false;
            this.timerActive = false;
            this.timeExpired = false;
            this.submittingQuiz = false;
            this.startTime = null;
            this.timeTaken = 0;
            
            // Reset timer
            if (this.quiz.duration) {
                this.timeRemaining = this.totalTime;
            }
            
            // Stop any running timer
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            
            // Re-initialize userAnswers with empty values
            if (this.quiz.questions) {
                this.quiz.questions.forEach(question => {
                    this.userAnswers[question.id] = null;
                });
            }
        }
    },

    async mounted() {
        await this.fetchQuiz();
    },

    beforeUnmount() {
        // Clean up timer when component is destroyed
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

export default UserQuiz;