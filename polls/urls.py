from django.urls import path
from . import views

urlpatterns = [
    # Keep the existing template views for now
    path("", views.index, name="index"),
    path("decks/", views.api_deck_list, name="deck_list"),
    path("decks/<int:deck_id>/", views.api_deck_detail, name="deck_detail"),
    path("decks/create/", views.api_deck_create, name="deck_create"),
    
]