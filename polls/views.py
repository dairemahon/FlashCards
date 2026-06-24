import json
 
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods 
from .models import Deck
from .forms import DeckForm




from django.contrib.auth.decorators import login_required

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
def deck_list(request):
        decks = Deck.objects.filter(user=request.user)
        return render(request, "polls/deck_list.html", {"decks": decks})

@login_required
def deck_detail(request, deck_id):
        deck = get_object_or_404(Deck, id=deck_id, user=request.user)
        return render(request, "polls/deck_detail.html", {"deck": deck})

@login_required
def deck_create(request):
        if request.method == "POST":
                form = DeckForm(request.POST)
                if form.is_valid():
                        deck = form.save(commit=False)
                        deck.owner = request.user
                        deck.save()
                        return redirect("deck_detail", deck_id=deck.id)
        else:
                form = DeckForm()
        return render(request, "polls/deck_form.html", {"form": form})


def index(request):
        return HttpResponse("You're looking at the index page.")

def account(request):
        return HttpResponse("You're looking at the account page.")
