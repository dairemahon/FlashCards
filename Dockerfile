# Starts official python slim image
From python:3.12-slim

# Stops python from writing pyc cache files
ENV PYTHONDONTWRITEBYTECODE=1 
# Forces python to print logs immediately instead of buffering them
ENV PYTHONUNBUFFERED=1

# The proceeding commands are run in the /app directory
WORKDIR /app

# Postgres driver is partly writtne in C and need to be compiled. Libpq-dev provides 
# the necessary libraries and headers to compile it. gcc is the compiler.
# rm ... deletes the apt cache to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/* 

# Copies requirements, and install everything
COPY requirements.txt .
# Stops pip storing the downloaded packages in cache to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copies rest of the code into the image
COPY . .

# Collects static files into the STATIC_ROOT directory, which is then served by Nginx
# --noinput means don't prompt for confirmation
RUN python manage.py collectstatic --noinput

# Documents this container listens on port 8000
EXPOSE 8000

# Runs when the container starts
# Gunicorn is a production WSGI server that will serve the Django application
# mysite.wsgi:application tells Gunincorn where to find the WSGI application object
# --bind 0.0.0:8000 tells Gunicorn to listen on all interfaces on port 8000
# --workers 3 tells Gunicorn to use 3 worker processes to handle requests
CMD ["gunicorn", "mysite.wsgi:application", "--bind", "0.0.0:8000", "--workers", "3"]