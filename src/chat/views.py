# chat/views.py
import json
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.utils.safestring import mark_safe
from django.contrib.auth import authenticate
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from .serializers import UserSerializer

def index(request):
    return  render(request, 'chat/index.html')

@login_required
def room(request, room_name):
    return render(request, "chat/room.html", {
        "room_name_json": mark_safe(json.dumps(room_name)),
        'username': mark_safe(json.dumps(request.user.username)),
    })
    
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer

class LoginView(generics.CreateAPIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get("username", "")
        password = request.data.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)