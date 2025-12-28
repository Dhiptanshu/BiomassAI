from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("verification.urls")),
    # PWA & Frontend routes
    path("", TemplateView.as_view(template_name="index.html")),
    path("sw.js", TemplateView.as_view(template_name="sw.js", content_type="application/javascript")),
    path("manifest.json", TemplateView.as_view(template_name="manifest.json", content_type="application/manifest+json")),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
