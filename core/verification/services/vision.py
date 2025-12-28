import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image as keras_image
from PIL import Image

# Global model instance
_MODEL = None

def get_model():
    global _MODEL
    if _MODEL is None:
        # GPU Configuration / Fallback
        try:
            gpus = tf.config.list_physical_devices('GPU')
            if gpus:
                print(f"GPU Detected: {gpus}")
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
            else:
                print("No GPU detected. Running on CPU.")
        except Exception as e:
            print(f"GPU Configuration failed: {e}. Falling back to default.")

        print("Loading MobileNetV2 model...")
        _MODEL = MobileNetV2(weights='imagenet')
    return _MODEL

import time

def detect_tree(image_file):
    try:
        t0 = time.time()
        model = get_model()
        t1 = time.time()
        print(f"⏱️ Model access time: {t1 - t0:.4f}s")
        
        # Load and preprocess image
        img = Image.open(image_file).convert('RGB')
        img = img.resize((224, 224))
        t2 = time.time()
        print(f"⏱️ Image resize time: {t2 - t1:.4f}s")
        
        x = keras_image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        
        # Predict
        print("Starting prediction...")
        preds = model.predict(x)
        t3 = time.time()
        print(f"⏱️ Prediction time: {t3 - t2:.4f}s")
        
        # Decode top 5 predictions
        decoded = decode_predictions(preds, top=5)[0]
        
        tree_keywords = [
            'tree', 'forest', 'wood', 'plant', 'bush', 'flower', 
            'garden', 'park', 'broccoli', 'cauliflower', 'leaf',
            'potted_plant', 'shrub', 'grass', 'pine', 'oak',
            'rapeseed', 'valley', 'alp', 'hay', 'meadow', 
            'corn', 'grain', 'greenhouse', 'lakeside', 'daisy'
        ]
        
        is_tree = False
        confidence = 0.0
        
        print("Predictions:", decoded)
        
        # Look at the top prediction
        top_pred_id, top_pred_name, top_pred_score = decoded[0]
        
        for i in range(3):
            pred_id, pred_name, pred_score = decoded[i]
            if any(keyword in pred_name.lower() for keyword in tree_keywords):
                is_tree = True
                confidence = float(pred_score)
                break
        
        return is_tree, round(confidence, 2)
        
    except Exception as e:
        print(f"Error in tree detection: {e}")
        import traceback
        traceback.print_exc()
        return False, 0.0
