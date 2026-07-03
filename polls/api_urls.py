from django.urls import path
from . import views

urlpatterns = [
    # API endpoints for React
    path("check-auth/", views.api_check_auth, name="check_auth"),
    path("login/", views.api_login, name="api_login"),
    path("logout/", views.api_logout, name="api_logout"),
    path("signup/", views.api_signup, name="api_signup"),
    path("decks/", views.api_deck_list, name="api_deck_list"),
    path("decks/<int:deck_id>/", views.api_deck_detail, name="api_deck_detail"),
    path("decks/create/", views.api_deck_create, name="api_deck_create"),
    path("csrf-token/", views.get_csrf_token, name="get_csrf_token"),
    path("decks/<int:deck_id>/cards/", views.api_create_card, name="api_create_card"),
    path("cards/<int:card_id>/", views.api_update_card, name="api_update_card"),
    path("cards/<int:card_id>/", views.api_delete_card, name="api_delete_card")
]