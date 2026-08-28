from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "description", "instructor", "category"]
    ordering_fields = ["created_at", "price", "title"]
