# MCP Server Environment Switching

This document explains how to easily switch the MCP servers between development and production environments.

## Overview

The MCP servers (`mcp-server` and `hugo-portfolio-management`) can now be easily configured to connect to either:
- **Development Environment**: Connects to the dev portfolio service and database
- **Production Environment**: Connects to the production portfolio service and database

## Quick Start

### For Development Environment

```bash
# MCP Server (Port 8017)
cd AI/mcp-server
./start_dev.sh

# Hugo Portfolio Management Server (Port 8019)
cd AI/hugo-portfolio-management
./start_dev.sh
```

### For Production Environment

```bash
# MCP Server (Port 8017)
cd AI/mcp-server
./start_prod.sh

# Hugo Portfolio Management Server (Port 8019)
cd AI/hugo-portfolio-management
./start_prod.sh
```

## Configuration Details

### Development Configuration
- **Network**: `betterportfolio_portfolio-dev-network`
- **Portfolio Service**: `portfolio-dev:3000`
- **Database**: Development database (port 5438)
- **MCP Server Port**: 8017
- **Management Server Port**: 8019

### Production Configuration
- **Network**: `betterportfolio_portfolio-network`
- **Portfolio Service**: `portfolio:3000`
- **Database**: Production database (port 5437)
- **MCP Server Port**: 8017
- **Management Server Port**: 8019

## Environment Files

Each server has environment-specific configuration files:

- `env.dev` - Development environment settings
- `env.prod` - Production environment settings
- `.env` - Active configuration (copied from env.dev or env.prod)

## Manual Configuration

If you need to manually configure the environment:

1. Copy the appropriate environment file:
   ```bash
   cp env.dev .env    # For development
   cp env.prod .env   # For production
   ```

2. Start the service:
   ```bash
   docker compose up --build -d
   ```

## Network Requirements

Make sure the appropriate portfolio environment is running:

- **For Development**: Run `docker compose -f docker-compose.dev.yml up -d`
- **For Production**: Run `docker compose -f docker-compose.yml up -d`

## Troubleshooting

### Check which environment is active:
```bash
cat .env
```

### Check running services:
```bash
docker ps | grep mcp
```

### Check network connectivity:
```bash
docker network ls | grep portfolio
```

### View logs:
```bash
docker compose logs -f
```

## Ports

- **MCP Server**: 8017 (both dev and prod)
- **Hugo Portfolio Management**: 8019 (both dev and prod)
- **Development Portfolio**: 3018
- **Production Portfolio**: 3017
- **Development Database**: 5438
- **Production Database**: 5437


