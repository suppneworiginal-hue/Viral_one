"""
Script to start the FastAPI server programmatically.
This is needed for Electron integration.
"""
import uvicorn
import sys

if __name__ == "__main__":
    print("Starting FastAPI server...", flush=True)
    print(f"Uvicorn running on http://127.0.0.1:8000", flush=True)
    sys.stdout.flush()
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,  # Disable reload in Electron to avoid issues
        log_level="info"
    )

