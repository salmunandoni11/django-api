from django.contrib import admin
from django.urls import include, path
from .views import api_home, chat, get_weather

urlpatterns = [
    path("", api_home, name="api-home"),
    path("admin/", admin.site.urls),
    path("api/courses/", include("courses.urls")),
    path("api/weather/", get_weather, name="api-weather"),
    path("api/chat/", chat, name="api-chat"),
]
