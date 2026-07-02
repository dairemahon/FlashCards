import json

from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods 
from .models import Deck
from .forms import DeckForm

@require_http_methods(["GET"])
def get_csrf_token(request):
        """Get CSRF token for forms"""
        token = get_token(request)
        return JsonResponse({"csrfToken": token})



@require_http_methods(["GET"])
def api_check_auth(request):
    """Check if the user is authenticated and return user info."""
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email
            }
        })
    else:
        return JsonResponse({"authenticated": False})


@csrf_exempt
@require_http_methods(["POST"])
def api_signup(request):
    try:
        data = json.loads(request.body)
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip()
        password = data.get("password") or ""
        password2 = data.get("password2") or ""

        if not username or not password:
            return JsonResponse({"error": "Username and password are required"}, status=400)

        if password != password2:
            return JsonResponse({"error": "Passwords do not match"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)

        return JsonResponse({"success": True}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@require_http_methods(["POST"])
def api_login(request):
    """JSON login endpoint - takes username and password, returns user info"""
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                "success": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            })
        else:
            return JsonResponse({"success": False, "error": "Invalid credentials"}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@require_http_methods(["POST"])
def api_logout(request):
    """JSON logout endpoint"""
    logout(request)
    return JsonResponse({"success": True})


@login_required
@require_http_methods(["GET"])
def api_deck_list(request):
        """Return user's decks as JSON."""
        decks = Deck.objects.filter(owner=request.user).values("id", "title", "description", "created_at")
        return JsonResponse({"decks": list(decks)})

@login_required
@require_http_methods(["GET"])
def api_deck_detail(request, deck_id):
        """Return a single decks as JSON."""
        deck = get_object_or_404(Deck, id=deck_id, owner=request.user)
        data = {
                "id": deck.id,
                "title": deck.title,
                "description": deck.description,
                "created_at": deck.created_at.isoformat()
        }
        return JsonResponse(data)

@login_required
@require_http_methods(["POST"])
def api_deck_create(request):
        """Create a deck from JSON POST data."""
        try:
                data = json.loads(request.body)
                deck = Deck.objects.create(
                        owner=request.user,
                        title=data.get("title", ""),
                        description=data.get("description", "")
                )
                return JsonResponse({"id": deck.id, "title": deck.title, "description": deck.description,
                }, status=201)
        except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)




def index(request):
        return HttpResponse("You're looking at the index page.")

def account(request):
        return HttpResponse("You're looking at the account page.")
