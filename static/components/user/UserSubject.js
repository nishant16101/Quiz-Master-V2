const UserSubject = {
    template:`
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">
            <i class="fas fa-book"></i> Available Subjects
          </h2>
        </div>
      </div>
      
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else-if="subjects.length === 0" class="text-center text-muted">
        <i class="fas fa-book fa-3x mb-3"></i>
        <p>No subjects available</p>
      </div>
      
      <div v-else class="row">
        <div v-for="subject in subjects" :key="subject.id" class="col-md-4 col-lg-3 mb-4">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ subject.name }}</h5>
              <p class="card-text flex-grow-1">{{ subject.description || 'No description available' }}</p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <small class="text-muted">{{ subject.chapters_count }} chapters</small>
                </div>
                <router-link :to="'/user/subject/' + subject.id" class="btn btn-primary w-100">
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
            loading:true,
            subjects:[]
        }
    },
    methods:{
        async fetchSubjects(){
            try{
                const token = localStorage.getItem('auth_token')
                const response = await fetch('/user/subjects',{
                    headers:{
                        'Authentication-Token':`Bearer${token}`,
                        'Content-Type':'application/json'
                    }
                })
                if (response.ok){
                    this.subjects = await response.json()
                }else{
                    console.error('Falied to fetch the subjects')
                }
            }catch(error){
                console.error('Error fetching subjects',error)
            }finally{
                this.loading = false
            }
        }
    },
    async mounted(){
        await this.fetchSubjects()
    }
}
export default UserSubject