#!/bin/bash

# Start the frontend server using Python's built-in HTTP server
# This script checks for Python availability and starts the server on port 3000

echo "Language Tandem App - Frontend Server"
echo "===================================="

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    echo "Starting server with Python 3..."
    python3 -m http.server 3000
# Check if Python is available and is version 3
elif command -v python &>/dev/null && python --version 2>&1 | grep -q "Python 3"; then
    echo "Starting server with Python..."
    python -m http.server 3000
# Fall back to Python 2 if that's all that's available
elif command -v python &>/dev/null; then
    echo "Starting server with Python (version 2)..."
    python -m SimpleHTTPServer 3000
else
    echo "Error: Python is not installed or not in your PATH."
    echo "Please install Python or use another HTTP server to serve the frontend files."
    echo ""
    echo "Alternative options:"
    echo "1. Open index.html directly in your browser"
    echo "2. Use Node.js http-server: npx http-server -p 3000"
    exit 1
fi 