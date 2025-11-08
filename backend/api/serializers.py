from rest_framework import serializers
from .models import *


class ProjectSerializer(serializers.ModelSerializer):
    votes = serializers.SerializerMethodField()
    user_voted = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    participants_count = serializers.IntegerField(source='participants.count', read_only=True)
    class Meta:
        model = Project
        fields = '__all__'

    def get_votes(self, project):
        return project.votes.filter(value=1).count() - project.votes.filter(value=-1).count()

    def get_user_voted(self, project):
        user = self.context.get('request').user
        if user.is_anonymous:
            return 0
        vote = project.votes.filter(user=user).first()
        if vote:
            return vote.value
        return 0


class CreateProjectSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    description = serializers.CharField(max_length=1024)
    city = serializers.CharField(max_length=100)
    location = serializers.CharField(max_length=100)

    def create(self, validated_data):
        project = Project.objects.create(**validated_data)
        return project


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class CreateUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField()

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class ParticipationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParticipationRequest
        fields = '__all__'
