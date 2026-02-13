FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p /cloudsql

RUN adduser --system --no-create-home appuser \
    && chown -R appuser /app /cloudsql

EXPOSE 5000

USER appuser

CMD ["python", "app.py"]