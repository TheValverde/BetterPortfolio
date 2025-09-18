# BetterPortfolio API Documentation

## Overview
The BetterPortfolio API provides comprehensive project management capabilities with full CRUD operations, filtering, and search functionality. All endpoints return JSON data and support various query parameters for filtering and pagination.

## Base URL
```
http://localhost:3017/api
```

## Authentication
Currently, the API is open (no authentication required). In production, you may want to add API key authentication or JWT tokens.

## Endpoints

### 1. Get All Projects
**GET** `/api/projects`

Returns a paginated list of all projects with optional filtering.

#### Query Parameters:
- `featured` (boolean): Filter by featured projects only
- `category` (string): Filter by project category (`ai`, `real-time-graphics`, `web`, `mobile`, `other`)
- `status` (string): Filter by project status (`completed`, `ongoing`, `planned`)
- `technology` (string): Filter by technology (partial match)
- `year` (number): Filter by project start year
- `search` (string): Search in title, description, and technologies
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of projects per page (default: 10)

#### Example Requests:
```bash
# Get all projects
curl "http://localhost:3017/api/projects"

# Get featured projects only
curl "http://localhost:3017/api/projects?featured=true"

# Get AI projects only
curl "http://localhost:3017/api/projects?category=ai"

# Search for projects containing "MCP"
curl "http://localhost:3017/api/projects?search=MCP"

# Get projects from 2025
curl "http://localhost:3017/api/projects?year=2025"

# Get completed projects
curl "http://localhost:3017/api/projects?status=completed"
```

#### Response:
```json
{
  "projects": [
    {
      "id": "cmfoqd1s800008x8yw9sr0to2",
      "title": "Ubuntu Home AI",
      "description": "AI Agent for personal use with coding capabilities...",
      "longDescription": "Created an AI Agent for personal use...",
      "startDate": "2025-05-01",
      "endDate": null,
      "status": "ongoing",
      "technologies": ["Python", "MCP", "LangChain", "Docker"],
      "category": "ai",
      "client": null,
      "role": "AI Engineer",
      "responsibilities": ["Developed AI agent...", "Created MCP server..."],
      "impact": "Automated server management...",
      "images": [],
      "videoUrl": null,
      "githubUrl": null,
      "liveUrl": null,
      "featured": true,
      "order": 1,
      "createdAt": "2025-09-18T01:26:52.232Z",
      "updatedAt": "2025-09-18T01:26:52.232Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 2. Create New Project
**POST** `/api/projects`

Creates a new project in the database.

#### Request Body:
```json
{
  "title": "Project Title",
  "description": "Short description",
  "longDescription": "Detailed description (optional)",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "status": "ongoing",
  "technologies": ["Next.js", "TypeScript", "PostgreSQL"],
  "category": "web",
  "client": "Client Name (optional)",
  "role": "Full Stack Developer",
  "responsibilities": ["API Development", "Database Design"],
  "impact": "Project impact description (optional)",
  "images": ["image1.jpg", "image2.jpg"],
  "videoUrl": "https://youtube.com/watch?v=...",
  "githubUrl": "https://github.com/username/repo",
  "liveUrl": "https://project.com",
  "featured": false,
  "order": 5
}
```

#### Example Request:
```bash
curl -X POST http://localhost:3017/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Project",
    "description": "A cool new project",
    "startDate": "2025-01-01",
    "status": "ongoing",
    "technologies": ["Next.js", "TypeScript"],
    "category": "web",
    "role": "Developer",
    "responsibilities": ["Frontend Development"],
    "featured": false,
    "order": 6
  }'
```

#### Response:
Returns the created project with generated ID and timestamps.

### 3. Get Project by ID
**GET** `/api/projects/[id]`

Returns a specific project by its ID.

#### Example Request:
```bash
curl "http://localhost:3017/api/projects/cmfoqd1s800008x8yw9sr0to2"
```

#### Response:
Returns a single project object (same structure as in the projects array).

### 4. Update Project
**PUT** `/api/projects/[id]`

Updates an existing project. You can provide partial data - only the fields you want to update.

#### Example Request:
```bash
curl -X PUT http://localhost:3017/api/projects/cmfoqd1s800008x8yw9sr0to2 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "endDate": "2025-12-31"
  }'
```

#### Response:
Returns the updated project object.

### 5. Delete Project
**DELETE** `/api/projects/[id]`

Deletes a project from the database.

#### Example Request:
```bash
curl -X DELETE http://localhost:3017/api/projects/cmfoqd1s800008x8yw9sr0to2
```

#### Response:
```json
{
  "message": "Project deleted successfully"
}
```

## Project Schema

### Required Fields:
- `title` (string): Project title
- `description` (string): Short project description
- `startDate` (string): Start date in YYYY-MM-DD format
- `status` (string): One of `completed`, `ongoing`, `planned`
- `technologies` (array): Array of technology strings
- `category` (string): One of `ai`, `real-time-graphics`, `web`, `mobile`, `other`
- `role` (string): Your role in the project
- `responsibilities` (array): Array of responsibility strings

### Optional Fields:
- `longDescription` (string): Detailed project description
- `endDate` (string): End date in YYYY-MM-DD format
- `client` (string): Client name
- `impact` (string): Project impact description
- `images` (array): Array of image filenames/URLs
- `videoUrl` (string): Video URL (YouTube, Vimeo, etc.)
- `githubUrl` (string): GitHub repository URL
- `liveUrl` (string): Live project URL
- `featured` (boolean): Whether project is featured (default: false)
- `order` (number): Display order (default: 0)

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "error": "Error description"
}
```

Common status codes:
- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Usage Examples

### 1. Get all AI projects
```bash
curl "http://localhost:3017/api/projects?category=ai"
```

### 2. Search for projects with "Docker"
```bash
curl "http://localhost:3017/api/projects?technology=Docker"
```

### 3. Get completed projects from 2025
```bash
curl "http://localhost:3017/api/projects?status=completed&year=2025"
```

### 4. Create a new project
```bash
curl -X POST http://localhost:3017/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New AI Project",
    "description": "An AI-powered application",
    "startDate": "2025-01-01",
    "status": "ongoing",
    "technologies": ["Python", "LangChain", "FastAPI"],
    "category": "ai",
    "role": "AI Engineer",
    "responsibilities": ["Model Development", "API Design"],
    "featured": true,
    "order": 1
  }'
```

### 5. Update project status
```bash
curl -X PUT http://localhost:3017/api/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "endDate": "2025-12-31"}'
```

## Database Integration

The API is built with:
- **PostgreSQL**: Real database (not JSON files!)
- **Prisma ORM**: Type-safe database operations
- **Next.js API Routes**: Serverless API endpoints
- **TypeScript**: Full type safety

## Future Enhancements

Potential additions to the API:
- Authentication (API keys, JWT tokens)
- Rate limiting
- Image upload endpoints
- Bulk operations
- Project analytics
- Export functionality (PDF, CSV)
- Webhook support for external integrations
