#!/bin/bash

# Start MCP Server in Production Mode
echo "Starting MCP Server in Production Mode..."

# Copy prod environment file
cp env.prod .env

# Start the service
docker compose up --build -d

echo "MCP Server started in production mode!"
echo "Port: 8017"
echo "Network: betterportfolio_portfolio-network"
echo "API URL: http://portfolio:3000/api"


