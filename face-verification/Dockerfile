# Use a heavier base image that has pre-built packages
FROM python:3.11-bookworm

# Install dlib from system (no compilation needed)
RUN apt-get update && apt-get install -y \
    python3-dlib \
    cmake \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .

# Remove dlib from requirements.txt before running this, 
# or use a separate requirements file that doesn't list dlib.
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]