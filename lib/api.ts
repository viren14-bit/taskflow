const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Token ${token}` }),
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }))
      throw new Error(error.message || error.detail || error.error || "An error occurred")
    }
    return response.json()
  }

  // Auth methods
  async register(userData: {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirm: string
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: userData.email, // Use email as username
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        password_confirm: userData.password_confirm,
      }),
    })
    return this.handleResponse(response)
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    return this.handleResponse(response)
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/user/`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Project methods
  async getProjects() {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createProject(projectData: { name: string; description: string; color: string }) {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(projectData),
    })
    return this.handleResponse(response)
  }

  async updateProject(projectId: string, projectData: Partial<{ name: string; description: string; color: string }>) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(projectData),
    })
    return this.handleResponse(response)
  }

  async deleteProject(projectId: string) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error("Failed to delete project")
    }
  }

  // Task methods (No delete for users)
  async getTasks(filters?: { project?: string; status?: string; priority?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }

    const response = await fetch(`${API_BASE_URL}/tasks/?${params}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createTask(taskData: {
    title: string
    description: string
    due_date: string
    priority: string
    status: string
    project: string
  }) {
    const response = await fetch(`${API_BASE_URL}/tasks/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskData),
    })
    return this.handleResponse(response)
  }

  async updateTask(
    taskId: string,
    taskData: Partial<{
      title: string
      description: string
      due_date: string
      priority: string
      status: string
      project: string
    }>,
  ) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskData),
    })
    return this.handleResponse(response)
  }

  // Dashboard methods
  async getDashboardStats(projectId?: string) {
    const params = projectId && projectId !== "all" ? `?project=${projectId}` : ""
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/${params}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Admin methods
  async getAdminUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users/`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async getAdminProjects(filters?: { user?: string }) {
    const params = new URLSearchParams()
    if (filters?.user) params.append("user", filters.user)

    const response = await fetch(`${API_BASE_URL}/admin/projects/?${params}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createAdminProject(projectData: { name: string; description: string; color: string; user: string }) {
    const response = await fetch(`${API_BASE_URL}/admin/projects/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(projectData),
    })
    return this.handleResponse(response)
  }

  async updateAdminProject(
    projectId: string,
    projectData: Partial<{ name: string; description: string; color: string; user: string }>,
  ) {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${projectId}/`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(projectData),
    })
    return this.handleResponse(response)
  }

  async deleteAdminProject(projectId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${projectId}/`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error("Failed to delete project")
    }
  }

  async getAdminTasks(filters?: { user?: string; project?: string; status?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }

    const response = await fetch(`${API_BASE_URL}/admin/tasks/?${params}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createAdminTask(taskData: {
    title: string
    description: string
    due_date: string
    priority: string
    status: string
    project: string
    user: string
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskData),
    })
    return this.handleResponse(response)
  }

  async updateAdminTask(
    taskId: string,
    taskData: Partial<{
      title: string
      description: string
      due_date: string
      priority: string
      status: string
      project: string
      user: string
    }>,
  ) {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${taskId}/`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskData),
    })
    return this.handleResponse(response)
  }

  async deleteAdminTask(taskId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${taskId}/`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error("Failed to delete task")
    }
  }

  async getAdminDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats/`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }
}

export const apiClient = new ApiClient()
