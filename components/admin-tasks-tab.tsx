"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, Edit, Calendar } from "lucide-react"
import { AdminTaskForm } from "@/components/admin-task-form"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  description: string
  due_date: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  project: string
  project_name: string
  user: string
  user_name: string
  created_at: string
  updated_at: string
  is_overdue: boolean
}

interface User {
  id: string
  name: string
  email: string
}

interface Project {
  id: string
  name: string
  user_name: string
}

export function AdminTasksTab() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = tasks

    if (selectedUser !== "all") {
      filtered = filtered.filter((task) => task.user === selectedUser)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((task) => task.status === selectedStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.project_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, selectedUser, selectedStatus])

  const loadData = async () => {
    try {
      const [tasksData, usersData, projectsData] = await Promise.all([
        apiClient.getAdminTasks(),
        apiClient.getAdminUsers(),
        apiClient.getAdminProjects(),
      ])
      setTasks(tasksData)
      setUsers(usersData)
      setProjects(projectsData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (taskData: {
    title: string
    description: string
    due_date: string
    priority: string
    status: string
    project: string
    user: string
  }) => {
    try {
      await apiClient.createAdminTask(taskData)
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

  const handleUpdateTask = async (
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
  ) => {
    try {
      await apiClient.updateAdminTask(taskId, taskData)
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

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await apiClient.deleteAdminTask(taskId)
        await loadData()
        toast({
          title: "Success",
          description: "Task deleted successfully",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete task",
          variant: "destructive",
        })
      }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "todo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Tasks Management</h2>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className={task.is_overdue ? "border-red-200 bg-red-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingTask(task)
                      setShowTaskForm(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{task.description}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                  {task.is_overdue && <Badge className="bg-red-100 text-red-800">Overdue</Badge>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Assigned to:</span> {task.user_name}
                  </div>
                  <div>
                    <span className="font-medium">Project:</span> {task.project_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Due:</span> {format(new Date(task.due_date), "MMM dd, yyyy")}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {format(new Date(task.created_at), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500">No tasks found</p>
          </CardContent>
        </Card>
      )}

      {showTaskForm && (
        <AdminTaskForm
          users={users}
          projects={projects}
          task={editingTask}
          onSubmit={editingTask ? (data) => handleUpdateTask(editingTask.id, data) : handleCreateTask}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
