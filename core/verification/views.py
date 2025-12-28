from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from .services.geo import validate_location
from .services.vision import detect_tree
from .services.exif import extract_gps
from .services.hash import check_duplicate
from .services.signature import sign_result
from .models import Upload



class UploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        image = request.FILES["image"]
        lat = float(request.data["latitude"])
        lon = float(request.data["longitude"])

        # Generate image hash
        import imagehash
        from PIL import Image as PilImage
        
        # We need to maintain the stream position for various reads
        try:
            with PilImage.open(image) as pil_img:
                image_hash = str(imagehash.phash(pil_img))
        except Exception:
            image_hash = None

        duplicate = check_duplicate(image_hash)

        upload = Upload.objects.create(
            image=image,
            latitude=lat,
            longitude=lon,
            image_hash=image_hash,
            status="PENDING"
        )
        
        # Extract GPS from EXIF
        exif_gps = extract_gps(image)

        # Validate location
        source = request.data.get('source')
        
        if source == 'camera':
            # Trust browser location for live camera
            geo_ok = True
        else:
            # File uploads must have EXIF GPS
            if not exif_gps:
                geo_ok = False
            else:
                geo_ok = validate_location(
                    image,
                    lat,
                    lon,
                    exif_gps
                )

        # Detect biomass
        tree_ok, confidence = detect_tree(image)

        status = "APPROVED" if geo_ok and tree_ok and not duplicate else "REJECTED"

        upload.status = status
        upload.save()


        result = {
            "geo_valid": geo_ok,
            "tree_detected": tree_ok,
            "confidence": confidence,
            "duplicate": duplicate,
            "status": status
        }

        if status == "APPROVED":
            signed_json, hash_ = sign_result(result)
        else:
            signed_json = result
            hash_ = None

        return Response({
            "result": signed_json,
            "hash": hash_
        })
