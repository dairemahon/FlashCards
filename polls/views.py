import json

from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods 
from .models import Deck
from .forms import DeckForm



def signup(request):
        if request.method == "POST":
                form = UserCreationForm(request.POST)
                if form.is_valid():
                        form.save()
                        return redirect("login")
        else:
                form = UserCreationForm()
        return render(request, "registration/signup.html", {"form": form})

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

@login_required
@require_http_methods(["GET"])
def get_csrf_token(request):
        """Get CSRF token for forms"""
        token = get_token(request)
        return JsonResponse({"csrfToken": token})


def index(request):
        return HttpResponse("You're looking at the index page.")

def account(request):
        return HttpResponse("You're looking at the account page.")
