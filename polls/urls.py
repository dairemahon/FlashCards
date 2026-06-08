from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("", views.add, name="add")
    path("", views.account, name="account")
]