from django.conf import settings
from django.db import models
from django.utils import timezone

# Create your models here.
class Deck(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="decks",)
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title

class Card(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')
    front_text = models.CharField(max_length=100)
    back_text = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    # FSRS scheduling fields
    due           = models.DateTimeField(default=timezone.now)
    stability     = models.FloatField(null=True, blank=True, default=None)
    difficulty    = models.FloatField(null=True, blank=True, default=None)
    step          = models.IntegerField(default=0)   
    state         = models.IntegerField(default=1)
    last_review   = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.front_text

