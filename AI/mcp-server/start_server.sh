#!/bin/bash

# Hugo Portfolio MCP Server Startup Script

echo "🚀 Starting Hugo Portfolio MCP Server..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Creating..."
    uv venv
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source .venv/bin/activate

# Check if requirements are installed
if [ ! -f ".venv/pyvenv.cfg" ]; then
    echo "📥 Installing requirements..."
    uv pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please copy env.example to .env and configure it."
    echo "   cp env.example .env"
    echo "   # Then edit .env with your portfolio API URL"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if PORTFOLIO_API_URL is set
if [ -z "$PORTFOLIO_API_URL" ]; then
    echo "❌ PORTFOLIO_API_URL not set in .env file"
    echo "   Please set PORTFOLIO_API_URL to your portfolio API endpoint"
    echo "   Example: PORTFOLIO_API_URL=http://localhost:3018/api"
    exit 1
fi

echo "✅ Environment configured"
echo "🌐 Starting server on ${MCP_SERVER_HOST:-127.0.0.1}:${MCP_SERVER_PORT:-8001}"

# Start the server
python server.py
