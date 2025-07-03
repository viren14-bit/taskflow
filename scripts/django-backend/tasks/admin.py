from django.contrib import admin
from .models import Task, Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    list_filter = ('created_at', 'color')
    search_fields = ('name', 'description')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'user', 'priority', 'status', 'due_date')
    list_filter = ('priority', 'status', 'due_date', 'created_at')
    search_fields = ('title', 'description')
    date_hierarchy = 'due_date'
