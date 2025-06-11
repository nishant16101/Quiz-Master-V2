const Home = {
  template: `
    <div>
      <!-- Hero Section -->
      <section class="hero-section bg-primary text-white py-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold mb-4">
                <i class="fas fa-graduation-cap me-3"></i>
                Quiz Master
              </h1>
              <p class="lead mb-4">
                Test your knowledge with our comprehensive quiz platform. 
                Choose from various subjects and challenge yourself!
              </p>
              <div class="d-flex gap-3">
                <router-link 
                  v-if="!isAuthenticated" 
                  to="/register" 
                  class="btn btn-light btn-lg"
                >
                  <i class="fas fa-user-plus me-2"></i>
                  Get Started
                </router-link>
                <router-link 
                  v-if="!isAuthenticated" 
                  to="/login" 
                  class="btn btn-outline-light btn-lg"
                >
                  <i class="fas fa-sign-in-alt me-2"></i>
                  Login
                </router-link>
                <router-link 
                  v-if="isAuthenticated && userRole === 'user'" 
                  to="/dashboard" 
                  class="btn btn-light btn-lg"
                >
                  <i class="fas fa-tachometer-alt me-2"></i>
                  Go to Dashboard
                </router-link>
                <router-link 
                  v-if="isAuthenticated && userRole === 'admin'" 
                  to="/admin" 
                  class="btn btn-light btn-lg"
                >
                  <i class="fas fa-cog me-2"></i>
                  Admin Panel
                </router-link>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="text-center">
                <i class="fas fa-brain display-1 opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-5">
        <div class="container">
          <div class="row">
            <div class="col-12 text-center mb-5">
              <h2 class="display-5 fw-bold">Why Choose Quiz Master?</h2>
              <p class="lead text-muted">Enhance your learning experience with our powerful features</p>
            </div>
          </div>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <div class="feature-icon mb-3">
                    <i class="fas fa-book-open fa-3x text-primary"></i>
                  </div>
                  <h4>Multiple Subjects</h4>
                  <p class="text-muted">
                    Choose from a wide variety of subjects including Science, Math, History, and more.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <div class="feature-icon mb-3">
                    <i class="fas fa-chart-line fa-3x text-success"></i>
                  </div>
                  <h4>Track Progress</h4>
                  <p class="text-muted">
                    Monitor your performance with detailed analytics and progress tracking.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <div class="feature-icon mb-3">
                    <i class="fas fa-trophy fa-3x text-warning"></i>
                  </div>
                  <h4>Achievements</h4>
                  <p class="text-muted">
                    Earn badges and certificates as you complete quizzes and improve your scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="bg-light py-5" v-if="stats">
        <div class="container">
          <div class="row text-center">
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="stat-item">
                <h3 class="display-4 fw-bold text-primary">{{ stats.totalQuizzes }}</h3>
                <p class="text-muted">Total Quizzes</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="stat-item">
                <h3 class="display-4 fw-bold text-success">{{ stats.totalUsers }}</h3>
                <p class="text-muted">Active Users</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="stat-item">
                <h3 class="display-4 fw-bold text-info">{{ stats.totalSubjects }}</h3>
                <p class="text-muted">Subjects Available</p>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="stat-item">
                <h3 class="display-4 fw-bold text-warning">{{ stats.totalAttempts }}</h3>
                <p class="text-muted">Quiz Attempts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-5 bg-primary text-white" v-if="!isAuthenticated">
        <div class="container text-center">
          <h2 class="display-5 fw-bold mb-4">Ready to Start Learning?</h2>
          <p class="lead mb-4">Join thousands of learners and start your quiz journey today!</p>
          <router-link to="/register" class="btn btn-light btn-lg">
            <i class="fas fa-rocket me-2"></i>
            Sign Up Now
          </router-link>
        </div>
      </section>
    </div>
  `,
  data() {
    return {
      stats: null
    }
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('token')
    },
    userRole() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.role || 'user'
    }
  },
  async mounted() {
    await this.fetchStats()
  },
  methods: {
    async fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          this.stats = await response.json()
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Default stats for demo
        this.stats = {
          totalQuizzes: 150,
          totalUsers: 1234,
          totalSubjects: 25,
          totalAttempts: 5678
        }
      }
    }
  }
}

export default Home