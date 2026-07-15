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
from .models import Deck, Card
from .forms import DeckForm
from fsrs import Scheduler, Card as FSRSCard, Rating, State
from datetime import datetime, timezone as dt_timezone

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
        """Return a single deck as JSON."""
        deck = get_object_or_404(Deck, id=deck_id, owner=request.user)
        cards = deck.cards.all()
        cards_data = []

        for card in cards:
                cards_data.append({
                        "id": card.id,
                        "front_text": card.front_text,
                        "back_text": card.back_text,
                        "created_at": card.created_at.isoformat(),
                        "due": card.due.isoformat(),
                        "state": card.state,
        })
        
        data = {
                "id": deck.id,
                "title": deck.title,
                "description": deck.description,
                "created_at": deck.created_at.isoformat(),
                "cards": cards_data
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
@require_http_methods(["DELETE"])
def api_delete_deck(request, deck_id):
        """Delete a deck"""
        try:
                deck = get_object_or_404(Deck, id=deck_id, owner=request.user)
                deck.delete()
                return JsonResponse({"success": True})
        
        except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)

@login_required
@require_http_methods(["POST"])
def api_create_card(request, deck_id):
        """Create a new card in a deck"""
        try:
                deck = get_object_or_404(Deck, id=deck_id, owner=request.user)
                data = json.loads(request.body)

                card = Card.objects.create(
                        deck=deck,
                        front_text=data.get("front_text", ""),
                        back_text=data.get("back_text", "")
                )
                return JsonResponse({
                        "id": card.id,
                        "front_text": card.front_text,
                        "back_text": card.back_text,
                        "created_at": card.created_at.isoformat()
                }, status=201)
        
        except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)


@login_required
@require_http_methods(["PUT", "DELETE"])
def api_update_card(request, card_id):
        """Update and existing card"""
        try:
                if request.method == "DELETE":
                      card = get_object_or_404(Card, id=card_id, deck__owner=request.user)
                      card.delete()
                      return JsonResponse({"success": True})
                card = get_object_or_404(Card, id=card_id, deck__owner=request.user)
                data = json.loads(request.body)

                card.front_text = data.get("front_text", card.front_text)
                card.back_text = data.get("back_text", card.back_text)
                card.save()

                return JsonResponse({
                        "id": card.id,
                        "front_text": card.front_text,
                        "back_text": card.back_text,
                        "created_at": card.created_at.isoformat()
                })
        
        except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)

@login_required
@require_http_methods(["POST"])
def api_review_card(request, card_id):
    """Record a review rating and update the card's FSRS schedule"""
    try:
        card = get_object_or_404(Card, id=card_id, deck__owner=request.user)
        data = json.loads(request.body)
        rating_value = data.get("rating")

        if rating_value not in [1, 2, 3, 4]:
            return JsonResponse({"error": "Rating must be 1 (Again), 2 (Hard), 3 (Good), or 4 (Easy)"}, status=400)

        # Reconstruct an FSRS card object from the values stored in the database
        fsrs_card = FSRSCard()
        fsrs_card.due            = card.due
        fsrs_card.stability      = card.stability if card.stability else None
        fsrs_card.difficulty     = card.difficulty if card.difficulty else None
        fsrs_card.step           = card.step
        fsrs_card.state          = State(card.state) if card.state in (1, 2, 3) else State.Learning
        fsrs_card.last_review    = card.last_review

        # Run the FSRS algorithm — this is the core calculation
        f = Scheduler()
        now = datetime.now(dt_timezone.utc)
        fsrs_card, _ = f.review_card(fsrs_card, Rating(rating_value), now)

        # Write the updated values back to the database
        card.due            = fsrs_card.due
        card.stability      = fsrs_card.stability
        card.difficulty     = fsrs_card.difficulty
        card.step           = fsrs_card.step if fsrs_card.step is not None else 0
        card.state          = fsrs_card.state.value    # convert enum back to int for storage
        card.last_review    = now
        card.save()

        return JsonResponse({
            "id": card.id,
            "due": card.due.isoformat(),
            "state": card.state,
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)



@login_required
@require_http_methods(["DELETE"])
def api_delete_card(request, card_id):
        """Delete an existing card"""
        try:
                card = get_object_or_404(Card, id=card_id, deck__owner=request.user)
                card.delete()
                return JsonResponse({"success": True})
        
        except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)
        

def index(request):
        return HttpResponse("You're looking at the index page.")

def account(request):
        return HttpResponse("You're looking at the account page.")
