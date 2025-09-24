# Hugo Portfolio MCP Server

This MCP (Model Context Protocol) server provides read-only access to Hugo's portfolio via the existing API, enabling AI agents to query project information, technologies, and statistics.

## Features

- **API-based access** to Hugo's portfolio via existing endpoints
- **Comprehensive query tools** for projects, technologies, and categories
- **Search functionality** across project titles, descriptions, and technologies
- **Statistics and analytics** about Hugo's work and expertise
- **FastMCP framework** for reliable, production-ready MCP server
- **No database dependencies** - uses your existing portfolio API

## Setup

### Prerequisites

- Python 3.8+
- `uv` package manager
- Hugo's portfolio API running (typically on http://localhost:3017/api)
- Environment variables configured

### Installation

1. **Create virtual environment and install dependencies:**
   ```bash
   cd AI/mcp-server
   uv venv
   source .venv/bin/activate
   uv pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your portfolio API URL
   ```

3. **Set up environment variables:**
   ```bash
   # Portfolio API Configuration
   PORTFOLIO_API_URL=http://localhost:3017/api
   
   # Server Configuration
   MCP_SERVER_NAME=Hugo Portfolio API Server
   MCP_SERVER_PORT=8001
   MCP_SERVER_HOST=127.0.0.1
   ```

## Usage

### Starting the Server

```bash
# Activate virtual environment
source .venv/bin/activate

# Start the MCP server
python server.py
```

The server will start on `http://127.0.0.1:8001` by default.

### Testing the Server

```bash
# In another terminal, run the test client
python test_client.py
```

### Available Tools

The MCP server provides the following tools for AI agents:

#### Project Queries
- `get_all_projects()` - Retrieve all projects
- `get_project_by_id(project_id)` - Get specific project by ID
- `get_projects_by_category(category)` - Filter by category (ai, real-time-graphics, web, mobile, other)
- `get_projects_by_technology(technology)` - Find projects using specific technology
- `get_featured_projects()` - Get highlighted projects
- `search_projects(search_term)` - Search across titles, descriptions, and technologies

#### Analytics
- `get_all_technologies()` - List all technologies used
- `get_all_categories()` - List all project categories
- `get_project_statistics()` - Get portfolio metrics and statistics
- `get_hugo_expertise_summary()` - Comprehensive expertise overview

### Example Usage

```python
import asyncio
from fastmcp import Client

async def query_portfolio():
    client = Client("http://127.0.0.1:8001/mcp")
    
    async with client:
        # Get Hugo's expertise summary
        expertise = await client.call_tool("get_hugo_expertise_summary", {})
        print(expertise)
        
        # Search for AI projects
        ai_projects = await client.call_tool("search_projects", {"search_term": "AI"})
        print(ai_projects)
        
        # Get all technologies
        technologies = await client.call_tool("get_all_technologies", {})
        print(technologies)

asyncio.run(query_portfolio())
```

## Integration with AI Agents

This MCP server is designed to be used with AI agents that need access to Hugo's portfolio data. The server provides:

1. **Structured data access** - All project information in a consistent format
2. **Flexible querying** - Multiple ways to find relevant projects
3. **Rich metadata** - Technologies, categories, status, and more
4. **Analytics support** - Statistics and summaries for comprehensive understanding

## Database Schema

The server expects a PostgreSQL database with a `projects` table containing:

- `id` - Unique project identifier
- `title` - Project name
- `description` - Short description
- `long_description` - Detailed description
- `start_date`, `end_date` - Project timeline
- `status` - COMPLETED, ONGOING, or PLANNED
- `technologies` - Array of technology strings
- `category` - AI, REAL_TIME_GRAPHICS, WEB, MOBILE, or OTHER
- `client` - Client name (optional)
- `role` - Hugo's role in the project
- `responsibilities` - Array of responsibility strings
- `impact` - Project impact description
- `images` - Array of image URLs
- `preview_image` - Main preview image URL
- `video_url`, `github_url`, `live_url` - Project links
- `featured` - Boolean for highlighted projects
- `order` - Display order
- `created_at`, `updated_at` - Timestamps

## Security

- **Read-only access** - Server only provides query capabilities
- **No write operations** - Cannot modify database data
- **Environment-based configuration** - Sensitive data in environment variables
- **Local network binding** - Server binds to localhost by default

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running and accessible
- Check database credentials and permissions

### Server Not Starting
- Verify all dependencies are installed
- Check if port 8001 is available
- Review error messages in console output

### Tool Execution Errors
- Ensure database connection is stable
- Check that required tables exist
- Verify data format matches expected schema

## Development

### Adding New Tools

1. Add the tool function to `server.py` with `@mcp.tool` decorator
2. Implement the corresponding database method in `database.py`
3. Update the server instructions to document the new tool
4. Add tests to `test_client.py`

### Testing

```bash
# Run the test client
python test_client.py

# Test specific tools
python -c "
import asyncio
from fastmcp import Client
async def test():
    client = Client('http://127.0.0.1:8001/mcp')
    async with client:
        result = await client.call_tool('get_project_statistics', {})
        print(result)
asyncio.run(test())
"
```

## License

This MCP server is part of Hugo's portfolio project and follows the same licensing terms.
