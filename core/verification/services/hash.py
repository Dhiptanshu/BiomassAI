from ..models import Upload

def check_duplicate(image_hash):
    """
    Checks if an APPROVED image with the same hash already exists.
    """
    if not image_hash:
        return False
        
    return Upload.objects.filter(image_hash=image_hash, status="APPROVED").exists()
