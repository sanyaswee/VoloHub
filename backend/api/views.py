from django.contrib.auth import login, authenticate, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import *
from .serializers import *

# Create your views here.


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    return Response({"message": "pong!"})


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def projects_endpoint(request):
    if request.method == 'GET':
        return get_projects(request)
    elif request.method == 'POST':
        return create_project(request)

    return Response(status=405)


def get_projects(request):
    city = request.GET.get('city', None)
    if city:
        projects = Project.objects.filter(city=request.GET.get('city'))
    else:
        projects = Project.objects.all()
    serialized = ProjectSerializer(projects, many=True)
    return Response(serialized.data)

def create_project(request):
    serializer = CreateProjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def project_detail_endpoint(request, project_id):
    if request.method == 'GET':
        return get_project_detail(request, project_id)
    elif request.method == 'PUT':
        return update_project(request, project_id)
    elif request.method == 'DELETE':
        return delete_project(request, project_id)
    return Response(status=405)


def get_project_detail(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
        serialized = ProjectSerializer(project)
        return Response(serialized.data)
    except Project.DoesNotExist:
        return Response(status=404)

def update_project(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except Project.DoesNotExist:
        return Response(status=404)

def delete_project(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
        project.delete()
        return Response(status=204)
    except Project.DoesNotExist:
        return Response(status=404)


# AUTH
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = CreateUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response({"message": "User registered"}, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({"message": "Logged in", "user": CreateUserSerializer(user).data}, status=200)

    return Response({"error": "Invalid credentials"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out"}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=200)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def vote_for_project(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        return Response(status=404)

    user = request.user
    if request.method == 'DELETE':
        Vote.objects.filter(user=user, project=project).delete()
        return Response({"message": "Vote removed"}, status=204)

    if request.method == 'POST':
        value = request.data.get('value', None)
        if value not in [1, -1]:
            return Response({"error": "Invalid vote value"}, status=400)
        if Vote.objects.filter(user=user, project=project).exists():
            if Vote.objects.filter(user=user, project=project, value=value).exists():
                return Response({"error": "User has already voted for this project"}, status=400)

            Vote.objects.filter(user=user, project=project).delete()

        Vote.objects.create(user=user, project=project, value=value)
        return Response({"message": "Vote recorded"}, status=201)

    return Response(status=405)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def comments_endpoint(request, project_id):
    if request.method == 'GET':
        return get_project_comments(request, project_id)
    elif request.method == 'POST':
        return comment_on_project(request, project_id)

    return Response(status=405)


def comment_on_project(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        return Response(status=404)

    user = request.user
    content = request.data.get('content', '').strip()
    if not content:
        return Response({"error": "Comment content cannot be empty"}, status=400)

    comment = Comment.objects.create(user=user, project=project, content=content)
    serializer = CommentSerializer(comment)
    return Response(serializer.data, status=201)


def get_project_comments(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        return Response(status=404)

    comments = project.comments.all().order_by('-created_at')
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)
