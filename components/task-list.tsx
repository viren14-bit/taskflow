"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import type { Task, Project } from "@/components/task-dashboard"
import { format } from "date-fns"

interface TaskListProps {
  tasks: Task[]
  projects: Project[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  showDeleteButton?: boolean
  onDeleteTask?: (taskId: string) => void
}

export function TaskList({ tasks, projects, onUpdateTask, showDeleteButton = false, onDeleteTask }: TaskListProps) {
  const [sortBy, setSortBy] = useState<"due_date" | "priority" | "status">("due_date")

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

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "due_date":
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case "status":
        const statusOrder = { todo: 1, "in-progress": 2, completed: 3 }
        return statusOrder[a.status] - statusOrder[b.status]
      default:
        return 0
    }
  })

  const isOverdue = (dueDate: string, status: string) => {
    return status !== "completed" && new Date(dueDate) < new Date()
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-500 text-center">
            Get started by creating your first task. Click the "New Task" button above.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Select value={sortBy} onValueChange={(value: "due_date" | "priority" | "status") => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {sortedTasks.map((task) => (
          <Card key={task.id} className={`${isOverdue(task.due_date, task.status) ? "border-red-200 bg-red-50" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription>{task.description}</CardDescription>
                </div>
                {showDeleteButton && onDeleteTask && (
                  <Button variant="destructive" size="sm" onClick={() => onDeleteTask(task.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                <Badge variant="outline">{task.project_name}</Badge>
                {isOverdue(task.due_date, task.status) && <Badge className="bg-red-100 text-red-800">Overdue</Badge>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 h-4 w-4" />
                  Due: {format(new Date(task.due_date), "MMM dd, yyyy")}
                </div>

                <Select
                  value={task.status}
                  onValueChange={(value: "todo" | "in-progress" | "completed") =>
                    onUpdateTask(task.id, { status: value })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
