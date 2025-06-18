const UserProfile = {
  template: `
    <div class="container mt-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="fas fa-user-circle text-primary me-2"></i>My Profile
              </h2>
              <p class="text-muted mb-0">Manage your account settings and view your progress</p>
            </div>
            <router-link to="/user/dashboard" class="btn btn-outline-secondary">
              <i class="fas fa-arrow-left me-2"></i>Back to Dashboard
            </router-link>
          </div>
        </div>
      </div>

      <!-- Alert Messages -->
      <div v-if="alert.show" :class="'alert alert-' + alert.type + ' alert-dismissible fade show'" role="alert">
        {{ alert.message }}
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>

      <div class="row">
        <!-- Profile Information -->
        <div class="col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">
                <i class="fas fa-user me-2"></i>Profile Information
              </h5>
            </div>
            <div class="card-body text-center">
              <div class="profile-avatar mb-3">
                <i class="fas fa-user-circle fa-5x text-primary"></i>
              </div>
              <h4 class="mb-1">{{ user.username }}</h4>
              <p class="text-muted mb-3">{{ user.email }}</p>
              
              <div class="profile-stats">
                <div class="row text-center">
                  <div class="col-4">
                    <h5 class="text-primary mb-0">{{ userStats.totalAttempts }}</h5>
                    <small class="text-muted">Quizzes</small>
                  </div>
                  <div class="col-4">
                    <h5 class="text-success mb-0">{{ userStats.averageScore }}%</h5>
                    <small class="text-muted">Avg Score</small>
                  </div>
                  <div class="col-4">
                    <h5 class="text-warning mb-0">{{ userStats.bestScore }}%</h5>
                    <small class="text-muted">Best Score</small>
                  </div>
                </div>
              </div>

              <hr>
              
              <div class="d-grid gap-2">
                <button @click="toggleEditMode" class="btn btn-outline-primary">
                  <i class="fas fa-edit me-2"></i>Edit Profile
                </button>
                <button @click="showDeleteModal" class="btn btn-outline-danger">
                  <i class="fas fa-trash me-2"></i>Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Details & Edit Form -->
        <div class="col-lg-8">
          <!-- View Mode -->
          <div v-if="!editMode" class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-info-circle text-info me-2"></i>Account Details
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Username</label>
                  <div class="form-control-plaintext">{{ user.username }}</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Email Address</label>
                  <div class="form-control-plaintext">{{ user.email }}</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Member Since</label>
                  <div class="form-control-plaintext">{{ formatDate(user.created_at) }}</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Account Status</label>
                  <div class="form-control-plaintext">
                    <span class="badge bg-success">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="card mb-4">
            <div class="card-header bg-warning">
              <h5 class="card-title mb-0 text-dark">
                <i class="fas fa-edit me-2"></i>Edit Profile
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateProfile">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="username" class="form-label">Username *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="username"
                      v-model="editForm.username"
                      :class="{ 'is-invalid': errors.username }"
                      required
                    >
                    <div v-if="errors.username" class="invalid-feedback">
                      {{ errors.username }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email Address *</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="editForm.email"
                      :class="{ 'is-invalid': errors.email }"
                      required
                    >
                    <div v-if="errors.email" class="invalid-feedback">
                      {{ errors.email }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="password" class="form-label">New Password</label>
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      v-model="editForm.password"
                      placeholder="Leave blank to keep current password"
                    >
                    <div class="form-text">Leave blank if you don't want to change password</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      class="form-control"
                      id="confirmPassword"
                      v-model="editForm.confirmPassword"
                      :class="{ 'is-invalid': errors.confirmPassword }"
                      placeholder="Confirm new password"
                    >
                    <div v-if="errors.confirmPassword" class="invalid-feedback">
                      {{ errors.confirmPassword }}
                    </div>
                  </div>
                </div>
                
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-success" :disabled="updating">
                    <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="fas fa-save me-2"></i>
                    {{ updating ? 'Updating...' : 'Update Profile' }}
                  </button>
                  <button type="button" @click="cancelEdit" class="btn btn-secondary">
                    <i class="fas fa-times me-2"></i>Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Subject Statistics -->
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-pie text-success me-2"></i>Subject Performance
              </h5>
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
              </div>
              <div v-else-if="subjectStats.length === 0" class="text-center py-4 text-muted">
                <i class="fas fa-chart-bar fa-3x mb-3 opacity-50"></i>
                <p>No quiz attempts yet. Start taking quizzes to see your performance!</p>
              </div>
              <div v-else>
                <div class="row">
                  <div v-for="subject in subjectStats" :key="subject.subject_id" 
                       class="col-md-6 mb-3">
                    <div class="card border-0 bg-light">
                      <div class="card-body">
                        <h6 class="card-title text-primary">{{ subject.subject_name }}</h6>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <small class="text-muted">Quizzes Attempted:</small>
                          <span class="badge bg-primary">{{ subject.quizzes_attempted }}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">Average Score:</small>
                          <span :class="getScoreClass(subject.total_score / subject.quizzes_attempted)">
                            {{ Math.round(subject.total_score / subject.quizzes_attempted) }}%
                          </span>
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

      <!-- Delete Account Modal -->
      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle me-2"></i>Delete Account
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning">
                <i class="fas fa-warning me-2"></i>
                <strong>Warning!</strong> This action cannot be undone.
              </div>
              <p>Are you sure you want to delete your account? This will permanently remove:</p>
              <ul>
                <li>Your profile information</li>
                <li>All quiz attempts and scores</li>
                <li>Your progress and statistics</li>
              </ul>
              <p class="mb-3">Type <strong>DELETE</strong> to confirm:</p>
              <input
                type="text"
                class="form-control"
                v-model="deleteConfirmation"
                placeholder="Type DELETE to confirm"
              >
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteAccount"
                :disabled="deleteConfirmation !== 'DELETE' || deleting"
              >
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-trash me-2"></i>
                {{ deleting ? 'Deleting...' : 'Delete Account' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: true,
      updating: false,
      deleting: false,
      editMode: false,
      user: {
        id: null,
        username: '',
        email: '',
        created_at: null
      },
      editForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      userStats: {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0
      },
      subjectStats: [],
      errors: {},
      alert: {
        show: false,
        message: '',
        type: 'info'
      },
      deleteConfirmation: ''
    }
  },
  methods: {
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/user/profile', {
          headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          this.user = {
            id: data.id,
            username: data.username,
            email: data.email,
            created_at: new Date().toISOString() // Since created_at might not be in API
          }
          
          this.subjectStats = data.subject_statistics || []
          
          // Calculate user stats from recent attempts
          if (data.recent_attempts && data.recent_attempts.length > 0) {
            this.userStats.totalAttempts = data.recent_attempts.length
            const scores = data.recent_attempts.map(a => a.score)
            this.userStats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            this.userStats.bestScore = Math.max(...scores)
          }

          // Initialize edit form
          this.editForm.username = this.user.username
          this.editForm.email = this.user.email
        } else {
          throw new Error('Failed to fetch profile')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        this.showAlert('Error loading profile data', 'danger')
      } finally {
        this.loading = false
      }
    },

    toggleEditMode() {
      this.editMode = !this.editMode
      if (this.editMode) {
        this.editForm.username = this.user.username
        this.editForm.email = this.user.email
        this.editForm.password = ''
        this.editForm.confirmPassword = ''
        this.errors = {}
      }
    },

    cancelEdit() {
      this.editMode = false
      this.editForm.username = this.user.username
      this.editForm.email = this.user.email
      this.editForm.password = ''
      this.editForm.confirmPassword = ''
      this.errors = {}
    },

    validateForm() {
      this.errors = {}
      
      if (!this.editForm.username.trim()) {
        this.errors.username = 'Username is required'
      }
      
      if (!this.editForm.email.trim()) {
        this.errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(this.editForm.email)) {
        this.errors.email = 'Please enter a valid email address'
      }
      
      if (this.editForm.password && this.editForm.password !== this.editForm.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match'
      }
      
      if (this.editForm.password && this.editForm.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters long'
      }
      
      return Object.keys(this.errors).length === 0
    },

    async updateProfile() {
      if (!this.validateForm()) {
        return
      }

      this.updating = true
      try {
        const token = localStorage.getItem('auth_token')
        const updateData = {
          username: this.editForm.username,
          email: this.editForm.email
        }
        
        if (this.editForm.password) {
          updateData.password = this.editForm.password
        }

        const response = await fetch('/user/profile', {
          method: 'PUT',
          headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })

        const data = await response.json()

        if (response.ok) {
          this.user.username = this.editForm.username
          this.user.email = this.editForm.email
          this.editMode = false
          this.showAlert('Profile updated successfully!', 'success')
        } else {
          this.showAlert(data.error || 'Failed to update profile', 'danger')
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        this.showAlert('Error updating profile', 'danger')
      } finally {
        this.updating = false
      }
    },

    showDeleteModal() {
      this.deleteConfirmation = ''
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'))
      modal.show()
    },

    async deleteAccount() {
      if (this.deleteConfirmation !== 'DELETE') {
        return
      }

      this.deleting = true
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/user/profile', {
          method: 'DELETE',
          headers: {
            'Authentication-Token': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          localStorage.removeItem('auth_token')
          this.showAlert('Account deleted successfully', 'success')
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        } else {
          const data = await response.json()
          this.showAlert(data.error || 'Failed to delete account', 'danger')
        }
      } catch (error) {
        console.error('Error deleting account:', error)
        this.showAlert('Error deleting account', 'danger')
      } finally {
        this.deleting = false
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'))
        modal.hide()
      }
    },

    getScoreClass(score) {
      if (score >= 80) return 'badge bg-success'
      if (score >= 60) return 'badge bg-warning'
      return 'badge bg-danger'
    },

    formatDate(dateString) {
      if (!dateString) return 'Recently'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    showAlert(message, type = 'info') {
      this.alert = {
        show: true,
        message,
        type
      }
      setTimeout(() => {
        this.hideAlert()
      }, 5000)
    },

    hideAlert() {
      this.alert.show = false
    }
  },

  async mounted() {
    await this.fetchUserProfile()
  }
}

export default UserProfile