from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.


class User(AbstractUser):
    # Your custom fields
    city = models.CharField(max_length=64)
    bio = models.TextField()

    # 👇 FIX: Override inherited fields with unique related_name
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_user_set', # Use a unique related_name
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_user_permissions_set', # Use another unique related_name
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='user',
    )


class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    city = models.CharField(max_length=64)
    status = models.CharField(max_length=32, default='idea')
    location = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
