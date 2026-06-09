from django.http import HttpResponse
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import redirect, render


def signup(request):
        if request.method == "POST":
                form = UserCreationForm(request.POST)
                if form.is_valid():
                        form.save()
                        return redirect("login")
        else:
                form = UserCreationForm()
        return render(request, "registration/signup.html", {"form": form})



def index(request):
        return HttpResponse("You're looking at the index page.")

def account(request):
        return HttpResponse("You're looking at the account page.")
