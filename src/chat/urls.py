
#chat/urls.py
from django.contrib import admin
from django.urls import path
from .views import index, room, CreateUserView, LoginView

app_name = 'chat'

urlpatterns = [
    path("", index, name="index"),
    path("<str:room_name>/", room, name="room"),
    path('register/', CreateUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]