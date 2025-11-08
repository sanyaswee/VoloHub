from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create your views here.


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    return Response({"message": "pong!"})
