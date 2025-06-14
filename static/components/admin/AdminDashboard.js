const AdminDashboard = {
  template: `
    <div class="container mt-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="fas fa-tachometer-alt text-primary me-2"></i>Admin Dashboard
              </h2>
              <p class="text-muted mb-0">Manage your quiz application</p>
            </div>
            <div class="dropdown">
              <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-cog me-2"></i>Quick Actions
              </button>
              <ul class="dropdown-menu">
                <li><router-link class="dropdown-item" to="/admin/subjects">
                  <i class="fas fa-book me-2"></i>Add Subject
                </router-link></li>
                <li><router-link class="dropdown-item" to="/admin/chapters">
                  <i class="fas fa-bookmark me-2"></i>Add Chapter
                </router-link></li>
                <li><router-link class="dropdown-item" to="/admin/quizzes">
                  <i class="fas fa-question-circle me-2"></i>Add Quiz
                </router-link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Messages -->
      <div v-if="alert.show" :class="'alert alert-' + alert.type + ' alert-dismissible fade show'" role="alert">
        {{ alert.message }}
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-primary text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.totalUsers }}</h4>
                  <p class="mb-0">Total Users</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-users fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
            <div class="card-footer bg-primary border-0">
              <router-link to="/admin/users" class="text-white text-decoration-none">
                View Details <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.totalSubjects }}</h4>
                  <p class="mb-0">Subjects</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-book fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
            <div class="card-footer bg-success border-0">
              <router-link to="/admin/subjects" class="text-white text-decoration-none">
                Manage <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-info text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.totalQuizzes }}</h4>
                  <p class="mb-0">Quizzes</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-question-circle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
            <div class="card-footer bg-info border-0">
              <router-link to="/admin/quizzes" class="text-white text-decoration-none">
                Manage <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.totalQuestions }}</h4>
                  <p class="mb-0">Questions</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-list-alt fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
            <div class="card-footer bg-warning border-0">
              <router-link to="/admin/questions" class="text-white text-decoration-none">
                Manage <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Quick Management -->
        <div class="col-lg-8 mb-4">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-tasks text-primary me-2"></i>Quick Management
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <router-link to="/admin/users" class="btn btn-outline-primary btn-lg">
                      <i class="fas fa-users me-2"></i>
                      <div>
                        <div class="fw-bold">Manage Users</div>
                        <small class="text-muted">View and manage user accounts</small>
                      </div>
                    </router-link>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <router-link to="/admin/subjects" class="btn btn-outline-success btn-lg">
                      <i class="fas fa-book me-2"></i>
                      <div>
                        <div class="fw-bold">Manage Subjects</div>
                        <small class="text-muted">Add and organize subjects</small>
                      </div>
                    </router-link>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <router-link to="/admin/chapters" class="btn btn-outline-info btn-lg">
                      <i class="fas fa-bookmark me-2"></i>
                      <div>
                        <div class="fw-bold">Manage Chapters</div>
                        <small class="text-muted">Organize content by chapters</small>
                      </div>
                    </router-link>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <router-link to="/admin/quizzes" class="btn btn-outline-warning btn-lg">
                      <i class="fas fa-question-circle me-2"></i>
                      <div>
                        <div class="fw-bold">Manage Quizzes</div>
                        <small class="text-muted">Create and edit quizzes</small>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-lg-4 mb-4">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-clock text-info me-2"></i>System Status
              </h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <i class="fas fa-circle text-success me-2"></i>
                    <small>Database</small>
                  </div>
                  <span class="badge bg-success">Online</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <i class="fas fa-circle text-success me-2"></i>
                    <small>API Services</small>
                  </div>
                  <span class="badge bg-success">Running</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <i class="fas fa-circle text-warning me-2"></i>
                    <small>Cache</small>
                  </div>
                  <span class="badge bg-warning">Optimizing</span>
                </div>
              </div>
              
              <hr>
              
              <div class="text-center">
                <p class="text-muted mb-2">
                  <small>Last updated: {{ new Date().toLocaleString() }}</small>
                </p>
                <button @click="refreshStats" class="btn btn-sm btn-outline-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: false,
      stats: {
        totalUsers: 0,
        totalSubjects: 0,
        totalQuizzes: 0,
        totalQuestions: 0
      },
      alert: {
        show: false,
        message: '',
        type: 'info'
      }
    }
  },
  methods: {
    async fetchStats() {
      this.loading = true
      try {
        const token = localStorage.getItem('auth_token')
        
        
        const [usersRes, subjectsRes, quizzesRes, questionsRes] = await Promise.all([
          fetch('/admin/users', {
            headers: { 'Authentication-Token': token }
          }),
          fetch('/admin/subjects', {
            headers: { 'Authentication-Token':token}
          }),
          fetch('/admin/quizzes', {
            headers: { 'Authentication-Token': token }
          }),
          fetch('/admin/questions', {
            headers: { 'Authentication-Token':token}
          })
        ])

        if (usersRes.ok) {
          const users = await usersRes.json()
          this.stats.totalUsers = users.length
        }

        if (subjectsRes.ok) {
          const subjects = await subjectsRes.json()
          this.stats.totalSubjects = subjects.length
        }

        if (quizzesRes.ok) {
          const quizzes = await quizzesRes.json()
          this.stats.totalQuizzes = quizzes.length
        }

        if (questionsRes.ok) {
          const questions = await questionsRes.json()
          this.stats.totalQuestions = questions.length
        }

      } catch (error) {
        console.error('Error fetching stats:', error)
        this.showAlert('Error loading dashboard statistics', 'danger')
      } finally {
        this.loading = false
      }
    },

    async refreshStats() {
      await this.fetchStats()
      this.showAlert('Statistics refreshed successfully', 'success')
    },

    showAlert(message, type = 'info') {
      this.alert = {
        show: true,
        message,
        type
      }
      setTimeout(() => {
        this.hideAlert()
      }, 3000)
    },

    hideAlert() {
      this.alert.show = false
    }
  },

  async mounted() {
    await this.fetchStats()
  }
}

export default AdminDashboard