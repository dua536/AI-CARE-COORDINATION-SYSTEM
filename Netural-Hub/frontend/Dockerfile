FROM node:18-slim

# Python install karo
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Backend copy aur install
COPY backend/ ./backend/
RUN pip3 install -r backend/requirements.txt --break-system-packages

# Frontend copy aur install
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Frontend ki build backend mein daalo
RUN cp -r frontend/dist ./backend/static

EXPOSE 7860

# Backend chalaao
CMD ["python3", "backend/src/main.py"]