"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, Edit } from "lucide-react"
import { AdminProjectForm } from "@/components/admin-project-form"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface Project {
  id: string
  name: string
  description: string
  color: string
  created_at: string
  task_count: number
  user: string
  user_name: string
}

interface User {
  id: string
  name: string
  email: string
}

export function AdminProjectsTab() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = projects

    if (selectedUser !== "all") {
      filtered = filtered.filter((project) => project.user === selectedUser)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, selectedUser])

  const loadData = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([apiClient.getAdminProjects(), apiClient.getAdminUsers()])
      setProjects(projectsData)
      setUsers(usersData)
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

  const handleCreateProject = async (projectData: {
    name: string
    description: string
    color: string
    user: string
  }) => {
    try {
      await apiClient.createAdminProject(projectData)
      await loadData()
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

  const handleUpdateProject = async (
    projectId: string,
    projectData: Partial<{ name: string; description: string; color: string; user: string }>,
  ) => {
    try {
      await apiClient.updateAdminProject(projectId, projectData)
      await loadData()
      toast({
        title: "Success",
        description: "Project updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? This will also delete all associated tasks.")) {
      try {
        await apiClient.deleteAdminProject(projectId)
        await loadData()
        toast({
          title: "Success",
          description: "Project deleted successfully",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete project",
          variant: "destructive",
        })
      }
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
        <h2 className="text-xl font-semibold">Projects Management</h2>
        <Button onClick={() => setShowProjectForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
      </div>

      <div className="grid gap-4">
        {filteredProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{project.task_count} tasks</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingProject(project)
                      setShowProjectForm(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{project.description}</p>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Owner:</span> {project.user_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Color:</span>
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: project.color }} />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Created:</span> {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500">No projects found</p>
          </CardContent>
        </Card>
      )}

      {showProjectForm && (
        <AdminProjectForm
          users={users}
          project={editingProject}
          onSubmit={editingProject ? (data) => handleUpdateProject(editingProject.id, data) : handleCreateProject}
          onClose={() => {
            setShowProjectForm(false)
            setEditingProject(null)
          }}
        />
      )}
    </div>
  )
}
