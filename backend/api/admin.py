from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.db.models import Sum

from .models import (
    User,
    Project,
    Vote,
    Comment,
    Participant,
    ParticipationRequest,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin for the custom User model. Extends Django's built-in UserAdmin
    and exposes the extra fields `city` and `bio`.
    """
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional info", {"fields": ("city", "bio")} ),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets
    list_display = ("username", "email", "first_name", "last_name", "city", "is_staff", "is_active")
    search_fields = ("username", "email", "city", "first_name", "last_name")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "author", "city", "status", "created_at", "votes", "comments_count")
    search_fields = ("name", "description", "city", "author__username")
    list_filter = ("city", "status", "created_at")
    readonly_fields = ("created_at",)

    def votes(self, obj):
        """Compute sum of vote values for the project."""
        total = obj.votes.aggregate(total=Sum("value"))["total"]
        return total or 0
    votes.short_description = "votes"
    votes.admin_order_field = "votes__value"

    def comments_count(self, obj):
        return obj.comments.count()
    comments_count.short_description = "comments"
    comments_count.admin_order_field = "comments__id"


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ("user", "project", "value", "created_at")
    list_filter = ("value", "created_at")
    search_fields = ("user__username", "project__name")
    readonly_fields = ("created_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "project", "short_content", "created_at")
    search_fields = ("content", "user__username", "project__name")
    list_filter = ("created_at",)
    readonly_fields = ("created_at",)

    def short_content(self, obj):
        return (obj.content[:75] + "...") if len(obj.content) > 75 else obj.content
    short_content.short_description = "content"


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ("user", "project", "role", "joined_at")
    search_fields = ("user__username", "project__name", "role")
    list_filter = ("role",)
    readonly_fields = ("joined_at",)


@admin.register(ParticipationRequest)
class ParticipationRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "project", "status", "created_at")
    search_fields = ("user__username", "project__name", "message")
    list_filter = ("status", "created_at")
    readonly_fields = ("created_at",)
