const AdminSubjects = {
  template: `
    <div class="container mt-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="fas fa-book text-primary me-2"></i>Manage Subjects
              </h2>
              <p class="text-muted mb-0">Create, edit, and organize subjects</p>
            </div>
            <div class="d-flex gap-2">
              <button @click="showCreateModal" class="btn btn-primary">
                <i class="fas fa-plus me-2"></i>Add Subject
              </button>
              <router-link to="/admin/dashboard" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-2"></i>Back to Dashboard
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Messages -->
      <div v-if="alert.show" :class="'alert alert-' + alert.type + ' alert-dismissible fade show'" role="alert">
        {{ alert.message }}
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3 text-muted">Loading subjects...</p>
      </div>

      <!-- Subjects List -->
      <div v-else class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-list text-info me-2"></i>All Subjects ({{ subjects.length }})
              </h5>
            </div>
            <div class="card-body">
              <div v-if="subjects.length === 0" class="text-center py-5">
                <i class="fas fa-book fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No subjects found</h5>
                <p class="text-muted">Create your first subject to get started!</p>
                <button @click="showCreateModal" class="btn btn-primary">
                  <i class="fas fa-plus me-2"></i>Add Subject
                </button>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Subject Name</th>
                      <th>Chapters</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="subject in subjects" :key="subject.id">
                      <td>
                        <span class="badge bg-secondary">{{ subject.id }}</span>
                      </td>
                      <td>
                        <h6 class="mb-0">{{ subject.name }}</h6>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ subject.chapters_count }} chapters</span>
                      </td>
                      <td>
                        <div class="btn-group" role="group">
                          <router-link 
                            :to="'/admin/subjects/' + subject.id + '/chapters'" 
                            class="btn btn-sm btn-outline-info"
                            title="View Chapters"
                          >
                            <i class="fas fa-eye"></i>
                          </router-link>
                          <button 
                            @click="editSubject(subject)" 
                            class="btn btn-sm btn-outline-warning"
                            title="Edit Subject"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            @click="confirmDelete(subject)" 
                            class="btn btn-sm btn-outline-danger"
                            title="Delete Subject"
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
          </div>
        </div>
      </div>

      <!-- Create/Edit Subject Modal -->
      <div class="modal fade" id="subjectModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header" :class="isEditing ? 'bg-warning' : 'bg-primary text-white'">
              <h5 class="modal-title" :class="isEditing ? 'text-dark' : ''">
                <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'" class="me-2"></i>
                {{ isEditing ? 'Edit Subject' : 'Create New Subject' }}
              </h5>
              <button type="button" class="btn-close" :class="isEditing ? '' : 'btn-close-white'" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveSubject">
                <div class="mb-3">
                  <label for="subjectName" class="form-label">Subject Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="subjectName"
                    v-model="subjectForm.name"
                    :class="{ 'is-invalid': errors.name }"
                    placeholder="Enter subject name"
                    required
                  >
                  <div v-if="errors.name" class="invalid-feedback">
                    {{ errors.name }}
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                @click="saveSubject" 
                class="btn" 
                :class="isEditing ? 'btn-warning' : 'btn-primary'"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
                {{ saving ? 'Saving...' : (isEditing ? 'Update Subject' : 'Create Subject') }}
              </button>
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
                <i class="fas fa-exclamation-triangle me-2"></i>Delete Subject
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning">
                <i class="fas fa-warning me-2"></i>
                <strong>Warning!</strong> This action cannot be undone.
              </div>
              <p>Are you sure you want to delete the subject <strong>"{{ subjectToDelete?.name }}"</strong>?</p>
              <p class="text-muted">This will also delete all associated chapters, quizzes, and questions.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteSubject"
                :disabled="deleting"
              >
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-trash me-2"></i>
                {{ deleting ? 'Deleting...' : 'Delete Subject' }}
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
      saving: false,
      deleting: false,
      subjects: [],
      subjectForm: {
        name: ''
      },
      isEditing: false,
      editingId: null,
      subjectToDelete: null,
      errors: {},
      alert: {
        show: false,
        message: '',
        type: 'info'
      }
    }
  },
  methods: {
    async fetchSubjects() {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/admin/subjects', {
          headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          this.subjects = await response.json()
        } else {
          throw new Error('Failed to fetch subjects')
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
        this.showAlert('Error loading subjects', 'danger')
      } finally {
        this.loading = false
      }
    },

    showCreateModal() {
      this.isEditing = false
      this.editingId = null
      this.subjectForm.name = ''
      this.errors = {}
      const modal = new bootstrap.Modal(document.getElementById('subjectModal'))
      modal.show()
    },

    editSubject(subject) {
      this.isEditing = true
      this.editingId = subject.id
      this.subjectForm.name = subject.name
      this.errors = {}
      const modal = new bootstrap.Modal(document.getElementById('subjectModal'))
      modal.show()
    },

    validateForm() {
      this.errors = {}
      
      if (!this.subjectForm.name.trim()) {
        this.errors.name = 'Subject name is required'
      }
      
      return Object.keys(this.errors).length === 0
    },

    async saveSubject() {
      if (!this.validateForm()) {
        return
      }

      this.saving = true
      try {
        const token = localStorage.getItem('auth_token')
        const url = this.isEditing ? `/admin/subject/${this.editingId}` : '/admin/subject'
        const method = this.isEditing ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.subjectForm.name
          })
        })

        const data = await response.json()

        if (response.ok) {
          this.showAlert(
            this.isEditing ? 'Subject updated successfully!' : 'Subject created successfully!', 
            'success'
          )
          await this.fetchSubjects()
          const modal = bootstrap.Modal.getInstance(document.getElementById('subjectModal'))
          modal.hide()
        } else {
          this.showAlert(data.error || 'Failed to save subject', 'danger')
        }
      } catch (error) {
        console.error('Error saving subject:', error)
        this.showAlert('Error saving subject', 'danger')
      } finally {
        this.saving = false
      }
    },

    confirmDelete(subject) {
      this.subjectToDelete = subject
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'))
      modal.show()
    },

    async deleteSubject() {
      if (!this.subjectToDelete) return

      this.deleting = true
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/admin/subject/${this.subjectToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          this.showAlert('Subject deleted successfully!', 'success')
          await this.fetchSubjects()
          const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'))
          modal.hide()
        } else {
          const data = await response.json()
          this.showAlert(data.error || 'Failed to delete subject', 'danger')
        }
      } catch (error) {
        console.error('Error deleting subject:', error)
        this.showAlert('Error deleting subject', 'danger')
      } finally {
        this.deleting = false
      }
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
    await this.fetchSubjects()
  }
}

export default AdminSubjects