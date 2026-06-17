FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libatomic1 nodejs npm && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN prisma generate

EXPOSE 8000

CMD prisma migrate deploy && uvicorn src.main:app --host 0.0.0.0 --port 8000