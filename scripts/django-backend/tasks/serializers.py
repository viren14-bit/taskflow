from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Task, Project

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True, min_length=1)
    last_name = serializers.CharField(required=True, min_length=1)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password_confirm')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Use email as username if username not provided
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email']
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Try to find user by email
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'name', 'is_staff', 'is_superuser')

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class ProjectSerializer(serializers.ModelSerializer):
    task_count = serializers.ReadOnlyField()
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'color', 'created_at', 'task_count', 'user', 'user_name')
        read_only_fields = ('created_at', 'task_count', 'user')

    def create(self, validated_data):
        # For regular users, set the user to the request user
        if not self.context['request'].user.is_staff:
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate_name(self, value):
        user = self.context['request'].user
        # Check for duplicate project names for the same user
        if self.instance:
            # Update case - exclude current instance
            if Project.objects.filter(name=value, user=user).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("You already have a project with this name.")
        else:
            # Create case
            if not user.is_staff:
                if Project.objects.filter(name=value, user=user).exists():
                    raise serializers.ValidationError("You already have a project with this name.")
        return value

class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'due_date', 'priority', 'status', 
                 'project', 'project_name', 'user', 'user_name', 'created_at', 'updated_at', 'is_overdue')
        read_only_fields = ('created_at', 'updated_at', 'is_overdue', 'user')

    def create(self, validated_data):
        # For regular users, set the user to the request user
        if not self.context['request'].user.is_staff:
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate_project(self, value):
        user = self.context['request'].user
        # For regular users, ensure they can only assign tasks to their own projects
        if not user.is_staff and value.user != user:
            raise serializers.ValidationError("You can only assign tasks to your own projects")
        return value

# Admin-specific serializers
class AdminProjectSerializer(ProjectSerializer):
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields
        read_only_fields = ('created_at', 'task_count')

class AdminTaskSerializer(TaskSerializer):
    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields
        read_only_fields = ('created_at', 'updated_at', 'is_overdue')
