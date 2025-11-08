from django.urls import path, include
from .views import *

urlpatterns = [
    path('ping/', ping),
    path('projects/', projects_endpoint),
    path('projects/<int:project_id>', project_detail_endpoint),
]