#!/bin/bash

# Hugo Portfolio MCP Server Docker Startup Script

echo "🐳 Starting Hugo Portfolio MCP Server with Docker..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please copy env.example to .env and configure it."
    echo "   cp env.example .env"
    echo "   # Then edit .env with your portfolio API URL"
    exit 1
fi

# Load environment variables from .env
export $(cat .env | grep -v '^#' | xargs)

# Set defaults if not provided
MCP_SERVER_HOST=${MCP_SERVER_HOST:-192.168.0.3}
MCP_SERVER_PORT=${MCP_SERVER_PORT:-8017}
PORTFOLIO_API_URL=${PORTFOLIO_API_URL:-http://localhost:3018/api}

echo "📋 Configuration:"
echo "  MCP Server: ${MCP_SERVER_HOST}:${MCP_SERVER_PORT}"
echo "  Portfolio API: ${PORTFOLIO_API_URL}"
echo ""

# Build and start the container
echo "🔨 Building Docker image..."
docker compose build

echo "🚀 Starting MCP server container..."
docker compose up -d

echo "✅ MCP server started!"
echo "🌐 Server running on: http://${MCP_SERVER_HOST}:${MCP_SERVER_PORT}"
echo "🏥 Health check: http://${MCP_SERVER_HOST}:${MCP_SERVER_PORT}/health"
echo "🔗 MCP endpoint: http://${MCP_SERVER_HOST}:${MCP_SERVER_PORT}/mcp"
echo ""
echo "📋 Useful commands:"
echo "  docker compose logs -f          # View logs"
echo "  docker compose down             # Stop server"
echo "  docker compose restart          # Restart server"
