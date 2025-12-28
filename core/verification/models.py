from django.db import models

class Upload(models.Model):
    image = models.ImageField(upload_to='uploads/')
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    image_hash = models.CharField(max_length=64, blank=True, null=True)

    status = models.CharField(
        max_length=20,
        default='PENDING'
    )
