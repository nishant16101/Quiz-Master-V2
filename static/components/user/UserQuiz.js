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
                <div class="card-header">
                    <h2 class="card-title mb-0">{{ quiz.title }}</h2>
                    <p class="text-muted mb-0">{{ quiz.subject }} - {{ quiz.chapter }}</p>
                    <div v-if="quiz.duration" class="text-info">
                        <i class="fas fa-clock"></i> Duration: {{ quiz.duration }} minutes
                    </div>
                </div>
                <div class="card-body">
                    <form @submit.prevent="submitQuiz">
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
                                    required
                                >
                                <label class="form-check-label" :for="'q' + question.id + key">
                                    <strong>{{ key }}.</strong> {{ option }}
                                </label>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success mt-3">
                            <i class="fas fa-check"></i> Submit Quiz
                        </button>
                    </form>

                    <div v-if="results.score" class="mt-5 p-4 border rounded shadow-lg bg-light">
                        <h4 class="text-center mb-4">Quiz Results</h4>
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
            userAnswers: {}, // To store user's selected answers
            results: {} // To store quiz results after submission
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
                    // Attempt to parse as JSON in case it's a structured error, but fallback to text
                    try {
                        const errorData = JSON.parse(errorText);
                        console.error('Parsed error data:', errorData.error || errorData.message);
                    } catch (parseError) {
                        // Not JSON, just log the raw text
                    }
                    this.quiz = { questions: [] }; // Ensure quiz.questions is an array to prevent TypeError
                    return;
                }

                const data = await response.json();
                console.log('Successfully fetched quiz data:', data);
                this.quiz = data;

                // Defensive check for questions array
                if (!Array.isArray(this.quiz.questions)) {
                    console.error('Error: quiz.questions is not an array or is missing:', this.quiz.questions);
                    this.quiz.questions = []; // Ensure it's an array to prevent errors in v-for
                }

                // Initialize userAnswers with empty values
                this.quiz.questions.forEach(question => {
                    this.userAnswers[question.id] = null;
                });

            } catch (error) {
                console.error('Error in fetchQuiz during fetch or JSON parsing:', error);
                this.quiz = { questions: [] }; // Ensure quiz.questions is an array even on error
            } finally {
                this.loading = false;
                console.log('Loading state set to false. Final quiz object:', this.quiz);
            }
        },
        async submitQuiz() {
            this.loading = true;
            try {
                const token = localStorage.getItem('auth_token');
                const quizId = this.$route.params.id;

                const response = await fetch(`/user/quiz/${quizId}/submit`, {
                    method: 'POST',
                    headers: {
                        'Authentication-Token': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ answers: this.userAnswers }) // Use userAnswers
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
                this.loading = false;
            }
        },
        retakeQuiz() {
            this.results = {}; // Clear previous results
            this.userAnswers = {}; // Clear user answers
            // Re-initialize userAnswers with empty values for the quiz questions
            if (this.quiz.questions) {
                this.quiz.questions.forEach(question => {
                    this.userAnswers[question.id] = null;
                });
            }
            // No need to fetchQuiz again if the quiz data itself hasn't changed.
            // If you want a fresh set of questions or shuffled order, then call fetchQuiz().
        },
    },
    async mounted() {
        await this.fetchQuiz();
    },
    // No beforeDestroy needed as there's no timer interval to clear anymore
}
export default UserQuiz;