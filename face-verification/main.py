import setuptools
import pkg_resources

from fastapi import FastAPI, UploadFile, File, HTTPException
import face_recognition
import numpy as np
import io

app = FastAPI()

def get_face_encoding(image_bytes):
    # Load image from bytes
    image = face_recognition.load_image_file(io.BytesIO(image_bytes))
    
    # Find all faces in the image
    encodings = face_recognition.face_encodings(image)
    
    if len(encodings) == 0:
        return None
        
    # Return the first face found (assuming selfie has 1 face)
    return encodings[0]

@app.post("/verify")
async def verify_faces(
    source_image: UploadFile = File(...), 
    target_image: UploadFile = File(...)
):
    # 1. Read bytes from uploaded files
    source_bytes = await source_image.read()
    target_bytes = await target_image.read()
    
    # 2. Get Encodings (The AI "Fingerprint" of the face)
    source_encoding = get_face_encoding(source_bytes)
    target_encoding = get_face_encoding(target_bytes)
    
    # 3. Validation
    if source_encoding is None:
        return {"match": False, "error": "No face found in profile picture (source)."}
    if target_encoding is None:
        return {"match": False, "error": "No face found in live selfie (target)."}
    
    # 4. Compare Faces
    # tolerance=0.5 is stricter (better for security) than the default 0.6
    results = face_recognition.compare_faces([source_encoding], target_encoding, tolerance=0.5)
    
    # 5. Calculate Distance (Optional: How similar are they?)
    face_distance = face_recognition.face_distance([source_encoding], target_encoding)
    
    return {
        "match": bool(results[0]),
        "similarity_score": float(1 - face_distance[0]) # approx % match
    }

@app.get("/")
def health_check():
    return {"status": "Face Service is running"}