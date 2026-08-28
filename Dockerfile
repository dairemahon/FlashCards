# Starts official python slim image
FROM python:3.12-slim

# Stops python from writing pyc cache files
ENV PYTHONDONTWRITEBYTECODE=1
# Forces python to print logs immediately instead of buffering them
ENV PYTHONUNBUFFERED=1

# The proceeding commands are run in the /app directory
WORKDIR /app

# Postgres driver is partly written in C and needs to be compiled.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "mysite.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]