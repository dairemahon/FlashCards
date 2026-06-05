from django.db import models

# Create your models here.
class FlashCardFront(models.Model):
    front_text = models.CharField(max_length=1000)
    pub_date = models.DateTimeField("date published")

class FlashCardBack(models.Model):
    # defining relationship
    question = models.ForeignKey(FlashCardFront, on_delete=models.CASCADE)
    back_text = models.CharField(max_length=1000)
    # votes = models.IntegerField(default=0)
