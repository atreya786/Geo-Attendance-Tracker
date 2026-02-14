# Use a lightweight Python version
FROM python:3.11-slim

# 1. Install system tools required to build dlib (C++ compilers)
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    make \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Set working directory
WORKDIR /app

# 3. Copy requirements and install them
COPY requirements.txt .
# We use --no-cache-dir to keep the image small
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of your app code
COPY . .

# 5. Command to run the app
# Render provides the PORT env var, but we default to 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]