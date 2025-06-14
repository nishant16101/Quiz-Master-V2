//general
import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import NavBar from './components/NavBar.js'
import Footer from './components/Footer.js'


//user
import UserDashboard from './components/user/UserDashboard.js'
import UserProfile from './components/user/UserProfile.js'
import UserSubject from './components/user/UserSubject.js'
import UserChapter from './components/user/UserChapter.js'
import UserQuiz from './components/user/UserQuiz.js'
import UserAttempts from './components/user/UserAttempts.js'
const requireAuth = (to,from,next)=>{
  const token = localStorage.getItem('auth_token')
  if(token){
    next()
  }else{
    next('/login')
  }
}
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  //user route
{ 
    path: '/dashboard', 
    component: UserDashboard, 
    beforeEnter: requireAuth 
  },
  { 
    path: '/profile', 
    component: UserProfile, 
    beforeEnter: requireAuth 
  },
  { 
    path: '/subjects', 
    component: UserSubject, 
    beforeEnter: requireAuth 
  },
  { 
    path: '/chapter/:id', 
    component: UserChapter, 
    beforeEnter: requireAuth 
  },
  { 
    path: '/quiz/:id', 
    component: UserQuiz, 
    beforeEnter: requireAuth 
  },
  { 
    path: '/attempts', 
    component: UserAttempts, 
    beforeEnter: requireAuth 
  }
  
]

const router = new VueRouter({
  mode: 'history', // Use history mode for cleaner URLs
  routes
})

new Vue({
  el: '#app',
  router,
  components: {
    'nav-bar': NavBar,
    'foot': Footer
  },
  template: `
    <div>
      <nav-bar></nav-bar>
      <div class="container mt-4">
        <router-view></router-view>
      </div>
      <foot></foot>
    </div>
  `
})