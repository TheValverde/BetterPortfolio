#!/bin/bash

# Start Hugo Portfolio Management Server in Production Mode
echo "Starting Hugo Portfolio Management Server in Production Mode..."

# Copy prod environment file
cp env.prod .env

# Start the service
docker compose up --build -d

echo "Hugo Portfolio Management Server started in production mode!"
echo "Port: 8019"
echo "Network: betterportfolio_portfolio-network"
echo "API URL: http://portfolio:3000/api"


