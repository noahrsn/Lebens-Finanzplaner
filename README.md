# Lebens-Finanzplaner

A personal finance planning web app built with React + Flask + Azure Cosmos DB.

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Getting Started

1. Clone the repo
2. Copy `example.env` to `.env` and fill in the Cosmos DB credentials
3. Run:

```bash
docker compose up --build
```

Open `http://localhost:5173` in your browser.

> After the first build, use `docker compose up` to start faster.

## Without Docker

```bash
# Terminal 1 — backend
cd backend && pip install -r ../requirements.txt && python app.py

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```
