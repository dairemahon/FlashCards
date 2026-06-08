from django.http import HttpResponse
from django.shortcuts import render





def index(request):
        return HttpResponse("You're looking at the Add page.")

def account(request):
        return HttpResponse("You're looking at the account page.")
