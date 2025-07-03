import os
import subprocess
import sys

def setup_django_backend():
    """Set up Django backend with all dependencies and initial data"""
    
    print("Setting up Django backend...")
    
    # Change to backend directory
    backend_dir = "django-backend"
    if not os.path.exists(backend_dir):
        print(f"Backend directory {backend_dir} not found!")
        return
    
    os.chdir(backend_dir)
    
    try:
        # Install dependencies
        print("Installing dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        
        # Run migrations
        print("Running migrations...")
        subprocess.run([sys.executable, "manage.py", "makemigrations", "tasks"], check=True)
        subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
        
        # Create superuser
        print("Creating superuser...")
        subprocess.run([
            sys.executable, "manage.py", "shell", "-c",
            "from django.contrib.auth.models import User; "
            "User.objects.filter(username='admin').exists() or "
            "User.objects.create_superuser('admin', 'admin@example.com', 'admin123')"
        ], check=True)
        
        print("Django backend setup complete!")
        print("Superuser created: username='admin', password='admin123'")
        print("To start the server, run: python manage.py runserver")
        
    except subprocess.CalledProcessError as e:
        print(f"Error setting up Django backend: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    setup_django_backend()
