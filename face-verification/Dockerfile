# 1. Use Python 3.9 (Better support for pre-built dlib wheels)
FROM python:3.9-slim

# 2. Install CMake and compilers (Required just in case, but lightweight)
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    make \
    libopenblas-dev \
    libx11-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Work Directory
WORKDIR /app

# 4. Copy requirements
COPY requirements.txt .

# 5. Install Python dependencies
# We assume requirements.txt contains 'dlib' (standard name)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copy app code
COPY . .

# 7. Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]