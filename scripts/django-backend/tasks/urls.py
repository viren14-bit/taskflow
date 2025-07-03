from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/user/', views.user_profile, name='user_profile'),
    
    # User Projects (CRUD)
    path('projects/', views.ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    
    # User Tasks (CRU - No Delete)
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    
    # User Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    
    # Admin Routes
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/projects/', views.AdminProjectListCreateView.as_view(), name='admin-project-list-create'),
    path('admin/projects/<int:pk>/', views.AdminProjectDetailView.as_view(), name='admin-project-detail'),
    path('admin/tasks/', views.AdminTaskListCreateView.as_view(), name='admin-task-list-create'),
    path('admin/tasks/<int:pk>/', views.AdminTaskDetailView.as_view(), name='admin-task-detail'),
    path('admin/dashboard/stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
]
