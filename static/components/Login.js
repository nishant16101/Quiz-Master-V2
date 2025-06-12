export default{
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="card-title">
                  <i class="fas fa-sign-in-alt text-primary me-2"></i>
                  Login
                </h2>
                <p class="text-muted">Welcome back! Please sign in to your account.</p>
              </div>

              <form @submit.prevent="login">
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
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="remember"
                    v-model="form.remember"
                  >
                  <label class="form-check-label" for="remember">
                    Remember me
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
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  {{ loading ? 'Signing In...' : 'Sign In' }}
                </button>

                <div class="text-center">
                  <p class="mb-0">
                    Don't have an account?
                    <router-link to="/register" class="text-decoration-none">
                      Sign up here
                    </router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <!-- Demo Accounts -->
          <div class="card mt-3 border-info">
            <div class="card-body">
              <h6 class="card-title text-info">
                <i class="fas fa-info-circle me-1"></i>
                Demo Accounts
              </h6>
              <div class="row">
                <div class="col-6">
                  <small class="text-muted d-block">Admin:</small>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-info"
                    @click="fillDemoCredentials('admin')"
                  >
                    admin@example.com
                  </button>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">User:</small>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-info"
                    @click="fillDemoCredentials('user')"
                  >
                    user@example.com
                  </button>
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
      form: {
        email: '',
        password: '',
        remember: false
      },
      errors: {},
      errorMessage: '',
      successMessage: '',
      loading: false,
      showPassword: false
    }
  },
  methods: {
    async login() {
      this.clearMessage();
      this.validateform();

      if (Object.keys(this.errors).length > 0) return;

      this.loading = true;
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('auth_token', data["auth_token"]);
          localStorage.setItem('user', JSON.stringify(data.user));

          if (this.form.remember) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('savedEmail', this.form.email);
          }

          this.successMessage = "Login successful";
          this.$emit('user-logged-in', data.user.id);

          setTimeout(() => {
            if (data.user.roles.includes("admin")) {
              this.$router.push('/admin/dashboard');
            } else {
              this.$router.push('/user/dashboard');
            }
          }, 1500);
        } else {
          this.errorMessage = data.message || "Login failed. Try Again";
        }
      } catch (error) {
        console.error('Login error', error);
        this.errorMessage = "Network error";
      } finally {
        this.loading = false;
      }
    },
    validateform() {
      this.errors = {};
      if (!this.form.email) {
        this.errors.email = "Email is required";
      } else if (!this.isValidEmail(this.form.email)) {
        this.errors.email = "Please enter a valid email address";
      }

      if (!this.form.password) {
        this.errors.password = "Password is required";
      }
    },
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    clearMessage() {
      this.errorMessage = '';
      this.successMessage = '';
      this.errors = {};
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    fillDemoCredentials(type) {
      if (type === 'admin') {
        this.form.email = 'admin@example.com';
        this.form.password = 'admin123';
      } else {
        this.form.email = 'user@example.com';
        this.form.password = 'user123';
      }
    }
  },
  mounted() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.roles && user.roles.includes("admin")) {
        this.$router.push('/admin/dashboard');
      } else {
        this.$router.push('user/dashboard');
      }
    }

    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe) {
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) {
        this.form.email = savedEmail;
        this.form.remember = true;
      }
    }
  }
}

