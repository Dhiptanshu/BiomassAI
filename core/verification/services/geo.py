from .exif import extract_gps
import math



def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

def validate_location(image_file, claimed_lat, claimed_lon, exif_data=None):
    gps = exif_data if exif_data else extract_gps(image_file)
    if not gps:
        return False

    img_lat, img_lon = gps
    distance = haversine(img_lat, img_lon, claimed_lat, claimed_lon)

    return distance <= 50  # meters
