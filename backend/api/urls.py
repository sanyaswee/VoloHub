from django.urls import path, include
from .views import *

urlpatterns = [
    path('ping/', ping),

    # Projects
    path('projects/', projects_endpoint),
    path('projects/<int:project_id>', project_detail_endpoint),
    path('vote/<int:project_id>/', vote_for_project),
    path('comments/<int:project_id>/', comments_endpoint),
    path('delete_comment/<int:comment_id>/', delete_comment),
    path('participation_requests/<int:project_id>/', participation_requests_endpoint),
    path('my_participation_requests/', my_participation_requests),
    path('ai_feedback/<int:project_id>/', analyze_project_with_ai),

    # Auth
    path('register/', register),
    path('login/', login_view),
    path('logout/', logout_view),
    path('user/', get_user),
]