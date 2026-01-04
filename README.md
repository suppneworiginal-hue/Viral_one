# Viral Story Generator

AI-powered storytelling application built with Electron, React, and FastAPI.

## Project Structure

```
.
├── backend/          # FastAPI Python backend
├── frontend/         # React + Vite frontend
├── electron/         # Electron main process
└── package.json      # Root package with dev scripts
```

## Setup

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install all sub-project dependencies
npm run install:all
```

### 2. Python Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3. Development

Run the development environment (starts frontend Vite server and Electron):

```bash
npm run dev
```

This will:
- Start the Vite dev server on `http://localhost:5173`
- Build and launch Electron
- Electron will automatically spawn the Python backend

## Manual Testing

### Backend Only
```bash
cd backend
python start.py
```

### Frontend Only
```bash
cd frontend
npm run dev
```

## Architecture

- **Backend**: FastAPI server on port 8000
- **Frontend**: React + Vite dev server on port 5173
- **Electron**: Orchestrates both, spawns backend, loads frontend

