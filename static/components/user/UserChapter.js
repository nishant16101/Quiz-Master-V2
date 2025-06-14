const UserChapter = {
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/user/subjects">Subjects</router-link>
              </li>
              <li class="breadcrumb-item">
                <router-link :to="'/user/subject/' + chapter.subject?.id">
                  {{ chapter.subject?.name }}
                </router-link>
              </li>
              <li class="breadcrumb-item active">{{ chapter.name }}</li>
            </ol>
          </nav>
          
          <h2 class="mb-4">
            <i class="fas fa-bookmark"></i> {{ chapter.name }}
          </h2>
          
          <div v-if="chapter.description" class="alert alert-info">
            {{ chapter.description }}
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else-if="chapter.quizzes?.length === 0" class="text-center text-muted">
        <i class="fas fa-question-circle fa-3x mb-3"></i>
        <p>No quizzes available in this chapter</p>
      </div>
      
      <div v-else class="row">
        <div v-for="quiz in chapter.quizzes" :key="quiz.id" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ quiz.title }}</h5>
              <div class="mb-3">
                <small class="text-muted">
                  <i class="fas fa-clock"></i> {{ quiz.duration }} minutes
                  <br>
                  <i class="fas fa-list"></i> {{ quiz.questions_count }} questions
                </small>
              </div>
              
              <!-- User attempts history -->
              <div v-if="quiz.user_attempts?.length > 0" class="mb-3">
                <h6 class="text-muted">Previous Attempts:</h6>
                <div class="attempt-history">
                  <div v-for="attempt in quiz.user_attempts.slice(-3)" :key="attempt.date" 
                       class="d-flex justify-content-between small">
                    <span>{{ formatDate(attempt.date) }}</span>
                    <span class="badge bg-primary">{{ attempt.score }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-auto">
                <router-link :to="'/user/quiz/' + quiz.id" class="btn btn-success w-100">
                  <i class="fas fa-play"></i> 
                  {{ quiz.user_attempts?.length > 0 ? 'Retake Quiz' : 'Start Quiz' }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: true,
      chapter: {}
    }
  },
  methods: {
    async fetchChapter() {
      try {
        const token = localStorage.getItem('auth_token')
        const chapterId = this.$route.params.id
        const response = await fetch(`/user/chapter/${chapterId}`, {
          headers: {
            'Authentication-Token': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          this.chapter = await response.json()
        } else {
          console.error('Failed to fetch chapter')
        }
      } catch (error) {
        console.error('Error fetching chapter:', error)
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  },
  async mounted() {
    await this.fetchChapter()
  },
  watch: {
    '$route'() {
      this.fetchChapter()
    }
  }
}
export default UserChapter