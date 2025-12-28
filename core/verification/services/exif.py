from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def extract_gps(image_file):
    try:
        img = Image.open(image_file)
        exif = img._getexif()
        if not exif:
            return None

        gps_data = {}
        for tag, value in exif.items():
            tag_name = TAGS.get(tag)
            if tag_name == "GPSInfo":
                for key in value:
                    gps_data[GPSTAGS.get(key)] = value[key]

        def convert(coord):
            d, m, s = coord
            return float(d) + float(m)/60 + float(s)/3600

        lat = convert(gps_data["GPSLatitude"])
        if gps_data["GPSLatitudeRef"] != "N":
            lat = -lat

        lon = convert(gps_data["GPSLongitude"])
        if gps_data["GPSLongitudeRef"] != "E":
            lon = -lon

        return lat, lon

    except Exception:
        return None
