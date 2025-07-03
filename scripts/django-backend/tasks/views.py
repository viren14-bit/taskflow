from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Q, Count
from datetime import date
from .models import Task, Project
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer,
    TaskSerializer, 
    ProjectSerializer,
    AdminTaskSerializer,
    AdminProjectSerializer
)

# Custom permission classes
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            # Create default project
            Project.objects.create(
                name="Personal",
                description="Personal tasks",
                color="blue",
                user=user
            )
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    try:
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout(request):
    try:
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request):
    return Response(UserSerializer(request.user).data)

# User Project Views
class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

# User Task Views (No Delete)
class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)
        
        # Filter by project
        project_id = self.request.query_params.get('project', None)
        if project_id and project_id != 'all':
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by priority
        priority_filter = self.request.query_params.get('priority', None)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset

class TaskDetailView(generics.RetrieveUpdateAPIView):  # Removed DestroyAPIView
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

# Admin Views
class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()

class AdminProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminProjectSerializer
    queryset = Project.objects.all().select_related('user')

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

class AdminProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminProjectSerializer
    queryset = Project.objects.all()

class AdminTaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminTaskSerializer
    queryset = Task.objects.all().select_related('user', 'project')

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by project
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset

class AdminTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminTaskSerializer
    queryset = Task.objects.all()

@api_view(['GET'])
def dashboard_stats(request):
    try:
        user_tasks = Task.objects.filter(user=request.user)
        
        # Filter by project if specified
        project_id = request.query_params.get('project', None)
        if project_id and project_id != 'all':
            user_tasks = user_tasks.filter(project_id=project_id)
        
        total_tasks = user_tasks.count()
        todo_tasks = user_tasks.filter(status='todo').count()
        in_progress_tasks = user_tasks.filter(status='in-progress').count()
        completed_tasks = user_tasks.filter(status='completed').count()
        overdue_tasks = user_tasks.filter(
            due_date__lt=date.today(),
            status__in=['todo', 'in-progress']
        ).count()
        
        return Response({
            'total_tasks': total_tasks,
            'todo_tasks': todo_tasks,
            'in_progress_tasks': in_progress_tasks,
            'completed_tasks': completed_tasks,
            'overdue_tasks': overdue_tasks,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    try:
        # Overall statistics
        total_users = User.objects.filter(is_staff=False).count()
        total_projects = Project.objects.count()
        total_tasks = Task.objects.count()
        
        # Task status breakdown
        todo_tasks = Task.objects.filter(status='todo').count()
        in_progress_tasks = Task.objects.filter(status='in-progress').count()
        completed_tasks = Task.objects.filter(status='completed').count()
        overdue_tasks = Task.objects.filter(
            due_date__lt=date.today(),
            status__in=['todo', 'in-progress']
        ).count()
        
        # Recent activity
        recent_users = User.objects.filter(is_staff=False).order_by('-date_joined')[:5]
        recent_projects = Project.objects.order_by('-created_at')[:5]
        recent_tasks = Task.objects.order_by('-created_at')[:5]
        
        return Response({
            'total_users': total_users,
            'total_projects': total_projects,
            'total_tasks': total_tasks,
            'todo_tasks': todo_tasks,
            'in_progress_tasks': in_progress_tasks,
            'completed_tasks': completed_tasks,
            'overdue_tasks': overdue_tasks,
            'recent_users': UserSerializer(recent_users, many=True).data,
            'recent_projects': AdminProjectSerializer(recent_projects, many=True).data,
            'recent_tasks': AdminTaskSerializer(recent_tasks, many=True).data,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
