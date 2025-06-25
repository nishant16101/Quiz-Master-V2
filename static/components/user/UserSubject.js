const UserSubject = {
    template:`
    <div class="container mt-4">
      <div class="row mb-4">
        <div class="col-12">
          <nav aria-label="breadcrumb" v-if="subject.id">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/subjects">Subjects</router-link></li>
              <li class="breadcrumb-item active">{{ subject.name }}</li>
            </ol>
          </nav>
          <h2 v-if="subject.id"><i class="fas fa-bookmark text-primary"></i> Chapters in {{ subject.name }}</h2>
          <h2 v-else><i class="fas fa-book"></i> Available Subjects</h2>
        </div>
      </div>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else-if="!subject.id && subjects.length === 0" class="text-center text-muted py-5">
        <i class="fas fa-book-open fa-3x mb-3"></i>
        <p>No subjects available.</p>
      </div>
      <div v-else-if="subject.id && subject.chapters.length === 0" class="text-center text-muted py-5">
        <i class="fas fa-folder-open fa-3x mb-3"></i>
        <p>No chapters available in this subject.</p>
      </div>
      
      <div v-else-if="subject.id" class="row">
        <div v-for="chapter in subject.chapters" :key="chapter.id" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ chapter.name }}</h5>
              <p class="card-text text-muted flex-grow-1">{{ chapter.description || 'No description.' }}</p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <small class="text-muted"><i class="fas fa-question-circle me-1"></i>{{ chapter.quizzes_count }} quizzes</small>
                </div>
                <router-link :to="'/chapter/' + chapter.id" class="btn btn-success w-100">
                  <i class="fas fa-arrow-right"></i> View Quizzes
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="row">
        <div v-for="s in subjects" :key="s.id" class="col-md-4 col-lg-3 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ s.name }}</h5>
              <p class="card-text flex-grow-1">{{ s.description || 'No description available' }}</p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <small class="text-muted">{{ s.chapters_count }} chapters</small>
                </div>
                <router-link :to="'/subject/' + s.id" class="btn btn-primary w-100">
                  <i class="fas fa-arrow-right"></i> Explore
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`,
    data(){
        return{
            loading: true,
            subjects: [], // For the list of all subjects
            subject: {}   // For the details of a single subject (including chapters)
        }
    },
    methods:{
        async fetchData(){
            this.loading = true;
            const subjectId = this.$route.params.id;
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Authentication-Token': token,
                'Content-Type': 'application/json'
            };

            try {
                if (subjectId) {
                    // Fetch a single subject with its chapters
                    const response = await fetch(`/user/subject/${subjectId}`, { headers });
                    if (response.ok) {
                        this.subject = await response.json();
                    } else {
                        console.error('Failed to fetch subject details');
                    }
                } else {
                    // Fetch all subjects
                    const response = await fetch('/user/subjects', { headers });
                    if (response.ok) {
                        this.subjects = await response.json();
                        this.subject = {}; // Clear single subject data
                    } else {
                        console.error('Failed to fetch subjects');
                    }
                }
            } catch(error) {
                console.error('Error fetching data:', error);
            } finally {
                this.loading = false;
            }
        }
    },
    async created(){
        await this.fetchData();
    },
    watch: {
        '$route.params.id': 'fetchData'
    }
}
export default UserSubject;