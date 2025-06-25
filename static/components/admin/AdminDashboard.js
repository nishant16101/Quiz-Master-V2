const AdminDashboard = {
  template: `
    <div class="container mt-4">
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="fas fa-tachometer-alt text-primary me-2"></i>Admin Dashboard
              </h2>
              <p class="text-muted mb-0">Manage your quiz application</p>
            </div>
            <div class="dropdown">
              <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-cog me-2"></i>Quick Actions
              </button>
              <ul class="dropdown-menu">
                <li><router-link class="dropdown-item" to="/admin/subjects">
                  <i class="fas fa-book me-2"></i>Add Subject
                </router-link></li>
                <li><router-link class="dropdown-item" to="/admin/chapters">
                  <i class="fas fa-bookmark me-2"></i>Add Chapter
                </router-link></li>
                <li><router-link class="dropdown-item" to="/admin/quizzes">
                  <i class="fas fa-question-circle me-2"></i>Add Quiz
                </router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <button class="dropdown-item" @click="triggerAdminUsersExport" :disabled="csvExportLoading">
                        <span v-if="csvExportLoading" class="spinner-border spinner-border-sm me-1"></span>
                        <i v-else class="fas fa-file-csv me-2"></i>Download All Users CSV
                    </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="alert.show" :class="'alert alert-' + alert.type + ' alert-dismissible fade show'" role="alert">
        {{ alert.message }}
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>

      <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-primary text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.totalUsers }}</h4>
                  <p class="mb-0">Total Users</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-users fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
            <div class="card-footer bg-primary border-0">
              <router-link to="/admin/users" class="text-white text-decoration-none">
                View Details <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.totalSubjects }}</h4>
                  <p class="mb-0">Subjects</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-book fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
            <div class="card-footer bg-success border-0">
              <router-link to="/admin/subjects" class="text-white text-decoration-none">
                Manage <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-info text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.totalQuizzes }}</h4>
                  <p class="mb-0">Quizzes</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-question-circle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
            <div class="card-footer bg-info border-0">
              <router-link to="/admin/quizzes" class="text-white text-decoration-none">
                Manage <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-1">{{ stats.totalQuestions }}</h4>
                  <p class="mb-0">Questions</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-list-alt fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
            <div class="card-footer bg-warning border-0">
              <router-link to="/admin/questions" class="text-white text-decoration-none">
                Manage <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8 mb-4">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-tasks text-primary me-2"></i>Quick Management
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <router-link to="/admin/users" class="btn btn-outline-primary btn-lg">
                      <i class="fas fa-users me-2"></i>
                      <div>
                        <div class="fw-bold">Manage Users</div>
                        <small class="text-muted">View and manage user accounts</small>
                      </div>
                    </router-link>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <router-link to="/admin/subjects" class="btn btn-outline-success btn-lg">
                      <i class="fas fa-book me-2"></i>
                      <div>
                        <div class="fw-bold">Manage Subjects</div>
                        <small class="text-muted">Add and organize subjects</small>
                      </div>
                    </router-link>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <router-link to="/admin/chapters" class="btn btn-outline-info btn-lg">
                      <i class="fas fa-bookmark me-2"></i>
                      <div>
                        <div class="fw-bold">Manage Chapters</div>
                        <small class="text-muted">Organize content by chapters</small>
                      </div>
                    </router-link>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <router-link to="/admin/quizzes" class="btn btn-outline-warning btn-lg">
                      <i class="fas fa-question-circle me-2"></i>
                      <div>
                        <div class="fw-bold">Manage Quizzes</div>
                        <small class="text-muted">Create and edit quizzes</small>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-clock text-info me-2"></i>System Status
              </h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <i class="fas fa-circle text-success me-2"></i>
                    <small>Database</small>
                  </div>
                  <span class="badge bg-success">Online</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <i class="fas fa-circle text-success me-2"></i>
                    <small>API Services</small>
                  </div>
                  <span class="badge bg-success">Running</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <i class="fas fa-circle text-warning me-2"></i>
                    <small>Cache</small>
                  </div>
                  <span class="badge bg-warning">Optimizing</span>
                </div>
              </div>
              
              <hr>
              
              <div class="text-center">
                <p class="text-muted mb-2">
                  <small>Last updated: {{ new Date().toLocaleString() }}</small>
                </p>
                <button @click="refreshStats" class="btn btn-sm btn-outline-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      loading: false,
      csvExportLoading: false, // New state for CSV export button
      stats: {
        totalUsers: 0,
        totalSubjects: 0,
        totalQuizzes: 0,
        totalQuestions: 0
      },
      alert: {
        show: false,
        message: '',
        type: 'info'
      },
      csvTaskId: null, // To store the task ID for CSV export
      csvInterval: null // To store the interval for polling CSV status
    }
  },
  methods: {
    async fetchStats() {
      this.loading = true
      try {
        const token = localStorage.getItem('auth_token')
        
        const [usersRes, subjectsRes, quizzesRes, questionsRes] = await Promise.all([
          fetch('/admin/users', {
            headers: { 'Authentication-Token': token }
          }),
          fetch('/admin/subjects', {
            headers: { 'Authentication-Token':token}
          }),
          fetch('/admin/quizzes', {
            headers: { 'Authentication-Token': token }
          }),
          fetch('/admin/questions', {
            headers: { 'Authentication-Token':token}
          })
        ])

        if (usersRes.ok) {
          const users = await usersRes.json()
          this.stats.totalUsers = users.length
        }

        if (subjectsRes.ok) {
          const subjects = await subjectsRes.json()
          this.stats.totalSubjects = subjects.length
        }

        if (quizzesRes.ok) {
          const quizzes = await quizzesRes.json()
          this.stats.totalQuizzes = quizzes.length
        }

        if (questionsRes.ok) {
          const questions = await questionsRes.json()
          this.stats.totalQuestions = questions.length
        }

      } catch (error) {
        console.error('Error fetching stats:', error)
        this.showAlert('Error loading dashboard statistics', 'danger')
      } finally {
        this.loading = false
      }
    },

    async refreshStats() {
      await this.fetchStats()
      this.showAlert('Statistics refreshed successfully', 'success')
    },

    showAlert(message, type = 'info') {
      this.alert = {
        show: true,
        message,
        type
      }
      setTimeout(() => {
        this.hideAlert()
      }, 3000)
    },

    hideAlert() {
      this.alert.show = false
    },

    // --- CSV Export Methods ---
    async triggerAdminUsersExport() {
      this.csvExportLoading = true;
      this.showAlert('Starting CSV export for all users...', 'info');
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/export/users', {
          method: 'POST',
          headers: { 'Authentication-Token': token }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.csvTaskId = data.task_id;
        this.showAlert('CSV export task started. Please wait...', 'info');
        this.startCsvStatusPolling();

      } catch (error) {
        console.error('Error triggering admin users export:', error);
        this.showAlert('Failed to start CSV export.', 'danger');
        this.csvExportLoading = false;
      }
    },

    startCsvStatusPolling() {
      // Clear any existing interval to prevent multiple polling loops
      if (this.csvInterval) {
        clearInterval(this.csvInterval);
      }

      this.csvInterval = setInterval(async () => {
        if (!this.csvTaskId) {
          clearInterval(this.csvInterval);
          return;
        }

        const token = localStorage.getItem('auth_token');
        try {
          const response = await fetch(`/api/export/status/${this.csvTaskId}`, {
            headers: { 'Authentication-Token': token }
          });
          const data = await response.json();

          if (data.state === 'SUCCESS') {
            clearInterval(this.csvInterval);
            this.showAlert('CSV export completed successfully! You can now download the file.', 'success');
            // Optionally, you can directly call download here or enable a download button
            this.downloadCsvFile(this.csvTaskId);
            this.csvExportLoading = false;
            this.csvTaskId = null; // Reset task ID after successful download
          } else if (data.state === 'FAILURE') {
            clearInterval(this.csvInterval);
            this.showAlert(`CSV export failed: ${data.error || 'Unknown error'}`, 'danger');
            this.csvExportLoading = false;
            this.csvTaskId = null;
          } else {
            // Task is still PENDING or PROGRESS
            this.showAlert(`CSV export status: ${data.status}`, 'info');
          }
        } catch (error) {
          console.error('Error checking CSV export status:', error);
          clearInterval(this.csvInterval);
          this.showAlert('Failed to check CSV export status.', 'danger');
          this.csvExportLoading = false;
          this.csvTaskId = null;
        }
      }, 3000); // Poll every 3 seconds
    },

    async downloadCsvFile(taskId) {
      try {
        const token = localStorage.getItem('auth_token');
        // Using 'download-and-cleanup' route for automatic file deletion after download
        const response = await fetch(`/api/export/download-and-cleanup/${taskId}`, {
          headers: { 'Authentication-Token': token }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'download.csv';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.showAlert('CSV file downloaded successfully!', 'success');
      } catch (error) {
        console.error('Error downloading CSV file:', error);
        this.showAlert('Failed to download CSV file.', 'danger');
      }
    }
  },

  async mounted() {
    await this.fetchStats()
  },
  // Clean up interval when component is unmounted
  beforeUnmount() {
    if (this.csvInterval) {
      clearInterval(this.csvInterval);
    }
  }
}

export default AdminDashboard