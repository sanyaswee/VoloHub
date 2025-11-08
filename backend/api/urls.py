from django.urls import path, include
from .views import *

urlpatterns = [
    path('ping/', ping),

    # Projects
    path('projects/', projects_endpoint),
    path('projects/<int:project_id>', project_detail_endpoint),
    path('vote/<int:project_id>/', vote_for_project),
    path('comments/<int:project_id>/', comments_endpoint),

    # Auth
    path('register/', register),
    path('login/', login_view),
    path('logout/', logout_view),
    path('user/', get_user),
]