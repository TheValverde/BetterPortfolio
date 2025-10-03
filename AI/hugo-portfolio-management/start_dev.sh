#!/bin/bash

# Start Hugo Portfolio Management Server in Development Mode
echo "Starting Hugo Portfolio Management Server in Development Mode..."

# Copy dev environment file
cp env.dev .env

# Start the service
docker compose up --build -d

echo "Hugo Portfolio Management Server started in development mode!"
echo "Port: 8019"
echo "Network: betterportfolio_portfolio-dev-network"
echo "API URL: http://portfolio-dev:3000/api"


