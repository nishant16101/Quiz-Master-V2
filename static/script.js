import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import NavBar from './components/NavBar.js'
import Footer from './components/Footer.js'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register }
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