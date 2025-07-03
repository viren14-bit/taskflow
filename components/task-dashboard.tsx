"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { TaskForm } from "@/components/task-form"
import { ProjectForm } from "@/components/project-form"
import { TaskList } from "@/components/task-list"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

export interface Task {
  id: string
  title: string
  description: string
  due_date: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  project: string
  project_name: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  created_at: string
  task_count: number
}

interface DashboardStats {
  total_tasks: number
  todo_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  overdue_tasks: number
}

export function TaskDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total_tasks: 0,
    todo_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
  })
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, selectedProject])

  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([loadTasks(), loadProjects(), loadStats()])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const filters = selectedProject !== "all" ? { project: selectedProject } : {}
      const tasksData = await apiClient.getTasks(filters)
      setTasks(tasksData)
    } catch (error) {
      console.error("Error loading tasks:", error)
    }
  }

  const loadProjects = async () => {
    try {
      const projectsData = await apiClient.getProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error("Error loading projects:", error)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await apiClient.getDashboardStats(selectedProject)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const addTask = async (taskData: Omit<Task, "id" | "project_name" | "created_at" | "updated_at">) => {
    try {
      await apiClient.createTask({
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.due_date,
        priority: taskData.priority,
        status: taskData.status,
        project: taskData.project,
      })
      await loadData()
      toast({
        title: "Success",
        description: "Task created successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      })
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {}
      if (updates.title) updateData.title = updates.title
      if (updates.description) updateData.description = updates.description
      if (updates.due_date) updateData.due_date = updates.due_date
      if (updates.priority) updateData.priority = updates.priority
      if (updates.status) updateData.status = updates.status
      if (updates.project) updateData.project = updates.project

      await apiClient.updateTask(taskId, updateData)
      await loadData()
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const addProject = async (projectData: Omit<Project, "id" | "created_at" | "task_count">) => {
    try {
      await apiClient.createProject(projectData)
      await loadProjects()
      toast({
        title: "Success",
        description: "Project created successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowProjectForm(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todo_tasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress_tasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.overdue_tasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedProject === "all" ? "default" : "outline"}
          onClick={() => setSelectedProject("all")}
          size="sm"
        >
          All Projects
        </Button>
        {projects.map((project) => (
          <Button
            key={project.id}
            variant={selectedProject === project.id ? "default" : "outline"}
            onClick={() => setSelectedProject(project.id)}
            size="sm"
          >
            {project.name} ({project.task_count})
          </Button>
        ))}
      </div>

      {/* Task List - No delete functionality for users */}
      <TaskList tasks={tasks} projects={projects} onUpdateTask={updateTask} showDeleteButton={false} />

      {/* Forms */}
      {showTaskForm && <TaskForm projects={projects} onSubmit={addTask} onClose={() => setShowTaskForm(false)} />}

      {showProjectForm && <ProjectForm onSubmit={addProject} onClose={() => setShowProjectForm(false)} />}
    </div>
  )
}
