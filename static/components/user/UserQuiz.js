const UserQuiz = {
    template:`
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <!-- Quiz Header -->
          <div v-if="!quizStarted" class="card">
            <div class="card-body text-center">
              <h2 class="card-title">{{ quiz.title }}</h2>
              <p class="text-muted">{{ quiz.chapter }} - {{ quiz.subject }}</p>
              <div class="row justify-content-center">
                <div class="col-md-8">
                  <div class="row">
                    <div class="col-6">
                      <div class="card bg-light">
                        <div class="card-body">
                          <h5 class="card-title">
                            <i class="fas fa-clock"></i> Duration
                          </h5>
                          <p class="card-text">{{ quiz.duration }} minutes</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="card bg-light">
                        <div class="card-body">
                          <h5 class="card-title">
                            <i class="fas fa-list"></i> Questions
                          </h5>
                          <p class="card-text">{{ quiz.questions?.length || 0 }} questions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button @click="startQuiz" class="btn btn-success btn-lg mt-3">
                <i class="fas fa-play"></i> Start Quiz
              </button>
            </div>
          </div>
          
          <!-- Quiz Questions -->
          <div v-if="quizStarted && !showResults" class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">{{ quiz.title }}</h5>
              <div class="d-flex align-items-center">
                <span class="badge bg-primary me-3">
                  Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions?.length }}
                </span>
                <div class="text-danger">
                  <i class="fas fa-clock"></i> {{ formatTime(timeRemaining) }}
                </div>
              </div>
            </div>
            <div class="card-body">
              <div v-if="currentQuestion" class="question-container">
                <h4 class="mb-4">{{ currentQuestion.content }}</h4>
                <div class="options">
                  <div v-for="(option, key) in currentQuestion.options" :key="key" class="mb-3">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="radio" 
                        :name="'question_' + currentQuestion.id"
                        :id="'option_' + currentQuestion.id + '_' + key"
                        :value="key"
                        v-model="answers[currentQuestion.id]"
                      >
                      <label class="form-check-label" :for="'option_' + currentQuestion.id + '_' + key">
                        <strong>{{ key }}.</strong> {{ option }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Navigation -->
              <div class="d-flex justify-content-between mt-4">
                <button 
                  @click="previousQuestion" 
                  :disabled="currentQuestionIndex === 0"
                  class="btn btn-secondary"
                >
                  <i class="fas fa-arrow-left"></i> Previous
                </button>
                
                <div>
                  <button 
                    v-if="currentQuestionIndex < quiz.questions.length - 1"
                    @click="nextQuestion" 
                    class="btn btn-primary"
                  >
                    Next <i class="fas fa-arrow-right"></i>
                  </button>
                  
                  <button 
                    v-else
                    @click="submitQuiz" 
                    class="btn btn-success"
                  >
                    Submit Quiz <i class="fas fa-check"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quiz Results -->
          <div v-if="showResults" class="card">
            <div class="card-header text-center">
              <h3 class="mb-0">Quiz Results</h3>
            </div>
            <div class="card-body">
              <div class="text-center mb-4">
                <div class="row justify-content-center">
                  <div class="col-md-8">
                    <div class="row">
                      <div class="col-4">
                        <div class="card bg-success text-white">
                          <div class="card-body">
                            <h4>{{ results.score?.percentage }}%</h4>
                            <small>Your Score</small>
                          </div>
                        </div>
                      </div>
                      <div class="col-4">
                        <div class="card bg-info text-white">
                          <div class="card-body">
                            <h4>{{ results.score?.correct_answers }}</h4>
                            <small>Correct Answers</small>
                          </div>
                        </div>
                      </div>
                      <div class="col-4">
                        <div class="card bg-warning text-white">
                          <div class="card-body">
                            <h4>{{ results.score?.total_questions }}</h4>
                            <small>Total Questions</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Detailed Results -->
              <div v-if="results.results" class="mt-4">
                <h5>Detailed Results:</h5>
                <div v-for="(result, index) in results.results" :key="result.question_id" class="card mb-3">
                  <div class="card-body">
                    <h6 class="card-title">
                      Question {{ index + 1 }}
                      <span class="badge ms-2" :class="result.is_correct ? 'bg-success' : 'bg-danger'">
                        {{ result.is_correct ? 'Correct' : 'Incorrect' }}
                      </span>
                    </h6>
                    <p class="card-text">{{ result.question }}</p>
                    <div class="row">
                      <div class="col-md-6">
                        <strong>Your Answer:</strong> 
                        <span :class="result.is_correct ? 'text-success' : 'text-danger'">
                          {{ result.user_answer ? result.user_answer + '. ' + result.options[result.user_answer] : 'Not answered' }}
                        </span>
                      </div>
                      <div class="col-md-6">
                        <strong>Correct Answer:</strong> 
                        <span class="text-success">
                          {{ result.correct_answer }}. {{ result.options[result.correct_answer] }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="text-center mt-4">
                <router-link :to="'/user/chapter/' + $route.params.chapterId" class="btn btn-primary me-3">
                  <i class="fas fa-arrow-left"></i> Back to Chapter
                </router-link>
                <button @click="retakeQuiz" class="btn btn-outline-secondary">
                  <i class="fas fa-redo"></i> Retake Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`,
    data(){
        return{
            loading:true,
            quiz:{},
            quizStarted:false,
            showResult:false,
            currentQuestionIndex:0,
            answers:{},
            timeRemaining:0,
            timer:null,
            results:{}
        }
    },
    computed:{
        currentQuestion(){
            return this.quiz.question?.[this.currentQuestionIndex]
        }
    },
    methods:{
        async fetchQuiz(){
            try{
                const token = localStorage.getItem('auth_token')
                const quizId = this.$route.params.id
                const response = await fetch('/user/quiz/${quizId}/start',{
                    headers:{
                        'Authentication-Token':`Bearer${token}`,
                        'Content-Type':'application/json'
                    }
                })
                if (response.ok){
                    this.quiz = await response.json()
                    this.timeRemaining= this.quiz.duration*60
                }else{
                    console.error('Failed to fetch quiz')
                }
            }catch(error){
                console.error('Error fetching the quiz',error)
            }finally{
                this.loading= false
            }
        },
        startQuiz(){
            this.quizStarted = true
            this.startTimer()
        },
        startTimer(){
            this.timer = setInterval(()=>{
                this.timeRemaining --
                if (this.timeRemaining <=0){
                    this.submitQuiz()
                }
            },1000)
        },
        nextQuestion(){
            if(this.currentQuestionIndex < this.quiz.question.length-1){
                this.currentQuestionIndex++
            }
        },
        previousQuestion(){
            if(this.currentQuestionIndex >0){
                this.currentQuestionIndex--
            }
        },
        async submitQuiz(){
            if(this.timer){
                clearInterval(this.timer)
            }
            try{
                const token = localStorage.getItem('auth_token')
                const quizId = this.$route.params.id
                const response = await fetch(`/user/quiz/${quizId}/submit`,{
                    method:'POST',
                    headers:{
                        'Authentication-Token':`Bearer${token}`,
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({answers:this.answers})

                }
                )
                if(response.ok){
                    this.results = await response.json()
                    this.showResult = true
                }else{
                    console.error('Failed to submit Quiz')
                }
            }catch(error){
                console.error('Error submiting quiz',error)
            }
        },
         retakeQuiz() {
         this.quizStarted = false
         this.showResults = false
         this.currentQuestionIndex = 0
         this.answers = {}
         this.timeRemaining = this.quiz.duration * 60
         this.results = {}
        },

    },
    async mounted(){
        await this.fetchQuiz()
    },
    beforemount(){
        if(this.timer){
            clearInterval(this.timer)
        }
    }
}
export default UserQuiz