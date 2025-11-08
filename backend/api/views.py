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
    project = Project.objects.get(pk=project_id)
    serialized = ProjectSerializer(project)
    return Response(serialized.data)

def update_project(request, project_id):
    project = Project.objects.get(pk=project_id)
    serializer = ProjectSerializer(project, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

def delete_project(request, project_id):
    project = Project.objects.get(pk=project_id)
    project.delete()
    return Response(status=204)
