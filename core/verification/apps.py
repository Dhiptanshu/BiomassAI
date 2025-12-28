from django.apps import AppConfig


class VerificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'verification'

    def ready(self):
        # Prevent double loading in Django dev server (reloader)
        import os
        if os.environ.get('RUN_MAIN') == 'true':
            from .services.vision import get_model
            print("Initialization: Pre-loading MobileNetV2...")
            get_model()
