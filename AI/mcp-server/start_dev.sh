#!/bin/bash

# Start MCP Server in Development Mode
echo "Starting MCP Server in Development Mode..."

# Copy dev environment file
cp env.dev .env

# Start the service
docker compose up --build -d

echo "MCP Server started in development mode!"
echo "Port: 8017"
echo "Network: betterportfolio_portfolio-dev-network"
echo "API URL: http://portfolio-dev:3000/api"


