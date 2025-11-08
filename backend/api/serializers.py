from rest_framework import serializers
from .models import *


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class CreateProjectSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    description = serializers.CharField(max_length=1024)
    city = serializers.CharField(max_length=100)
    location = serializers.CharField(max_length=100)

    def create(self, validated_data):
        project = Project.objects.create(**validated_data)
        return project
