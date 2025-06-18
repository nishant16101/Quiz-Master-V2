const UserDashboard = {
    template:`
    <div class="container-fluid">
      <!-- Header with Profile Button -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center py-3">
            <div>
              <h2 class="mb-1">
                <i class="fas fa-home text-primary"></i> 
                Welcome back, {{ user.username }}!
              </h2>
              <p class="text-muted mb-0">Ready to challenge yourself today?</p>
            </div>
            <div class="dropdown">
              <button class="btn btn-outline-primary dropdown-toggle" type="button" id="profileDropdown" data-bs-toggle="dropdown">
                <i class="fas fa-user-circle"></i> Profile
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link to="/profile" class="dropdown-item">
                    <i class="fas fa-user me-2"></i>View Profile
                  </router-link>
                </li>
                <li>
                  <router-link to="/attempts" class="dropdown-item">
                    <i class="fas fa-history me-2"></i>Quiz History
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a href="#" @click="logout" class="dropdown-item text-danger">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-gradient-primary text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-1">{{ userStats.totalAttempts }}</h4>
                  <small class="opacity-75">Quizzes Attempted</small>
                </div>
                <i class="fas fa-tasks fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-gradient-success text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-1">{{ userStats.averageScore }}%</h4>
                  <small class="opacity-75">Average Score</small>
                </div>
                <i class="fas fa-chart-line fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-gradient-info text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-1">{{ userStats.bestScore }}%</h4>
                  <small class="opacity-75">Best Score</small>
                </div>
                <i class="fas fa-trophy fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-gradient-warning text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-1">{{ subjects.length }}</h4>
                  <small class="opacity-75">Available Subjects</small>
                </div>
                <i class="fas fa-book fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Quick Actions Row -->
      <div class="row mb-4">
        <!-- Recent Quiz Attempts -->
        <div class="col-lg-8 mb-4">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-clock text-primary me-2"></i>Recent Quiz Attempts
              </h5>
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="recentAttempts.length === 0" class="text-center py-4 text-muted">
                <i class="fas fa-clipboard-list fa-3x mb-3 opacity-50"></i>
                <p>No quiz attempts yet. Start your first quiz!</p>
              </div>
              <div v-else>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Quiz</th>
                        <th>Subject</th>
                        <th>Score</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="attempt in recentAttempts" :key="attempt.attempt_id || attempt.quiz_id">
                        <td>
                          <strong>{{ attempt.quiz_title || attempt.quiz.title }}</strong>
                          <br>
                          <small class="text-muted">{{ attempt.quiz.chapter || 'Chapter' }}</small>
                        </td>
                        <td>
                          <span class="badge bg-primary">{{ attempt.subject || attempt.quiz.subject }}</span>
                        </td>
                        <td>
                          <span :class="getScoreClass(attempt.score)">
                            {{ attempt.score }}%
                          </span>
                        </td>
                        <td>
                          <small>{{ formatDate(attempt.date_attempted) }}</small>
                        </td>
                        <td>
                          <button @click="viewAttempt(attempt.attempt_id || attempt.quiz_id)" 
                                  class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-bolt text-warning me-2"></i>Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <router-link to="/attempts" class="btn btn-outline-primary">
                  <i class="fas fa-history me-2"></i>View All Attempts
                </router-link>
                <button @click="findRandomQuiz" class="btn btn-outline-info">
                  <i class="fas fa-random me-2"></i>Random Quiz
                </button>
                <router-link to="/subjects" class="btn btn-outline-success">
                  <i class="fas fa-book me-2"></i>Browse Subjects
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Subjects -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-graduation-cap text-success me-2"></i>Available Subjects
              </h5>
            </div>
            <div class="card-body">
              <div v-if="loadingSubjects" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading subjects...</span>
                </div>
              </div>
              <div v-else-if="subjects.length === 0" class="text-center py-4 text-muted">
                <i class="fas fa-book-open fa-3x mb-3 opacity-50"></i>
                <p>No subjects available at the moment.</p>
              </div>
              <div v-else class="row">
                <div v-for="subject in subjects" :key="subject.id" 
                     class="col-xl-4 col-lg-6 col-md-6 mb-4">
                  <div class="card subject-card h-100 border-0 shadow-sm">
                    <div class="card-body text-center">
                      <div class="subject-icon mb-3">
                        <i :class="getSubjectIcon(subject.name)" class="fa-3x text-primary"></i>
                      </div>
                      <h5 class="card-title">{{ subject.name }}</h5>
                      <p class="card-text text-muted">{{ subject.description }}</p>
                      <div class="mb-3">
                        <span class="badge bg-light text-dark">
                          <i class="fas fa-bookmark me-1"></i>{{ subject.chapters_count }} Chapters
                        </span>
                      </div>
                      <button @click="exploreSubject(subject.id)" 
                              class="btn btn-primary btn-sm">
                        <i class="fas fa-arrow-right me-1"></i>Explore Subject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`,
    data(){
        return {
            loading: true,
            loadingSubjects: true,
            user: {
                username: '',
                email: ''
            },
            userStats: {
                totalAttempts: 0,
                averageScore: 0,
                bestScore: 0,
            },
            subjects: [],
            recentAttempts: []
        }
    },
    methods: {
        async fetchUserData(){
            try{
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }
                
                const headers = {
                    'Authentication-Token': token, 
                    'Content-Type': 'application/json'
                };
                
                // Fixed: Changed /api/user/profile to /user/profile to match API endpoint
                const profileRes = await fetch('/user/profile', { headers });
                
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    this.user.username = profileData.username;
                    this.user.email = profileData.email;
                    this.recentAttempts = profileData.recent_attempts || [];
                    
                    // Calculate user stats
                    if (profileData.recent_attempts && profileData.recent_attempts.length > 0) {
                        this.userStats.totalAttempts = profileData.recent_attempts.length;
                        const scores = profileData.recent_attempts.map(a => a.score);
                        this.userStats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                        this.userStats.bestScore = Math.max(...scores);
                    }
                } else if (profileRes.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    this.$router.push('/login');
                } else {
                    throw new Error(`HTTP ${profileRes.status}: ${profileRes.statusText}`);
                }
            } catch(error) {
                console.error('Error fetching user data', error);
                this.showAlert('Error loading user data', 'danger');
            } finally {
                this.loading = false;
            }
        },
        
        async fetchSubjects(){
            try{
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }
                
                const headers = {
                    'Authentication-Token':token, 
                    'Content-Type': 'application/json'
                };
                
                // Fixed: Changed /api/user/subjects to /user/subjects to match API endpoint
                const response = await fetch('/user/subjects', { headers });
                
                if (response.ok) {
                    this.subjects = await response.json();
                } else if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    this.$router.push('/login');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch(error) {
                console.error('Error fetching subjects', error);
                this.showAlert('Error loading subjects', 'danger');
            } finally {
                this.loadingSubjects = false;
            }
        },
        
        exploreSubject(subjectId) {
      this.$router.push(`/subject/${subjectId}`);
      },
        
        getSubjectIcon(subjectName) {
            const icons = {
                'Mathematics': 'fas fa-calculator',
                'Science': 'fas fa-microscope',
                'History': 'fas fa-landmark',
                'English': 'fas fa-spell-check',
                'Geography': 'fas fa-globe',
                'Physics': 'fas fa-atom',
                'Chemistry': 'fas fa-flask',
                'Biology': 'fas fa-dna',
                'Computer Science': 'fas fa-laptop-code',
                'Literature': 'fas fa-book-open'
            };
            return icons[subjectName] || 'fas fa-book';
        },
        
        getScoreClass(score) {
            if (score >= 80) return 'badge bg-success';
            if (score >= 60) return 'badge bg-warning';
            return 'badge bg-danger';
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        },
        
        viewAttempt(attemptId) {
            this.$router.push(`/attempts/${attemptId}`);
        },
        
        findRandomQuiz() {
            // Implementation for finding a random quiz
            if (this.subjects.length > 0) {
                const randomSubject = this.subjects[Math.floor(Math.random() * this.subjects.length)];
                this.exploreSubject(randomSubject.id);
            }
        },
        
        showAlert(message, type) {
            // Simple alert implementation - you can replace with a toast notification system
            alert(message);
        },
        
        async logout(){
            try{
                const token = localStorage.getItem('auth_token');
                if (token) {
                    await fetch('/user/logout', { // Fixed: Removed /api prefix to match backend route
                        method: 'POST',
                        headers: {
                            'Authentication-Token':token, 
                            'Content-Type': 'application/json'
                        }
                    });
                }
            } catch(error) {
                console.error('Logout error', error);
            } finally {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('savedEmail');
                this.$router.push('/login');
            }
        }
    },
    
    async mounted() {
        await Promise.all([
            this.fetchUserData(),
            this.fetchSubjects()
        ]);
    }
}

export default UserDashboard;