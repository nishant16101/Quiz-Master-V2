export default{
  template: `
    <footer class="bg-dark text-light py-5 mt-5">
      <div class="container">
        <div class="row">
          <!-- About Section -->
          <div class="col-lg-4 col-md-6 mb-4">
            <h5 class="mb-3">
              <i class="fas fa-graduation-cap me-2"></i>
              Quiz Master
            </h5>
            <p class="text-muted">
              Enhance your learning experience with our comprehensive quiz platform. 
              Test your knowledge across various subjects and track your progress.
            </p>
            <div class="d-flex gap-3">
              <a href="#" class="text-light">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#" class="text-light">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="text-light">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#" class="text-light">
                <i class="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-lg-2 col-md-6 mb-4">
            <h6 class="mb-3">Quick Links</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <router-link to="/" class="text-muted text-decoration-none">
                  <i class="fas fa-home me-1"></i>
                  Home
                </router-link>
              </li>
              <li class="mb-2" v-if="!isAuthenticated">
                <router-link to="/login" class="text-muted text-decoration-none">
                  <i class="fas fa-sign-in-alt me-1"></i>
                  Login
                </router-link>
              </li>
              <li class="mb-2" v-if="!isAuthenticated">
                <router-link to="/register" class="text-muted text-decoration-none">
                  <i class="fas fa-user-plus me-1"></i>
                  Register
                </router-link>
              </li>
              <li class="mb-2" v-if="isAuthenticated && userRole === 'user'">
                <router-link to="/dashboard" class="text-muted text-decoration-none">
                  <i class="fas fa-tachometer-alt me-1"></i>
                  Dashboard
                </router-link>
              </li>
              <li class="mb-2" v-if="isAuthenticated && userRole === 'user'">
                <router-link to="/subjects" class="text-muted text-decoration-none">
                  <i class="fas fa-book me-1"></i>
                  Subjects
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div class="col-lg-2 col-md-6 mb-4">
            <h6 class="mb-3">Support</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="#" class="text-muted text-decoration-none" @click.prevent="showContact = true">
                  <i class="fas fa-envelope me-1"></i>
                  Contact Us
                </a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-muted text-decoration-none" @click.prevent="showHelp = true">
                  <i class="fas fa-question-circle me-1"></i>
                  Help Center
                </a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-muted text-decoration-none" @click.prevent="showFAQ = true">
                  <i class="fas fa-comments me-1"></i>
                  FAQ
                </a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-muted text-decoration-none" @click.prevent="showPrivacy = true">
                  <i class="fas fa-shield-alt me-1"></i>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="col-lg-4 col-md-6 mb-4">
            <h6 class="mb-3">Stay Updated</h6>
            <p class="text-muted mb-3">
              Subscribe to our newsletter for the latest updates and learning tips.
            </p>
            <form @submit.prevent="subscribeNewsletter" class="mb-3">
              <div class="input-group">
                <input
                  type="email"
                  class="form-control"
                  placeholder="Enter your email"
                  v-model="newsletterEmail"
                  required
                >
                <button class="btn btn-primary" type="submit" :disabled="subscribing">
                  <span v-if="subscribing" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-paper-plane me-1"></i>
                  Subscribe
                </button>
              </div>
            </form>
            <div v-if="subscriptionMessage" class="alert alert-success alert-sm">
              {{ subscriptionMessage }}
            </div>
          </div>
        </div>

        <hr class="my-4">

        <!-- Bottom Section -->
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="text-muted mb-0">
              &copy; {{ currentYear }} Quiz Master. All rights reserved.
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <span class="text-muted">
              Made with <i class="fas fa-heart text-danger"></i> for learners everywhere
            </span>
          </div>
        </div>
      </div>

      <!-- Contact Modal -->
      <div v-if="showContact" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Contact Us</h5>
              <button type="button" class="btn-close" @click="showContact = false"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-12 mb-3">
                  <h6><i class="fas fa-envelope me-2"></i>Email</h6>
                  <p class="text-muted">support@quizmaster.com</p>
                </div>
                <div class="col-12 mb-3">
                  <h6><i class="fas fa-phone me-2"></i>Phone</h6>
                  <p class="text-muted">+1 (555) 123-4567</p>
                </div>
                <div class="col-12 mb-3">
                  <h6><i class="fas fa-map-marker-alt me-2"></i>Address</h6>
                  <p class="text-muted">
                    123 Learning Street<br>
                    Education City, EC 12345<br>
                    United States
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showContact = false">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Modal -->
      <div v-if="showHelp" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Help Center</h5>
              <button type="button" class="btn-close" @click="showHelp = false"></button>
            </div>
            <div class="modal-body">
              <h6>Getting Started</h6>
              <p>1. Create an account or login to access quizzes</p>
              <p>2. Browse available subjects from your dashboard</p>
              <p>3. Select a quiz and start testing your knowledge</p>
              
              <h6>Taking Quizzes</h6>
              <p>• Read questions carefully before selecting answers</p>
              <p>• You can review your answers before submitting</p>
              <p>• Results are shown immediately after completion</p>
              
              <h6>Tracking Progress</h6>
              <p>• View your quiz history in the dashboard</p>
              <p>• Check your performance analytics</p>
              <p>• Set learning goals and track achievements</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="showHelp = false">
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Modal -->
      <div v-if="showFAQ" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Frequently Asked Questions</h5>
              <button type="button" class="btn-close" @click="showFAQ = false"></button>
            </div>
            <div class="modal-body">
              <div class="accordion" id="faqAccordion">
                <div class="accordion-item" v-for="(faq, index) in faqs" :key="index">
                  <h2 class="accordion-header">
                    <button 
                      class="accordion-button collapsed" 
                      type="button" 
                      :data-bs-target="'#faq' + index"
                      @click="toggleFAQ(index)"
                    >
                      {{ faq.question }}
                    </button>
                  </h2>
                  <div :id="'faq' + index" class="accordion-collapse collapse" :class="{ show: activeFAQ === index }">
                    <div class="accordion-body">
                      {{ faq.answer }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="showFAQ = false">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy Modal -->
      <div v-if="showPrivacy" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Privacy Policy</h5>
              <button type="button" class="btn-close" @click="showPrivacy = false"></button>
            </div>
            <div class="modal-body">
              <h6>Information Collection</h6>
              <p>We collect information you provide when creating an account and taking quizzes.</p>
              
              <h6>Data Usage</h6>
              <p>Your data is used to provide personalized learning experiences and improve our services.</p>
              
              <h6>Information Security</h6>
              <p>We implement industry-standard security measures to protect your personal information.</p>
              
              <h6>Third-Party Sharing</h6>
              <p>We do not sell or share your personal information with third parties without your consent.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="showPrivacy = false">
                Understood
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  data() {
    return {
      newsletterEmail: '',
      subscribing: false,
      subscriptionMessage: '',
      showContact: false,
      showHelp: false,
      showFAQ: false,
      showPrivacy: false,
      activeFAQ: null,
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click on the 'Register' button and fill in your details. You'll need to provide your name, email, and create a secure password."
        },
        {
          question: "Are the quizzes free?",
          answer: "Yes! All basic quizzes are completely free. We may introduce premium features in the future, but the core functionality will always remain free."
        },
        {
          question: "How are quiz scores calculated?",
          answer: "Scores are calculated based on the number of correct answers divided by total questions, expressed as a percentage. Time bonuses may apply for quick completion."
        },
        {
          question: "Can I retake quizzes?",
          answer: "Yes, you can retake quizzes as many times as you want. Your best score will be recorded in your progress history."
        },
        {
          question: "How do I track my progress?",
          answer: "Your dashboard shows detailed analytics including quiz scores, subjects studied, time spent learning, and achievement badges earned."
        },
        {
          question: "Is my data secure?",
          answer: "Absolutely! We use industry-standard encryption and security measures to protect your personal information and quiz data."
        }
      ]
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
    isAuthenticated() {
      return !!localStorage.getItem('auth_token')
    },
    userRole() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.role || 'user'
    }
  },
  methods: {
    async subscribeNewsletter() {
      if (!this.newsletterEmail) return

      this.subscribing = true
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.subscriptionMessage = 'Successfully subscribed to newsletter!'
        this.newsletterEmail = ''
        
        setTimeout(() => {
          this.subscriptionMessage = ''
        }, 3000)
      } catch (error) {
        console.error('Newsletter subscription error:', error)
      } finally {
        this.subscribing = false
      }
    },
    
    toggleFAQ(index) {
      this.activeFAQ = this.activeFAQ === index ? null : index
    }
  }
}
