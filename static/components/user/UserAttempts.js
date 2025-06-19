const UserAttempts = {
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">
            <i class="fas fa-history"></i> Quiz History & Performance
          </h2>
        </div>
      </div>
      
      <!-- Performance Summary -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Performance by Subject</h5>
            </div>
            <div class="card-body">
              <div v-if="loadingPerformance" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="performance.length === 0" class="text-center text-muted">
                No performance data available
              </div>
              <div v-else class="row">
                <div v-for="subject in performance" :key="subject.subject_name" class="col-md-4 mb-3">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="card-title">{{ subject.subject_name }}</h6>
                      <div class="d-flex justify-content-between mb-2">
                        <small class="text-muted">Attempts:</small>
                        <strong>{{ subject.total_attempts }}</strong>
                      </div>
                      <div class="d-flex justify-content-between mb-2">
                        <small class="text-muted">Average Score:</small>
                        <strong class="text-primary">{{ subject.average_score }}%</strong>
                      </div>
                      <div class="d-flex justify-content-between">
                        <small class="text-muted">Best Score:</small>
                        <strong class="text-success">{{ subject.best_score }}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
    </div>
  `,
  data() {
    return {
      loadingHistory: true,
      loadingPerformance: true,
      history: [],
      performance: []
    }
  },
  methods: {
    async fetchHistory() {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/user/quiz-history', {
          headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          this.history = await response.json()
        } else {
          console.error('Failed to fetch history')
        }
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        this.loadingHistory = false
      }
    },
    
    async fetchPerformance() {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/user/performance', {
          headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          this.performance = await response.json()
        } else {
          console.error('Failed to fetch performance')
        }
      } catch (error) {
        console.error('Error fetching performance:', error)
      } finally {
        this.loadingPerformance = false
      }
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    
    getScoreBadgeClass(score) {
      if (score >= 80) return 'bg-success'
      if (score >= 60) return 'bg-warning'
      return 'bg-danger'
    }
  },
  
  async mounted() {
    await Promise.all([this.fetchHistory(), this.fetchPerformance()])
  }
}  
export default UserAttempts 