from django.db import models


class Course(models.Model):
    LEVELS = [("Beginner", "Pemula"), ("Intermediate", "Menengah"), ("Advanced", "Lanjutan")]

    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    description = models.TextField()
    instructor = models.CharField(max_length=100)
    category = models.CharField(max_length=80)
    level = models.CharField(max_length=20, choices=LEVELS, default="Beginner")
    duration = models.CharField(max_length=40, default="4 minggu")
    price = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    image_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
