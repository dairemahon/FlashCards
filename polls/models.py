import datetime

from django.db import models
from django.utils import timezone

# Create your models here.
class FlashCardFront(models.Model):
    front_text = models.CharField(max_length=1000)
    pub_date = models.DateTimeField("date published")

    def __str__(self):
        return self.front_text
    
    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)

class FlashCardBack(models.Model):
    # defining relationship
    question = models.ForeignKey(FlashCardFront, on_delete=models.CASCADE)
    back_text = models.CharField(max_length=1000)
    # votes = models.IntegerField(default=0)
    def __str__(self):
        return self.back_text
