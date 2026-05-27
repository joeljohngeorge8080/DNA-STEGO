"""
Vercel Serverless Function Wrapper for DNA-Stego FastAPI
This file allows the FastAPI app to run on Vercel's serverless platform.
"""

import sys
import os
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the FastAPI app
from app.main import app

# Vercel expects a WSGI app, but FastAPI is ASGI
# We need to use the app as-is since Vercel will handle it
# The app variable is what Vercel will use
