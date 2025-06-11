export default{
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">
          <i class="fas fa-graduation-cap"></i> Quiz Master
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            
            <!-- User Navigation -->
            <template v-if="isAuthenticated && !isAdmin">
              <li class="nav-item">
                <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/subjects">Subjects</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/attempts">My Attempts</router-link>
              </li>
            </template>
            
            <!-- Admin Navigation -->
            <template v-if="isAdmin">
              <li class="nav-item">
                <router-link class="nav-link" to="/admin">Dashboard</router-link>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  Manage
                </a>
                <ul class="dropdown-menu">
                  <li><router-link class="dropdown-item" to="/admin/users">Users</router-link></li>
                  <li><router-link class="dropdown-item" to="/admin/subjects">Subjects</router-link></li>
                  <li><router-link class="dropdown-item" to="/admin/chapters">Chapters</router-link></li>
                  <li><router-link class="dropdown-item" to="/admin/quizzes">Quizzes</router-link></li>
                  <li><router-link class="dropdown-item" to="/admin/questions">Questions</router-link></li>
                </ul>
              </li>
            </template>
          </ul>
          
          <ul class="navbar-nav">
            <template v-if="!isAuthenticated">
              <li class="nav-item">
                <router-link class="nav-link" to="/login">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/register">Register</router-link>
              </li>
            </template>
            
            <template v-else>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i class="fas fa-user"></i> {{ userName || 'User' }}
                </a>
                <ul class="dropdown-menu">
                  <li v-if="!isAdmin">
                    <router-link class="dropdown-item" to="/profile">Profile</router-link>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" @click="logout">
                      <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      userName: ''
    }
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('auth_token')
    },
    isAdmin() {
      return localStorage.getItem('role') === 'admin'
    }
  },
  methods: {
    async logout() {
      try {
        const token = localStorage.getItem('aut_token')
        if (token) {
          await fetch('/user/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('userName')
        this.$router.push('/')
      }
    },
    loadUserInfo() {
      this.userName = localStorage.getItem('userName') || ''
    }
  },
  mounted() {
    this.loadUserInfo()
  },
  watch: {
    '$route'() {
      this.loadUserInfo()
    }
  }
}
