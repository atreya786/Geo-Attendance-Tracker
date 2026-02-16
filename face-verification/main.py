from fastapi import FastAPI, UploadFile, File, HTTPException
import face_recognition
import numpy as np
import cv2
import io

app = FastAPI()

def get_face_encoding(image_bytes):
    try:
        # 1. Convert bytes to a numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        # 2. Decode the image using OpenCV
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return None

        # 3. CRITICAL OPTIMIZATION: Resize the image
        # Phone cameras take 4000x3000px images. 
        # We resize to 0.25 (1/4th) scale to save RAM.
        small_image = cv2.resize(image, (0, 0), fx=0.25, fy=0.25)

        # 4. Convert BGR (OpenCV format) to RGB (face_recognition format)
        rgb_small_image = cv2.cvtColor(small_image, cv2.COLOR_BGR2RGB)

        # 5. Detect faces using the 'hog' model (faster/lighter than cnn)
        # We pass the smaller image here
        face_locations = face_recognition.face_locations(rgb_small_image, model="hog")
        
        if not face_locations:
            return None
            
        # 6. Get encodings for the detected face
        encodings = face_recognition.face_encodings(rgb_small_image, face_locations)
        
        if len(encodings) == 0:
            return None
            
        return encodings[0]

    except Exception as e:
        print(f"Error processing image: {e}")
        return None

@app.post("/verify")
async def verify_faces(
    source_image: UploadFile = File(...), 
    target_image: UploadFile = File(...)
):
    # Read bytes
    source_bytes = await source_image.read()
    target_bytes = await target_image.read()
    
    # Get Encodings with the new optimized function
    source_encoding = get_face_encoding(source_bytes)
    target_encoding = get_face_encoding(target_bytes)
    
    # Validation
    if source_encoding is None:
        return {"match": False, "error": "No face found in profile picture (source)."}
    if target_encoding is None:
        return {"match": False, "error": "No face found in live selfie (target)."}
    
    # Compare Faces
    # Note: Tolerance 0.5 is strict. If users fail often, try 0.6
    results = face_recognition.compare_faces([source_encoding], target_encoding, tolerance=0.5)
    
    # Calculate Similarity
    face_distance = face_recognition.face_distance([source_encoding], target_encoding)
    
    return {
        "match": bool(results[0]),
        "similarity_score": float(1 - face_distance[0])
    }

@app.get("/")
def health_check():
    return {"status": "Face Service is running"}