const AdminChapters = {
  template: `
    <div class="container mt-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="fas fa-book-open text-primary me-2"></i>Manage Chapters
                <span v-if="selectedSubject" class="text-muted fs-5"> - {{ selectedSubject.name }}</span>
              </h2>
              <p class="text-muted mb-0">Create, edit, and organize chapters</p>
            </div>
            <div class="d-flex gap-2">
              <button @click="showCreateModal" class="btn btn-primary" :disabled="!selectedSubject">
                <i class="fas fa-plus me-2"></i>Add Chapter
              </button>
              <router-link to="/admin/subjects" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-2"></i>Back to Subjects
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info (remove in production) -->
      <div class="alert alert-info" v-if="debugMode">
        <strong>Debug Info:</strong><br>
        Subjects loaded: {{ subjects.length }}<br>
        Subject ID: {{ subjectId }}<br>
        Selected Subject ID: {{ selectedSubjectId }}<br>
        Loading: {{ loading }}
      </div>

      <!-- Subject Selection -->
      <div class="row mb-4" v-if="!subjectId">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-filter text-info me-2"></i>Select Subject
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <select v-model="selectedSubjectId" @change="loadChaptersBySubject" class="form-select">
                    <option value="">Choose a subject...</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                      {{ subject.name }}
                    </option>
                  </select>
                  <div v-if="subjects.length === 0" class="form-text text-muted">
                    No subjects available. Please create a subject first.
                  </div>
                </div>
              </div>
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
        <p class="mt-3 text-muted">Loading chapters...</p>
      </div>

      <!-- Chapters List -->
      <div v-else-if="selectedSubject" class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-list text-info me-2"></i>Chapters in {{ selectedSubject.name }} ({{ chapters.length }})
              </h5>
            </div>
            <div class="card-body">
              <div v-if="chapters.length === 0" class="text-center py-5">
                <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No chapters found</h5>
                <p class="text-muted">Create your first chapter for this subject!</p>
                <button @click="showCreateModal" class="btn btn-primary">
                  <i class="fas fa-plus me-2"></i>Add Chapter
                </button>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Chapter Name</th>
                      <th>Subject</th>
                      <th>Quizzes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="chapter in chapters" :key="chapter.id">
                      <td>
                        <span class="badge bg-secondary">{{ chapter.id }}</span>
                      </td>
                      <td>
                        <h6 class="mb-0">{{ chapter.name }}</h6>
                      </td>
                      <td>
                        <span class="badge bg-primary">{{ chapter.subject_name || selectedSubject.name }}</span>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ chapter.quizzes_count || 0 }} quizzes</span>
                      </td>
                      <td>
                        <div class="btn-group" role="group">
                          <router-link 
                            :to="'/admin/chapters/' + chapter.id + '/quizzes'" 
                            class="btn btn-sm btn-outline-info"
                            title="View Quizzes"
                          >
                            <i class="fas fa-eye"></i>
                          </router-link>
                          <button 
                            @click="editChapter(chapter)" 
                            class="btn btn-sm btn-outline-warning"
                            title="Edit Chapter"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            @click="confirmDelete(chapter)" 
                            class="btn btn-sm btn-outline-danger"
                            title="Delete Chapter"
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

      <!-- Create/Edit Chapter Modal -->
      <div class="modal fade" id="chapterModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header" :class="isEditing ? 'bg-warning' : 'bg-primary text-white'">
              <h5 class="modal-title" :class="isEditing ? 'text-dark' : ''">
                <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'" class="me-2"></i>
                {{ isEditing ? 'Edit Chapter' : 'Create New Chapter' }}
              </h5>
              <button type="button" class="btn-close" :class="isEditing ? '' : 'btn-close-white'" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveChapter">
                <div class="mb-3">
                  <label for="chapterName" class="form-label">Chapter Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="chapterName"
                    v-model="chapterForm.name"
                    :class="{ 'is-invalid': errors.name }"
                    placeholder="Enter chapter name"
                    required
                  >
                  <div v-if="errors.name" class="invalid-feedback">
                    {{ errors.name }}
                  </div>
                </div>
                <div class="mb-3" v-if="!subjectId">
                  <label for="chapterSubject" class="form-label">Subject *</label>
                  <select
                    class="form-select"
                    id="chapterSubject"
                    v-model="chapterForm.subject_id"
                    :class="{ 'is-invalid': errors.subject_id }"
                    required
                  >
                    <option value="">Choose a subject...</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                      {{ subject.name }}
                    </option>
                  </select>
                  <div v-if="errors.subject_id" class="invalid-feedback">
                    {{ errors.subject_id }}
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                @click="saveChapter" 
                class="btn" 
                :class="isEditing ? 'btn-warning' : 'btn-primary'"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
                {{ saving ? 'Saving...' : (isEditing ? 'Update Chapter' : 'Create Chapter') }}
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
                <i class="fas fa-exclamation-triangle me-2"></i>Delete Chapter
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning">
                <i class="fas fa-warning me-2"></i>
                <strong>Warning!</strong> This action cannot be undone.
              </div>
              <p>Are you sure you want to delete the chapter <strong>"{{ chapterToDelete?.name }}"</strong>?</p>
              <p class="text-muted">This will also delete all associated quizzes and questions.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteChapter"
                :disabled="deleting"
              >
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-trash me-2"></i>
                {{ deleting ? 'Deleting...' : 'Delete Chapter' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  props: ['subjectId'],
  data() {
    return {
      loading: true,
      saving: false,
      deleting: false,
      chapters: [],
      subjects: [],
      selectedSubject: null,
      selectedSubjectId: '',
      chapterForm: {
        name: '',
        subject_id: ''
      },
      isEditing: false,
      editingId: null,
      chapterToDelete: null,
      errors: {},
      alert: {
        show: false,
        message: '',
        type: 'info'
      },
      debugMode: false // Set to true to see debug info
    }
  },
  async mounted() {
    console.log('AdminChapters mounted with subjectId:', this.subjectId)
    await this.init()
  },
  watch: {
    subjectId: {
      handler(newVal, oldVal) {
        console.log('SubjectId changed from', oldVal, 'to', newVal)
        if (newVal) {
          this.selectedSubjectId = newVal
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    async init() {
      console.log('Initializing AdminChapters...')
      this.loading = true
      
      try {
        await this.fetchSubjects()
        console.log('Subjects fetched:', this.subjects.length)
        
        if (this.subjectId) {
          this.selectedSubjectId = this.subjectId
          this.selectedSubject = this.subjects.find(s => s.id == this.subjectId)
          console.log('Selected subject:', this.selectedSubject)
        }
        
        await this.fetchChapters()
      } catch (error) {
        console.error('Error during initialization:', error)
        this.showAlert('Failed to initialize page', 'danger')
      }
    },

    async fetchSubjects() {
      console.log('Fetching subjects...')
      try {
        const token = localStorage.getItem('auth_token')
        console.log('Auth token exists:', !!token)
        
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch('/admin/subjects', {
          method: 'GET',
          headers: {
            'Authentication-Token': token, // Changed from 'Authentication-Token'
            'Content-Type': 'application/json'
          }
        })

        console.log('Subjects response status:', response.status)
        console.log('Subjects response headers:', Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          const data = await response.json()
          console.log('Subjects data received:', data)
          this.subjects = Array.isArray(data) ? data : (data.subjects || [])
          console.log('Subjects array set:', this.subjects)
        } else {
          const errorText = await response.text()
          console.error('Subjects fetch failed:', response.status, errorText)
          throw new Error(`Failed to fetch subjects: ${response.status} ${errorText}`)
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
        this.showAlert(`Error loading subjects: ${error.message}`, 'danger')
        this.subjects = [] // Ensure subjects is always an array
      }
    },

    async fetchChapters() {
      console.log('Fetching chapters...')
      try {
        const token = localStorage.getItem('auth_token')
        let url = '/admin/chapters'
        
        if (this.subjectId) {
          url = `/admin/subject/${this.subjectId}/chapters`
          // Find and set selected subject
          this.selectedSubject = this.subjects.find(s => s.id == this.subjectId)
        } else if (this.selectedSubjectId) {
          url = `/admin/subject/${this.selectedSubjectId}/chapters`
          this.selectedSubject = this.subjects.find(s => s.id == this.selectedSubjectId)
        }

        console.log('Fetching chapters from:', url)

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authentication-Token': token, // Changed from 'Authentication-Token'
            'Content-Type': 'application/json'
          }
        })

        console.log('Chapters response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Chapters data received:', data)
          this.chapters = Array.isArray(data) ? data : (data.chapters || [])
        } else {
          const errorText = await response.text()
          console.error('Chapters fetch failed:', response.status, errorText)
          throw new Error(`Failed to fetch chapters: ${response.status}`)
        }
      } catch (error) {
        console.error('Error fetching chapters:', error)
        this.showAlert(`Error loading chapters: ${error.message}`, 'danger')
        this.chapters = [] // Ensure chapters is always an array
      } finally {
        this.loading = false
      }
    },

    async loadChaptersBySubject() {
      console.log('Loading chapters by subject:', this.selectedSubjectId)
      if (this.selectedSubjectId) {
        this.loading = true
        await this.fetchChapters()
      } else {
        this.chapters = []
        this.selectedSubject = null
      }
    },

    showCreateModal() {
      this.isEditing = false
      this.editingId = null
      this.chapterForm.name = ''
      this.chapterForm.subject_id = this.subjectId || this.selectedSubjectId || ''
      this.errors = {}
      const modal = new bootstrap.Modal(document.getElementById('chapterModal'))
      modal.show()
    },

    editChapter(chapter) {
      this.isEditing = true
      this.editingId = chapter.id
      this.chapterForm.name = chapter.name
      this.chapterForm.subject_id = chapter.subject_id
      this.errors = {}
      const modal = new bootstrap.Modal(document.getElementById('chapterModal'))
      modal.show()
    },

    validateForm() {
      this.errors = {}
      
      if (!this.chapterForm.name.trim()) {
        this.errors.name = 'Chapter name is required'
      }
      
      if (!this.subjectId && !this.chapterForm.subject_id) {
        this.errors.subject_id = 'Subject is required'
      }
      
      return Object.keys(this.errors).length === 0
    },

    async saveChapter() {
      if (!this.validateForm()) {
        return
      }

      this.saving = true
      try {
        const token = localStorage.getItem('auth_token')
        let url, method, body

        if (this.isEditing) {
          url = `/admin/chapter/${this.editingId}`
          method = 'PUT'
          body = {
            name: this.chapterForm.name,
            subject_id: this.chapterForm.subject_id
          }
        } else {
          const subjectId = this.subjectId || this.chapterForm.subject_id
          url = `/admin/subject/${subjectId}/chapter`
          method = 'POST'
          body = {
            name: this.chapterForm.name
          }
        }

        console.log('Saving chapter:', method, url, body)

        const response = await fetch(url, {
          method,
          headers: {
            'Authentication-Token': token, // Changed from 'Authentication-Token'
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })

        const data = await response.json()

        if (response.ok) {
          this.showAlert(
            this.isEditing ? 'Chapter updated successfully!' : 'Chapter created successfully!', 
            'success'
          )
          await this.fetchChapters()
          const modal = bootstrap.Modal.getInstance(document.getElementById('chapterModal'))
          modal.hide()
        } else {
          console.error('Save chapter failed:', data)
          this.showAlert(data.error || 'Failed to save chapter', 'danger')
        }
      } catch (error) {
        console.error('Error saving chapter:', error)
        this.showAlert(`Error saving chapter: ${error.message}`, 'danger')
      } finally {
        this.saving = false
      }
    },

    confirmDelete(chapter) {
      this.chapterToDelete = chapter
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'))
      modal.show()
    },

    async deleteChapter() {
      if (!this.chapterToDelete) return

      this.deleting = true
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/admin/chapter/${this.chapterToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token, // Changed from 'Authentication-Token'
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          this.showAlert('Chapter deleted successfully!', 'success')
          await this.fetchChapters()
          const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'))
          modal.hide()
          this.chapterToDelete = null
        } else {
          const data = await response.json()
          this.showAlert(data.error || 'Failed to delete chapter', 'danger')
        }
      } catch (error) {
        console.error('Error deleting chapter:', error)
        this.showAlert(`Error deleting chapter: ${error.message}`, 'danger')
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
      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          this.hideAlert()
        }, 5000)
      }
    },

    hideAlert() {
      this.alert.show = false
    },

    // Handle route changes
    beforeRouteUpdate(to, from, next) {
      if (to.params.subjectId !== from.params.subjectId) {
        this.subjectId = to.params.subjectId
        this.init()
      }
      next()
    }
  }
}

export default AdminChapters