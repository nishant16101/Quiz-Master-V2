const Register = {
    template:`
        <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="card-title">
                  <i class="fas fa-user-plus text-primary me-2"></i>
                  Create Account
                </h2>
                <p class="text-muted">Join Quiz Master and start your learning journey!</p>
              </div>

              <form @submit.prevent="register">
                <div class="mb-3">
                  <label for="name" class="form-label">
                    <i class="fas fa-user me-1"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.name }"
                    id="name"
                    v-model="form.name"
                    placeholder="Enter your full name"
                    required
                  >
                  <div v-if="errors.name" class="invalid-feedback">
                    {{ errors.name }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">
                    <i class="fas fa-envelope me-1"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    id="email"
                    v-model="form.email"
                    placeholder="Enter your email"
                    required
                  >
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">
                    <i class="fas fa-lock me-1"></i>
                    Password
                  </label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      id="password"
                      v-model="form.password"
                      placeholder="Enter your password"
                      required
                    >
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="togglePassword"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div class="form-text">
                    Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.
                  </div>
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                  
                  <!-- Password Strength Indicator -->
                  <div v-if="form.password" class="mt-2">
                    <small class="text-muted">Password Strength:</small>
                    <div class="progress" style="height: 5px;">
                      <div 
                        class="progress-bar"
                        :class="passwordStrengthClass"
                        :style="{ width: passwordStrength + '%' }"
                      ></div>
                    </div>
                    <small :class="passwordStrengthTextClass">
                      {{ passwordStrengthText }}
                    </small>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">
                    <i class="fas fa-lock me-1"></i>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.confirmPassword }"
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    placeholder="Confirm your password"
                    required
                  >
                  <div v-if="errors.confirmPassword" class="invalid-feedback">
                    {{ errors.confirmPassword }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">
                    <i class="fas fa-phone me-1"></i>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': errors.phone }"
                    id="phone"
                    v-model="form.phone"
                    placeholder="Enter your phone number"
                  >
                  <div v-if="errors.phone" class="invalid-feedback">
                    {{ errors.phone }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="dateOfBirth" class="form-label">
                    <i class="fas fa-calendar me-1"></i>
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors.dateOfBirth }"
                    id="dateOfBirth"
                    v-model="form.dateOfBirth"
                    :max="maxDate"
                  >
                  <div v-if="errors.dateOfBirth" class="invalid-feedback">
                    {{ errors.dateOfBirth }}
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :class="{ 'is-invalid': errors.terms }"
                    id="terms"
                    v-model="form.terms"
                    required
                  >
                  <label class="form-check-label" for="terms">
                    I agree to the 
                    <a href="#" class="text-decoration-none" @click.prevent="showTerms = true">
                      Terms of Service
                    </a> 
                    and 
                    <a href="#" class="text-decoration-none" @click.prevent="showPrivacy = true">
                      Privacy Policy
                    </a>
                  </label>
                  <div v-if="errors.terms" class="invalid-feedback d-block">
                    {{ errors.terms }}
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="newsletter"
                    v-model="form.newsletter"
                  >
                  <label class="form-check-label" for="newsletter">
                    Subscribe to our newsletter for updates and tips
                  </label>
                </div>

                <div v-if="errorMessage" class="alert alert-danger" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <div v-if="successMessage" class="alert alert-success" role="alert">
                  <i class="fas fa-check-circle me-2"></i>
                  {{ successMessage }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-user-plus me-2"></i>
                  {{ loading ? 'Creating Account...' : 'Create Account' }}
                </button>

                <div class="text-center">
                  <p class="mb-0">
                    Already have an account?
                    <router-link to="/login" class="text-decoration-none">
                      Sign in here
                    </router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms Modal -->
      <div v-if="showTerms" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Terms of Service</h5>
              <button type="button" class="btn-close" @click="showTerms = false"></button>
            </div>
            <div class="modal-body">
              <h6>1. Acceptance of Terms</h6>
              <p>By using Quiz Master, you agree to these terms and conditions.</p>
              
              <h6>2. User Responsibilities</h6>
              <p>Users are responsible for maintaining account security and using the platform appropriately.</p>
              
              <h6>3. Content Usage</h6>
              <p>All quiz content is for educational purposes only and should not be redistributed without permission.</p>
              
              <h6>4. Privacy</h6>
              <p>We respect your privacy and protect your personal information as outlined in our Privacy Policy.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="showTerms = false">
                I Understand
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
              <h6>Information We Collect</h6>
              <p>We collect information you provide directly, such as account details and quiz responses.</p>
              
              <h6>How We Use Information</h6>
              <p>Information is used to provide services, improve user experience, and communicate with users.</p>
              
              <h6>Information Sharing</h6>
              <p>We do not sell or share personal information with third parties except as necessary to provide our services.</p>
              
              <h6>Data Security</h6>
              <p>We implement appropriate security measures to protect your personal information.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="showPrivacy = false">
                I Understand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
     data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',  // ✅ Fix: renamed from confirmpassword
        phone: '',
        dateOfBirth: '',
        terms: false,
        newsletter: false
      },
      errors: {},
      errorMessage: '',
      successMessage: '',
      loading: false,
      showPassword: false,
      showTerms: false,
      showPrivacy: false
    };
  },

  computed: {
    maxDate() {
      const today = new Date();
      today.setFullYear(today.getFullYear() - 13);
      return today.toISOString().split('T')[0];
    },

    passwordStrength() {
      const p = this.form.password;
      let strength = 0;
      if (p.length >= 8) strength += 25;
      if (/[A-Z]/.test(p)) strength += 25;
      if (/[a-z]/.test(p)) strength += 15;
      if (/\d/.test(p)) strength += 20;
      if (/[@$!%*?&]/.test(p)) strength += 15;
      return Math.min(strength, 100);
    },

    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength < 40) return 'bg-danger';
      if (strength < 70) return 'bg-warning';
      return 'bg-success';
    },

    passwordStrengthText() {
      const strength = this.passwordStrength;
      if (strength < 40) return 'Weak';
      if (strength < 70) return 'Moderate';
      return 'Strong';
    },

    passwordStrengthTextClass() {
      const strength = this.passwordStrength;
      if (strength < 40) return 'text-danger';
      if (strength < 70) return 'text-warning';
      return 'text-success';
    }
  },

methods: {
  async register() {
    this.validateForm();
    if (Object.keys(this.errors).length > 0) return;

    this.loading = true;
    try {
      const response = await fetch('/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: this.form.name,       // ✅ corrected key
          email: this.form.email,
          password: this.form.password
        })
      });

      const data = await response.json();
      if (response.ok) {
        this.successMessage = "Account created successfully. Redirecting to Login...";
        setTimeout(() => this.$router.push('/login'), 2000);
      } else {
        this.errorMessage = data.error || "Registration failed. Try again.";  // ✅ use 'error' instead of 'message'
      }
    } catch (err) {
      console.error("Registration error:", err);
      this.errorMessage = "Network error. Please try again later.";
    } finally {
      this.loading = false;
    }
  },

    validateForm() {
      this.errors = {};
      const { name, email, password, confirmPassword, terms } = this.form;

      if (!name.trim()) this.errors.name = "Full Name is required";
      else if (name.trim().length < 2) this.errors.name = "Name must be at least 2 characters long";

      if (!email) this.errors.email = "Email is required";
      else if (!this.isValidEmail(email)) this.errors.email = "Please enter a valid email address";

      if (!password) this.errors.password = "Password is required";
      else if (!this.isStrongPassword(password)) {
        this.errors.password = "Password must be at least 8 characters, contain uppercase, lowercase, number, and special character";
      }

      if (!confirmPassword) this.errors.confirmPassword = "Please confirm your password";
      else if (password !== confirmPassword) this.errors.confirmPassword = "Passwords do not match";

      if (!terms) this.errors.terms = "You must agree to the terms and privacy policy";
    },

    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isStrongPassword(password) {
      return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[@$!%*?&]/.test(password)
      );
    },

    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    clearMessages() {
      this.errors = {};
      this.errorMessage = '';
      this.successMessage = '';
    }
  },

  mounted() {
    const token = localStorage.getItem('auth_token');
    const currentPath = this.$route.path;

    if (token && currentPath !== '/register') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        this.$router.push('/admin');
      } else {
        this.$router.push('/dashboard');
      }
    }
  }
};

export default Register;