const AdminUsers = {
  template: `
    <div class="container mt-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="fas fa-users text-primary me-2"></i>User Management
              </h2>
              <p class="text-muted mb-0">Manage registered users</p>
            </div>
            <router-link to="/admin" class="btn btn-outline-secondary">
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

      <!-- Search and Filter -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search users by name or email..."
              v-model="searchQuery"
              @input="filterUsers"
            >
          </div>
        </div>
        <div class="col-md-6 text-end">
          <div class="btn-group">
            <button class="btn btn-outline-primary" @click="refreshUsers">
              <i class="fas fa-sync-alt me-2"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="card-title mb-0">
            <i class="fas fa-list me-2"></i>All Users ({{ filteredUsers.length }})
          </h5>
        </div>
        <div class="card-body p-0">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading users...</p>
          </div>

          <div v-else-if="filteredUsers.length === 0" class="text-center py-5">
            <i class="fas fa-users fa-3x text-muted mb-3"></i>
            <p class="text-muted">{{ searchQuery ? 'No users found matching your search.' : 'No users registered yet.' }}</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td class="align-middle">
                    <span class="badge bg-secondary">#{{ user.id }}</span>
                  </td>
                  <td class="align-middle">
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-2">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </div>
                      <strong>{{ user.username }}</strong>
                    </div>
                  </td>
                  <td class="align-middle">{{ user.email }}</td>
                  <td class="align-middle">
                    <span :class="getRoleBadgeClass(user.role || 'user')">
                      {{ (user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1) }}
                    </span>
                  </td>
                  <td class="align-middle">
                    <span class="badge bg-success">Active</span>
                  </td>
                  <td class="align-middle">
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-info"
                        @click="viewUser(user)"
                        title="View User"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="confirmDelete(user)"
                        title="Delete User"
                        :disabled="user.role === 'admin'"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="card-footer">
          <nav>
            <ul class="pagination justify-content-center mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="fas fa-angle-left"></i>
                </button>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item" 
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="fas fa-angle-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- User Detail Modal -->
      <div class="modal fade" id="userModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-info text-white">
              <h5 class="modal-title">
                <i class="fas fa-user me-2"></i>User Details
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" v-if="selectedUser">
              <div class="row">
                <div class="col-md-6">
                  <h6 class="text-muted">Basic Information</h6>
                  <table class="table table-borderless">
                    <tr>
                      <td><strong>ID:</strong></td>
                      <td>{{ selectedUser.id }}</td>
                    </tr>
                    <tr>
                      <td><strong>Username:</strong></td>
                      <td>{{ selectedUser.username }}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td>{{ selectedUser.email }}</td>
                    </tr>
                    <tr>
                      <td><strong>Role:</strong></td>
                      <td>
                        <span :class="getRoleBadgeClass(selectedUser.role || 'user')">
                          {{ (selectedUser.role || 'user').charAt(0).toUpperCase() + (selectedUser.role || 'user').slice(1) }}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-6">
                  <h6 class="text-muted">Account Status</h6>
                  <div class="text-center py-3">
                    <div class="avatar-circle-lg mb-3">
                      {{ selectedUser.username.charAt(0).toUpperCase() }}
                    </div>
                    <h5>{{ selectedUser.username }}</h5>
                    <span class="badge bg-success">Active Account</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle me-2"></i>Confirm Delete
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" v-if="userToDelete">
              <div class="text-center">
                <i class="fas fa-user-times fa-3x text-danger mb-3"></i>
                <h5>Delete User Account?</h5>
                <p>Are you sure you want to delete <strong>{{ userToDelete.username }}</strong>?</p>
                <div class="alert alert-warning">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  This action cannot be undone. All user data will be permanently removed.
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                class="btn btn-danger"
                @click="deleteUser"
                :disabled="deleting"
              >
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-trash me-2"></i>
                {{ deleting ? 'Deleting...' : 'Delete User' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: false,
      deleting: false,
      users: [],
      filteredUsers: [],
      selectedUser: null,
      userToDelete: null,
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      alert: {
        show: false,
        message: '',
        type: 'info'
      }
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage)
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredUsers.slice(start, end)
    },
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/admin/users', {
          headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          this.users = await response.json()
          this.filteredUsers = [...this.users]
        } else {
          throw new Error('Failed to fetch users')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        this.showAlert('Error loading users', 'danger')
      } finally {
        this.loading = false
      }
    },

    filterUsers() {
      if (!this.searchQuery.trim()) {
        this.filteredUsers = [...this.users]
      } else {
        const query = this.searchQuery.toLowerCase()
        this.filteredUsers = this.users.filter(user =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }
      this.currentPage = 1
    },

    viewUser(user) {
      this.selectedUser = user
      const modal = new bootstrap.Modal(document.getElementById('userModal'))
      modal.show()
    },

    confirmDelete(user) {
      this.userToDelete = user
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'))
      modal.show()
    },

    async deleteUser() {
      if (!this.userToDelete) return

      this.deleting = true
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/admin/user/${this.userToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token':token,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          this.users = this.users.filter(u => u.id !== this.userToDelete.id)
          this.filterUsers()
          this.showAlert('User deleted successfully', 'success')
          
          const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'))
          modal.hide()
        } else {
          const data = await response.json()
          throw new Error(data.message || 'Failed to delete user')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        this.showAlert(error.message || 'Error deleting user', 'danger')
      } finally {
        this.deleting = false
        this.userToDelete = null
      }
    },

    async refreshUsers() {
      await this.fetchUsers()
      this.showAlert('Users list refreshed', 'success')
    },

    getRoleBadgeClass(role) {
      const classes = {
        'admin': 'badge bg-danger',
        'user': 'badge bg-primary',
        'moderator': 'badge bg-warning'
      }
      return classes[role] || 'badge bg-secondary'
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
    await this.fetchUsers()
  }
}

export default AdminUsers