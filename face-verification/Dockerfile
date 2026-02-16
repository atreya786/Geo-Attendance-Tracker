# 1. Use a community image that ALREADY has dlib + face_recognition installed.
# This skips the compilation step entirely.
FROM animcogn/face_recognition:cpu

# 2. Install only the web server libraries (fast & light)
# We do NOT use requirements.txt here to avoid accidentally triggering a rebuild.
RUN pip install --no-cache-dir fastapi uvicorn python-multipart opencv-python-headless

# 3. Set work directory
WORKDIR /app

# 4. Copy your code
COPY . .

# 5. Run the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]