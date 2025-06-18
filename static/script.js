// Import existing components
import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import NavBar from './components/NavBar.js'
import Footer from './components/Footer.js'

// Import Admin components
import AdminDashboard from './components/admin/AdminDashboard.js'
import AdminUsers from './components/admin/AdminUsers.js'
import AdminSubjects from './components/admin/AdminSubjects.js'
import AdminChapters from './components/admin/AdminChapters.js'
import AdminQuizzes from './components/admin/AdminQuizzes.js'
import AdminQuestions from './components/admin/AdminQuestions.js'

// Import User components
import UserDashboard from './components/user/UserDashboard.js'
import UserProfile from './components/user/UserProfile.js'
import UserSubject from './components/user/UserSubject.js'
import UserChapter from './components/user/UserChapter.js'
import UserQuiz from './components/user/UserQuiz.js'
import UserAttempts from './components/user/UserAttempts.js'

// Authentication guard
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    next()
  } else {
    next('/login')
  }
}

const requireAdmin = (to, from, next) => {
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}'); 
     
  if (token && user && user.roles && user.roles.includes('admin')) {
    next();
  } else {
    next('/login');
  }
};

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
     
  // Admin routes
  { path: '/admin/dashboard', component: AdminDashboard, beforeEnter: requireAdmin },
  { path: '/admin/users', component: AdminUsers, beforeEnter: requireAdmin },
  { path: '/admin/subjects', component: AdminSubjects, beforeEnter: requireAdmin },
  { path: '/admin/chapters', component: AdminChapters, beforeEnter: requireAdmin },
  { path: '/admin/quizzes', component: AdminQuizzes, beforeEnter: requireAdmin },
  { path: '/admin/questions', component: AdminQuestions, beforeEnter: requireAdmin },
  { path: '/admin/quiz/:id/questions', component: AdminQuestions, beforeEnter: requireAdmin, props: true },
     
  // User routes
  { path: '/dashboard', component: UserDashboard, beforeEnter: requireAuth },
  { path: '/profile', component: UserProfile, beforeEnter: requireAuth },
  
  // Corrected and new routes for subjects and chapters
  { path: '/subjects', component: UserSubject, beforeEnter: requireAuth }, // This will list all subjects
  { path: '/subject/:id', component: UserSubject, beforeEnter: requireAuth, props: true }, // This will show chapters for a subject
  
  { path: '/chapter/:id', component: UserChapter, beforeEnter: requireAuth, props: true },
  { path: '/quiz/:id', component: UserQuiz, beforeEnter: requireAuth, props: true },
  { path: '/attempts', component: UserAttempts, beforeEnter: requireAuth },
  { path: '/attempts/:id', component: UserAttempts, beforeEnter: requireAuth, props: true }
]

const router = new VueRouter({
  routes
})

const app = new Vue({
  el: "#app",
  router,
  template: `
    <div class="container-fluid">
      <nav-bar></nav-bar>
      <router-view></router-view>
      <foot></foot>
    </div>
  `,
  data: {
    section: "Frontend"
  },
  components: {
    "nav-bar": NavBar,
    "foot": Footer
  }
})