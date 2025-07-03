from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator

class Project(models.Model):
    name = models.CharField(max_length=200, validators=[MinLengthValidator(1)])
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=50, default='blue')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['name', 'user']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def task_count(self):
        return self.tasks.count()

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=200, validators=[MinLengthValidator(1)])
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='todo')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date', '-priority']

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    @property
    def is_overdue(self):
        from datetime import date
        return self.status != 'completed' and self.due_date < date.today()
