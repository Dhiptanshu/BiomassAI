import json
import hashlib
from datetime import datetime

def sign_result(data: dict):
    payload = {
        **data,
        "timestamp": datetime.utcnow().isoformat()
    }

    payload_str = json.dumps(payload, sort_keys=True)
    digest = hashlib.sha256(payload_str.encode()).hexdigest()

    return payload, digest
