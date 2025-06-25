const AdminQuizzes = {
  template: `
    <div class="container-fluid mt-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-question-circle me-2"></i>Quiz Management</h2>
            <button class="btn btn-primary" @click="showCreateModal">
              <i class="fas fa-plus me-2"></i>Create New Quiz
            </button>
          </div>

          <!-- Alerts -->
          <div v-if="alert.show" :class="'alert alert-' + alert.type + ' alert-dismissible fade show'" role="alert">
            {{ alert.message }}
            <button type="button" class="btn-close" @click="alert.show = false"></button>
          </div>

          <!-- Filter Section -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-filter me-2"></i>Filters</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <label class="form-label">Subject</label>
                  <select v-model="filters.subject" @change="onSubjectChange" class="form-select">
                    <option value="">All Subjects</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                      {{ subject.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Chapter</label>
                  <select v-model="filters.chapter" @change="onChapterChange" class="form-select" :disabled="!filters.subject">
                    <option value="">All Chapters</option>
                    <option v-for="chapter in filteredChapters" :key="chapter.id" :value="chapter.id">
                      {{ chapter.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Search</label>
                  <input 
                    type="text" 
                    v-model="filters.search" 
                    class="form-control" 
                    placeholder="Search quiz name..."
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Quizzes Table -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-list me-2"></i>Quizzes 
                <span class="badge bg-secondary ms-2">{{ filteredQuizzes.length }}</span>
              </h5>
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <div v-else-if="filteredQuizzes.length === 0" class="text-center py-4">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p class="text-muted">No quizzes found</p>
              </div>

              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Quiz Name</th>
                      <th>Subject</th>
                      <th>Chapter</th>
                      <th>Duration</th>
                      <th>Questions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="quiz in paginatedQuizzes" :key="quiz.id">
                      <td>{{ quiz.id }}</td>
                      <td>
                        <strong>{{ quiz.name }}</strong>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ quiz.subject_name || 'N/A' }}</span>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ quiz.chapter_name || 'N/A' }}</span>
                      </td>
                      <td>
                        <span class="badge bg-warning text-dark">{{ quiz.duration || 'N/A' }} min</span>
                      </td>
                      <td>
                        <span class="badge bg-primary">{{ quiz.questions_count }} questions</span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm" role="group">
                          <button 
                            class="btn btn-outline-info" 
                            @click="viewQuiz(quiz)"
                            title="View Details"
                          >
                            <i class="fas fa-eye"></i>
                          </button>
                          <button 
                            class="btn btn-outline-warning" 
                            @click="editQuiz(quiz)"
                            title="Edit Quiz"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            class="btn btn-outline-success" 
                            @click="manageQuestions(quiz)"
                            title="Manage Questions"
                          >
                            <i class="fas fa-question"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            @click="confirmDelete(quiz)"
                            title="Delete Quiz"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav v-if="totalPages > 1" aria-label="Quiz pagination">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="currentPage = 1">First</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
                  </li>
                  <li 
                    class="page-item" 
                    v-for="page in visiblePages" 
                    :key="page"
                    :class="{ active: page === currentPage }"
                  >
                    <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="currentPage = totalPages">Last</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Quiz Modal -->
      <div class="modal fade" id="quizModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-question-circle me-2"></i>
                {{ isEditing ? 'Edit Quiz' : 'Create New Quiz' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveQuiz">
                <div class="mb-3">
                  <label class="form-label">Quiz Name *</label>
                  <input 
                    type="text" 
                    v-model="quizForm.name" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.name }"
                    required
                  >
                  <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Duration (minutes) *</label>
                  <input 
                    type="number" 
                    v-model="quizForm.duration" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.duration }"
                    min="1"
                    max="300"
                    required
                  >
                  <div v-if="errors.duration" class="invalid-feedback">{{ errors.duration }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Subject *</label>
                  <select 
                    v-model="quizForm.subject_id" 
                    @change="onFormSubjectChange"
                    class="form-select" 
                    :class="{ 'is-invalid': errors.subject_id }"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                      {{ subject.name }}
                    </option>
                  </select>
                  <div v-if="errors.subject_id" class="invalid-feedback">{{ errors.subject_id }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Chapter *</label>
                  <select 
                    v-model="quizForm.chapter_id" 
                    class="form-select" 
                    :class="{ 'is-invalid': errors.chapter_id }"
                    :disabled="!quizForm.subject_id"
                    required
                  >
                    <option value="">Select Chapter</option>
                    <option v-for="chapter in formChapters" :key="chapter.id" :value="chapter.id">
                      {{ chapter.name }}
                    </option>
                  </select>
                  <div v-if="errors.chapter_id" class="invalid-feedback">{{ errors.chapter_id }}</div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveQuiz" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditing ? 'Update Quiz' : 'Create Quiz' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View Quiz Modal -->
      <div class="modal fade" id="viewQuizModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-eye me-2"></i>Quiz Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedQuiz">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Quiz Name:</strong> {{ selectedQuiz.name }}
                  </div>
                  <div class="col-md-6">
                    <strong>Duration:</strong> {{ selectedQuiz.duration || 'N/A' }} minutes
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>ID:</strong> {{ selectedQuiz.id }}
                  </div>
                  <div class="col-md-6">
                    <strong>Total Questions:</strong> 
                    <span class="badge bg-primary">{{ selectedQuiz.questions_count }}</span>
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Subject:</strong> {{ selectedQuiz.subject_name || 'N/A' }}
                  </div>
                  <div class="col-md-6">
                    <strong>Chapter:</strong> {{ selectedQuiz.chapter_name || 'N/A' }}
                  </div>
                </div>
                
                <div v-if="selectedQuiz.questions && selectedQuiz.questions.length > 0">
                  <h6 class="mt-4 mb-3">Questions:</h6>
                  <div class="accordion" id="questionsAccordion">
                    <div 
                      v-for="(question, index) in selectedQuiz.questions" 
                      :key="question.id"
                      class="accordion-item"
                    >
                      <h2 class="accordion-header" :id="'heading' + question.id">
                        <button 
                          class="accordion-button collapsed" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          :data-bs-target="'#collapse' + question.id"
                        >
                          Question {{ index + 1 }}
                        </button>
                      </h2>
                      <div 
                        :id="'collapse' + question.id" 
                        class="accordion-collapse collapse" 
                        :data-bs-parent="'#questionsAccordion'"
                      >
                        <div class="accordion-body">
                          <p><strong>{{ question.text }}</strong></p>
                          <div class="row">
                            <div class="col-md-6">
                              <strong>Options:</strong>
                              <ul class="list-unstyled ms-3">
                                <li v-for="(option, optIndex) in question.options" :key="optIndex">
                                  <span :class="{ 'text-success fw-bold': optIndex === question.correct_answer }">
                                    {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                                    <i v-if="optIndex === question.correct_answer" class="fas fa-check text-success ms-1"></i>
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  No questions added to this quiz yet.
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click="manageQuestions(selectedQuiz)">
                <i class="fas fa-question me-2"></i>Manage Questions
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle me-2 text-danger"></i>Confirm Delete
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete the quiz "<strong>{{ quizToDelete?.name }}</strong>"?</p>
              <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Warning:</strong> This action cannot be undone and will also delete all associated questions.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" @click="deleteQuiz" :disabled="deleting">
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      quizzes: [],
      subjects: [],
      chapters: [],
      loading: false,
      saving: false,
      deleting: false,
      isEditing: false,
      selectedQuiz: null,
      quizToDelete: null,
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Filters
      filters: {
        subject: '',
        chapter: '',
        search: ''
      },
      
      // Form
      quizForm: {
        name: '',
        duration: 30,
        subject_id: '',
        chapter_id: ''
      },
      
      // Validation
      errors: {},
      
      // Alert
      alert: {
        show: false,
        type: 'success',
        message: ''
      }
    }
  },

  computed: {
    filteredQuizzes() {
      let filtered = this.quizzes;
      
      if (this.filters.subject) {
        const subjectName = this.subjects.find(s => s.id == this.filters.subject)?.name;
        filtered = filtered.filter(quiz => quiz.subject_name === subjectName);
      }
      
      if (this.filters.chapter) {
        const chapterName = this.chapters.find(c => c.id == this.filters.chapter)?.name;
        filtered = filtered.filter(quiz => quiz.chapter_name === chapterName);
      }
      
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase();
        filtered = filtered.filter(quiz => 
          quiz.name.toLowerCase().includes(search)
        );
      }
      
      return filtered;
    },

    paginatedQuizzes() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredQuizzes.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredQuizzes.length / this.itemsPerPage);
    },

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    },

    filteredChapters() {
      if (!this.filters.subject) return [];
      return this.chapters.filter(chapter => chapter.subject_id == this.filters.subject);
    },

    formChapters() {
      if (!this.quizForm.subject_id) return [];
      return this.chapters.filter(chapter => chapter.subject_id == this.quizForm.subject_id);
    }
  },

  watch: {
    filteredQuizzes() {
      this.currentPage = 1;
    }
  },

  async mounted() {
    await this.loadInitialData();
  },

  methods: {
    async loadInitialData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchQuizzes(),
          this.fetchSubjects(),
          this.fetchChapters()
        ]);
      } catch (error) {
        this.showAlert('Error loading data: ' + error.message, 'danger');
      } finally {
        this.loading = false;
      }
    },

    async fetchQuizzes() {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/admin/quizzes', {
        headers: { 'Authentication-Token': token }
      });
      
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      this.quizzes = await response.json();
    },

    async fetchSubjects() {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/admin/subjects', {
        headers: { 'Authentication-Token': token }
      });
      
      if (!response.ok) throw new Error('Failed to fetch subjects');
      this.subjects = await response.json();
    },

    async fetchChapters() {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/admin/chapters', {
        headers: { 'Authentication-Token': token }
      });
      
      if (!response.ok) throw new Error('Failed to fetch chapters');
      this.chapters = await response.json();
    },

    async fetchQuizDetails(quizId) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/admin/quiz/${quizId}`, {
        headers: { 'Authentication-Token': token }
      });
      
      if (!response.ok) throw new Error('Failed to fetch quiz details');
      return await response.json();
    },

    onSubjectChange() {
      this.filters.chapter = '';
    },

    onChapterChange() {
      // Chapter filter changed - could add additional logic here
    },

    onFormSubjectChange() {
      this.quizForm.chapter_id = '';
    },

    showCreateModal() {
      this.isEditing = false;
      this.quizForm = {
        name: '',
        duration: 30,
        subject_id: '',
        chapter_id: ''
      };
      this.errors = {};
      
      const modal = new bootstrap.Modal(document.getElementById('quizModal'));
      modal.show();
    },

    editQuiz(quiz) {
      this.isEditing = true;
      this.selectedQuiz = quiz;
      
      // Find the subject ID for this quiz
      const subject = this.subjects.find(s => s.name === quiz.subject_name);
      
      this.quizForm = {
        name: quiz.name,
        duration: quiz.duration || 30,
        subject_id: subject ? subject.id : '',
        chapter_id: quiz.chapter_id
      };
      this.errors = {};
      
      const modal = new bootstrap.Modal(document.getElementById('quizModal'));
      modal.show();
    },

    async viewQuiz(quiz) {
      try {
        this.selectedQuiz = await this.fetchQuizDetails(quiz.id);
        const modal = new bootstrap.Modal(document.getElementById('viewQuizModal'));
        modal.show();
      } catch (error) {
        this.showAlert('Error loading quiz details: ' + error.message, 'danger');
      }
    },

    manageQuestions(quiz) {
      // Navigate to questions management - you'll need to implement this route
      this.$router.push(`/admin/quiz/${quiz.id}/questions`);
    },

    confirmDelete(quiz) {
      this.quizToDelete = quiz;
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    },

    validateForm() {
      this.errors = {};
      
      if (!this.quizForm.name.trim()) {
        this.errors.name = 'Quiz name is required';
      }
      
      if (!this.quizForm.subject_id) {
        this.errors.subject_id = 'Subject is required';
      }
      
      if (!this.quizForm.chapter_id) {
        this.errors.chapter_id = 'Chapter is required';
      }
      
      if (!this.quizForm.duration || this.quizForm.duration < 1) {
        this.errors.duration = 'Duration must be at least 1 minute';
      }
      
      return Object.keys(this.errors).length === 0;
    },

    async saveQuiz() {
      if (!this.validateForm()) return;
      
      this.saving = true;
      try {
        const token = localStorage.getItem('auth_token');
        const url = this.isEditing 
          ? `/admin/quiz/${this.selectedQuiz.id}`
          : `/admin/chapter/${this.quizForm.chapter_id}/quiz`;
        
        const method = this.isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': token
          },
          body: JSON.stringify({
            name: this.quizForm.name,
            duration: this.quizForm.duration,
            chapter_id: this.quizForm.chapter_id
          })
        });
        
        if (!response.ok) throw new Error('Failed to save quiz');
        
        await this.fetchQuizzes();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('quizModal'));
        modal.hide();
        
        this.showAlert(
          `Quiz ${this.isEditing ? 'updated' : 'created'} successfully!`, 
          'success'
        );
        
      } catch (error) {
        this.showAlert('Error saving quiz: ' + error.message, 'danger');
      } finally {
        this.saving = false;
      }
    },

    async deleteQuiz() {
      this.deleting = true;
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/admin/quiz/${this.quizToDelete.id}`, {
          method: 'DELETE',
          headers: { 'Authentication-Token': token }
        });
        
        if (!response.ok) throw new Error('Failed to delete quiz');
        
        await this.fetchQuizzes();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
        
        this.showAlert('Quiz deleted successfully!', 'success');
        
      } catch (error) {
        this.showAlert('Error deleting quiz: ' + error.message, 'danger');
      } finally {
        this.deleting = false;
      }
    },

    showAlert(message, type = 'success') {
      this.alert = {
        show: true,
        type,
        message
      };
      
      setTimeout(() => {
        this.alert.show = false;
      }, 5000);
    }
  }
};

export default AdminQuizzes;