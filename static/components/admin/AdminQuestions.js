const AdminQuestions = {
  template: `
    <div class="container mt-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="fas fa-question-circle text-primary me-2"></i>Question Management
              </h2>
              <p class="text-muted mb-0">Create and manage questions for quizzes</p>
              <div v-if="selectedQuizInfo" class="mt-2">
                <span class="badge bg-primary me-2">{{ selectedQuizInfo.subject_name }}</span>
                <span class="badge bg-info me-2">{{ selectedQuizInfo.chapter_name }}</span>
                <span class="badge bg-success">{{ selectedQuizInfo.name }}</span>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button @click="showCreateModal" class="btn btn-primary" :disabled="!selectedQuizId">
                <i class="fas fa-plus me-2"></i>Add Question
              </button>
              <router-link to="/admin/quizzes" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-2"></i>Back to Quizzes
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

      <!-- Quiz Selection and Statistics (only show if no quiz ID in route) -->
      <div v-if="!routeQuizId" class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-tasks me-2"></i>Select Quiz
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Subject</label>
                  <select class="form-select" v-model="selectedSubject" @change="onSubjectChange">
                    <option value="">Select Subject</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                      {{ subject.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Chapter</label>
                  <select class="form-select" v-model="selectedChapter" @change="onChapterChange" :disabled="!selectedSubject">
                    <option value="">Select Chapter</option>
                    <option v-for="chapter in filteredChapters" :key="chapter.id" :value="chapter.id">
                      {{ chapter.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Quiz</label>
                <select class="form-select" v-model="selectedQuizId" @change="onQuizChange" :disabled="!selectedChapter">
                  <option value="">Select Quiz</option>
                  <option v-for="quiz in filteredQuizzes" :key="quiz.id" :value="quiz.id">
                    {{ quiz.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-bar me-2"></i>Statistics
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-4">
                  <div class="border-end">
                    <h4 class="text-primary mb-0">{{ questions.length }}</h4>
                    <small class="text-muted">Total Questions</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="border-end">
                    <h4 class="text-info mb-0">{{ subjects.length }}</h4>
                    <small class="text-muted">Subjects</small>
                  </div>
                </div>
                <div class="col-4">
                  <h4 class="text-success mb-0">{{ quizzes.length }}</h4>
                  <small class="text-muted">Total Quizzes</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions List -->
      <div class="card">
        <div class="card-header bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="fas fa-list me-2"></i>Questions
              <span v-if="selectedQuizId" class="badge bg-primary ms-2">{{ questions.length }}</span>
            </h5>
            <div class="d-flex gap-2">
              <div class="input-group" style="width: 300px;">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search questions..." 
                  v-model="searchQuery"
                >
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="!selectedQuizId" class="text-center py-5 text-muted">
            <i class="fas fa-tasks fa-3x mb-3"></i>
            <h5>Select a Quiz</h5>
            <p>Please select a subject, chapter, and quiz to view questions.</p>
          </div>
          <div v-else-if="filteredQuestions.length === 0" class="text-center py-5 text-muted">
            <i class="fas fa-question-circle fa-3x mb-3"></i>
            <h5>No Questions Found</h5>
            <p>{{ searchQuery ? 'No questions match your search.' : 'This quiz has no questions yet.' }}</p>
            <button @click="showCreateModal" class="btn btn-primary">
              <i class="fas fa-plus me-2"></i>Add First Question
            </button>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th width="5%">#</th>
                  <th width="40%">Question</th>
                  <th width="25%">Options</th>
                  <th width="15%">Correct Answer</th>
                  <th width="15%" class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(question, index) in filteredQuestions" :key="question.id">
                  <td>
                    <span class="badge bg-secondary">{{ index + 1 }}</span>
                  </td>
                  <td>
                    <div class="question-text">
                      {{ question.text }}
                    </div>
                  </td>
                  <td>
                    <div class="options-preview">
                      <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                        <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                        <span class="option-text">{{ option }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-success">
                      {{ String.fromCharCode(65 + question.correct_answer) }}. {{ question.options[question.correct_answer] }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group" role="group">
                      <button @click="editQuestion(question)" class="btn btn-sm btn-outline-primary" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteQuestion(question)" class="btn btn-sm btn-outline-danger" title="Delete">
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

      <!-- Create/Edit Question Modal -->
      <div class="modal fade" id="questionModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-question-circle me-2"></i>
                {{ isEditing ? 'Edit Question' : 'Add New Question' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveQuestion">
                <div class="mb-3">
                  <label class="form-label">Question Text *</label>
                  <textarea 
                    class="form-control" 
                    rows="3" 
                    v-model="questionForm.text" 
                    placeholder="Enter the question text..."
                    required
                  ></textarea>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Answer Options *</label>
                  <div v-for="(option, index) in questionForm.options" :key="index" class="mb-2">
                    <div class="input-group">
                      <span class="input-group-text">{{ String.fromCharCode(65 + index) }}</span>
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="questionForm.options[index]"
                        :placeholder="'Option ' + String.fromCharCode(65 + index)"
                        required
                      >
                      <button 
                        v-if="questionForm.options.length > 2" 
                        type="button" 
                        class="btn btn-outline-danger"
                        @click="removeOption(index)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <button 
                    v-if="questionForm.options.length < 6" 
                    type="button" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="addOption"
                  >
                    <i class="fas fa-plus me-1"></i>Add Option
                  </button>
                </div>

                <div class="mb-3">
                  <label class="form-label">Correct Answer *</label>
                  <select class="form-select" v-model="questionForm.correct_answer" required>
                    <option value="">Select correct answer</option>
                    <option 
                      v-for="(option, index) in questionForm.options" 
                      :key="index" 
                      :value="index"
                      :disabled="!option.trim()"
                    >
                      {{ String.fromCharCode(65 + index) }}. {{ option }}
                    </option>
                  </select>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
                    <i class="fas fa-save me-2"></i>
                    {{ isEditing ? 'Update Question' : 'Save Question' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  
  props: ['id'], // Accept quiz ID as prop from route
  
  data() {
    return {
      loading: false,
      searchQuery: '',
      selectedSubject: '',
      selectedChapter: '',
      selectedQuizId: '',
      selectedQuizInfo: null,
      routeQuizId: null, // Store the quiz ID from route
      
      subjects: [],
      chapters: [],
      quizzes: [],
      questions: [],
      
      isEditing: false,
      editingId: null,
      questionForm: {
        text: '',
        options: ['', '', '', ''],
        correct_answer: ''
      },
      
      alert: {
        show: false,
        type: '',
        message: ''
      }
    }
  },
  
  computed: {
    filteredChapters() {
      return this.chapters.filter(chapter => chapter.subject_id == this.selectedSubject);
    },
    
    filteredQuizzes() {
      return this.quizzes.filter(quiz => quiz.chapter_id == this.selectedChapter);
    },
    
    filteredQuestions() {
      if (!this.searchQuery) return this.questions;
      return this.questions.filter(question => 
        question.text.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        question.options.some(option => option.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    },
    
    isFormValid() {
      return this.questionForm.text.trim() &&
             this.questionForm.options.every(option => option.trim()) &&
             this.questionForm.correct_answer !== '';
    }
  },
  
  async mounted() {
    // Check if quiz ID is passed in the route
    this.routeQuizId = this.id || this.$route.params.id;
    
    await this.loadInitialData();
    
    // If quiz ID is provided in route, load that quiz directly
    if (this.routeQuizId) {
      this.selectedQuizId = this.routeQuizId;
      await this.loadQuizInfo();
      await this.loadQuestions();
    }
  },
  
  methods: {
    async loadInitialData() {
      try {
        this.loading = true;
        await Promise.all([
          this.loadSubjects(),
          this.loadChapters(),
          this.loadQuizzes()
        ]);
      } catch (error) {
        this.showAlert('error', 'Failed to load initial data');
      } finally {
        this.loading = false;
      }
    },
    
    async loadSubjects() {
      const response = await fetch('/admin/subjects', {
        headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
      });
      if (response.ok) {
        this.subjects = await response.json();
      }
    },
    
    async loadChapters() {
      const response = await fetch('/admin/chapters', {
        headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
      });
      if (response.ok) {
        this.chapters = await response.json();
      }
    },
    
    async loadQuizzes() {
      const response = await fetch('/admin/quizzes', {
        headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
      });
      if (response.ok) {
        this.quizzes = await response.json();
      }
    },
    
    async loadQuizInfo() {
      if (!this.selectedQuizId) return;
      
      try {
        const response = await fetch(`/admin/quiz/${this.selectedQuizId}`, {
          headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
        });
        
        if (response.ok) {
          this.selectedQuizInfo = await response.json();
        }
      } catch (error) {
        this.showAlert('error', 'Failed to load quiz information');
      }
    },
    
    async loadQuestions() {
      if (!this.selectedQuizId) {
        this.questions = [];
        return;
      }
      
      try {
        this.loading = true;
        const response = await fetch(`/admin/quiz/${this.selectedQuizId}/questions`, {
          headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
        });
        
        if (response.ok) {
          this.questions = await response.json();
        } else {
          this.showAlert('error', 'Failed to load questions');
        }
      } catch (error) {
        this.showAlert('error', 'Failed to load questions');
      } finally {
        this.loading = false;
      }
    },
    
    onSubjectChange() {
      this.selectedChapter = '';
      this.selectedQuizId = '';
      this.selectedQuizInfo = null;
      this.questions = [];
    },
    
    onChapterChange() {
      this.selectedQuizId = '';
      this.selectedQuizInfo = null;
      this.questions = [];
    },
    
    async onQuizChange() {
      if (this.selectedQuizId) {
        await this.loadQuizInfo();
        await this.loadQuestions();
      } else {
        this.selectedQuizInfo = null;
        this.questions = [];
      }
    },
    
    showCreateModal() {
      this.isEditing = false;
      this.editingId = null;
      this.resetForm();
      const modal = new bootstrap.Modal(document.getElementById('questionModal'));
      modal.show();
    },
    
    editQuestion(question) {
      this.isEditing = true;
      this.editingId = question.id;
      this.questionForm = {
        text: question.text,
        options: [...question.options],
        correct_answer: question.correct_answer
      };
      const modal = new bootstrap.Modal(document.getElementById('questionModal'));
      modal.show();
    },
    
    async saveQuestion() {
      try {
        const url = this.isEditing 
          ? `/admin/question/${this.editingId}`
          : `/admin/quiz/${this.selectedQuizId}/questions`;
        
        const method = this.isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify({
            text: this.questionForm.text,
            options: this.questionForm.options,
            correct_answer: parseInt(this.questionForm.correct_answer)
          })
        });
        
        if (response.ok) {
          this.showAlert('success', this.isEditing ? 'Question updated successfully' : 'Question created successfully');
          await this.loadQuestions();
          bootstrap.Modal.getInstance(document.getElementById('questionModal')).hide();
        } else {
          const error = await response.json();
          this.showAlert('error', error.message || 'Failed to save question');
        }
      } catch (error) {
        this.showAlert('error', 'Failed to save question');
      }
    },
    
    async deleteQuestion(question) {
      if (!confirm(`Are you sure you want to delete this question?\n\n"${question.text}"`)) {
        return;
      }
      
      try {
        const response = await fetch(`/admin/question/${question.id}`, {
          method: 'DELETE',
          headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
        });
        
        if (response.ok) {
          this.showAlert('success', 'Question deleted successfully');
          await this.loadQuestions();
        } else {
          this.showAlert('error', 'Failed to delete question');
        }
      } catch (error) {
        this.showAlert('error', 'Failed to delete question');
      }
    },
    
    addOption() {
      if (this.questionForm.options.length < 6) {
        this.questionForm.options.push('');
      }
    },
    
    removeOption(index) {
      if (this.questionForm.options.length > 2) {
        this.questionForm.options.splice(index, 1);
        // Adjust correct_answer if needed
        if (this.questionForm.correct_answer > index) {
          this.questionForm.correct_answer--;
        } else if (this.questionForm.correct_answer == index) {
          this.questionForm.correct_answer = '';
        }
      }
    },
    
    resetForm() {
      this.questionForm = {
        text: '',
        options: ['', '', '', ''],
        correct_answer: ''
      };
    },
    
    showAlert(type, message) {
      this.alert = { show: true, type, message };
      setTimeout(() => this.hideAlert(), 5000);
    },
    
    hideAlert() {
      this.alert.show = false;
    }
  }
};

export default AdminQuestions;