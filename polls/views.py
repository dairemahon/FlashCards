from django.http import HttpResponse

def index(request):
        return HttpResponse("Hello World. You're at the polls index.")

def add(request):
        response = "You're looking at the Add page %s."

def account(request):
        response = "You're looking at the account page"
