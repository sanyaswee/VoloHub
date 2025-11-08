from django.urls import path, include
from .views import *

urlpatterns = [
    path('ping/', ping),
    path('projects/', projects_endpoint),
]