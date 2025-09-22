"""
Hugo Portfolio Management MCP Server
Provides full CRUD access to Hugo's portfolio via the existing API for AI agents.
This server allows complete management of portfolio data including creating, updating, and deleting projects.
"""

import os
from typing import List, Dict, Any, Optional
from fastmcp import FastMCP
from api_client import get_api_client, close_api_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the MCP server
mcp = FastMCP(
    name=os.getenv('MCP_SERVER_NAME', 'Hugo Portfolio Management Server'),
    instructions="""
    This MCP server provides full CRUD (Create, Read, Update, Delete) access to Hugo's portfolio.
    It allows AI agents to completely manage portfolio data including projects, technologies, and metadata.
    
    READ OPERATIONS:
    - get_all_projects: Retrieve all projects (supports API filtering)
    - get_project_by_id: Get a specific project by ID
    - get_projects_by_category: Filter projects by category (ai, real-time-graphics, web, mobile, other)
    - get_projects_by_technology: Find projects using specific technologies
    - get_featured_projects: Get featured/highlighted projects
    - search_projects: Search projects by title, description, or technologies
    - get_projects_by_status: Filter by status (completed, ongoing, planned)
    - get_projects_by_year: Filter by project year
    - get_recent_projects: Get most recent projects by end date (ongoing projects first)
    - get_all_technologies: List all technologies used across projects
    - get_all_categories: List all project categories
    - get_project_statistics: Get portfolio statistics and metrics
    
    WRITE OPERATIONS:
    - create_project: Create a new project
    - update_project: Update an existing project
    - delete_project: Delete a project
    - update_project_role: Update project role field
    - update_project_status: Update project status
    - update_project_technologies: Update project technologies list
    - update_project_description: Update project description
    - update_project_impact: Update project impact statement
    - set_project_featured: Set project featured status
    - bulk_update_roles: Update roles for multiple projects
    """
)


@mcp.tool()()
async def get_all_projects(featured: Optional[bool] = None, category: Optional[str] = None, 
                          status: Optional[str] = None, technology: Optional[str] = None,
                          year: Optional[int] = None, search: Optional[str] = None,
                          page: int = 1, limit: int = 10) -> Dict[str, Any]:
    """
    Retrieve all projects from Hugo's portfolio with optional filtering.
    
    Args:
        featured: Filter by featured projects only
        category: Filter by project category (ai, real-time-graphics, web, mobile, other)
        status: Filter by project status (completed, ongoing, planned)
        technology: Filter by technology (partial match)
        year: Filter by project start year
        search: Search in title, description, and technologies
        page: Page number for pagination (default: 1)
        limit: Number of projects per page (default: 10)
    
    Returns:
        Dictionary containing projects list and pagination info
    """
    try:
        client = await get_api_client()
        params = {}
        if featured is not None:
            params["featured"] = str(featured).lower()
        if category:
            params["category"] = category
        if status:
            params["status"] = status
        if technology:
            params["technology"] = technology
        if year:
            params["year"] = year
        if search:
            params["search"] = search
        params["page"] = page
        params["limit"] = limit
        
        result = await client.get_all_projects(**params)
        return result
    except Exception as e:
        return {"error": f"Failed to retrieve projects: {str(e)}"}


@mcp.tool()()
async def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific project by its unique ID.
    
    Args:
        project_id: The unique identifier of the project
        
    Returns:
        Project details or None if not found
    """
    try:
        client = await get_api_client()
        project = await client.get_project_by_id(project_id)
        return project
    except Exception as e:
        return {"error": f"Failed to retrieve project: {str(e)}"}


@mcp.tool()
async def get_projects_by_category(category: str) -> List[Dict[str, Any]]:
    """
    Get projects filtered by category.
    
    Args:
        category: Project category (ai, real-time-graphics, web, mobile, other)
        
    Returns:
        List of projects in the specified category
    """
    try:
        client = await get_api_client()
        projects = await client.get_projects_by_category(category)
        return projects
    except Exception as e:
        return [{"error": f"Failed to retrieve projects by category: {str(e)}"}]


@mcp.tool()
async def get_projects_by_technology(technology: str) -> List[Dict[str, Any]]:
    """
    Find projects that use a specific technology.
    
    Args:
        technology: Technology name to search for (e.g., "Python", "React", "Unreal Engine")
        
    Returns:
        List of projects using the specified technology
    """
    try:
        client = await get_api_client()
        projects = await client.get_projects_by_technology(technology)
        return projects
    except Exception as e:
        return [{"error": f"Failed to retrieve projects by technology: {str(e)}"}]


@mcp.tool()
async def get_featured_projects() -> List[Dict[str, Any]]:
    """
    Get featured/highlighted projects from Hugo's portfolio.
    
    Returns:
        List of featured projects that Hugo wants to showcase
    """
    try:
        client = await get_api_client()
        projects = await client.get_featured_projects()
        return projects
    except Exception as e:
        return [{"error": f"Failed to retrieve featured projects: {str(e)}"}]


@mcp.tool()
async def search_projects(search_term: str) -> List[Dict[str, Any]]:
    """
    Search projects by title, description, or technologies.
    
    Args:
        search_term: Term to search for in project titles, descriptions, or technologies
        
    Returns:
        List of projects matching the search term
    """
    try:
        client = await get_api_client()
        projects = await client.search_projects(search_term)
        return projects
    except Exception as e:
        return [{"error": f"Failed to search projects: {str(e)}"}]


@mcp.tool()
async def get_projects_by_status(status: str) -> List[Dict[str, Any]]:
    """
    Get projects filtered by status.
    
    Args:
        status: Project status (completed, ongoing, planned)
        
    Returns:
        List of projects with the specified status
    """
    try:
        client = await get_api_client()
        projects = await client.get_projects_by_status(status)
        return projects
    except Exception as e:
        return [{"error": f"Failed to retrieve projects by status: {str(e)}"}]


@mcp.tool()
async def get_projects_by_year(year: int) -> List[Dict[str, Any]]:
    """
    Get projects filtered by year.
    
    Args:
        year: Project start year
        
    Returns:
        List of projects started in the specified year
    """
    try:
        client = await get_api_client()
        projects = await client.get_projects_by_year(year)
        return projects
    except Exception as e:
        return [{"error": f"Failed to retrieve projects by year: {str(e)}"}]


@mcp.tool()
async def get_all_technologies() -> List[str]:
    """
    Get all unique technologies used across Hugo's projects.
    
    Returns:
        List of all technologies Hugo has worked with
    """
    try:
        client = await get_api_client()
        technologies = await client.get_all_technologies()
        return technologies
    except Exception as e:
        return [f"Error: {str(e)}"]


@mcp.tool()
async def get_all_categories() -> List[str]:
    """
    Get all project categories in Hugo's portfolio.
    
    Returns:
        List of all categories (ai, real-time-graphics, web, mobile, other)
    """
    try:
        client = await get_api_client()
        categories = await client.get_all_categories()
        return categories
    except Exception as e:
        return [f"Error: {str(e)}"]


@mcp.tool()
async def get_project_statistics() -> Dict[str, Any]:
    """
    Get comprehensive statistics about Hugo's portfolio.
    
    Returns:
        Dictionary containing portfolio metrics including:
        - Total projects count
        - Featured projects count
        - Projects by status (completed, ongoing, planned)
        - Top technologies used
        - Projects by category
    """
    try:
        client = await get_api_client()
        stats = await client.get_project_statistics()
        return stats
    except Exception as e:
        return {"error": f"Failed to retrieve statistics: {str(e)}"}


@mcp.tool()
async def get_recent_projects(limit: int = 5) -> Dict[str, Any]:
    """
    Get the most recent projects based on end date, with ongoing projects being the most recent.
    
    Args:
        limit: Number of recent projects to return (default: 5)
        
    Returns:
        Dictionary containing recent projects list and metadata
    """
    try:
        client = await get_api_client()
        result = await client.get_recent_projects(limit)
        return result
    except Exception as e:
        return {"error": f"Failed to retrieve recent projects: {str(e)}"}


@mcp.tool()
async def get_hugo_expertise_summary() -> Dict[str, Any]:
    """
    Get a comprehensive summary of Hugo's expertise and experience.
    
    Returns:
        Dictionary containing Hugo's professional summary including:
        - Total projects and experience
        - Key technologies and skills
        - Project categories and specializations
        - Career highlights and achievements
    """
    try:
        client = await get_api_client()
        
        # Get basic statistics
        stats = await client.get_project_statistics()
        
        # Get all technologies
        technologies = await client.get_all_technologies()
        
        # Get featured projects for highlights
        featured_projects = await client.get_featured_projects()
        
        # Get projects by category for specialization analysis
        categories = await client.get_all_categories()
        category_breakdown = {}
        for category in categories:
            category_projects = await client.get_projects_by_category(category)
            category_breakdown[category] = len(category_projects)
        
        return {
            "total_projects": stats.get("total_projects", 0),
            "featured_projects": stats.get("featured_projects", 0),
            "technologies_count": len(technologies),
            "top_technologies": stats.get("top_technologies", [])[:5],  # Top 5
            "categories": category_breakdown,
            "featured_highlights": [
                {
                    "title": project.get("title", "Unknown"),
                    "category": project.get("category", "Unknown"),
                    "technologies": project.get("technologies", [])[:3],  # Top 3 technologies
                    "description": (project.get("description", "")[:100] + "...") if len(project.get("description", "")) > 100 else project.get("description", "")
                }
                for project in featured_projects[:3]  # Top 3 featured projects
            ],
            "experience_summary": f"Hugo has {stats.get('total_projects', 0)} projects across {len(categories)} categories, with expertise in {len(technologies)} different technologies."
        }
    except Exception as e:
        return {"error": f"Failed to generate expertise summary: {str(e)}"}


# CRUD Operations
@mcp.tool()
async def create_project(project_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new project in Hugo's portfolio.
    
    Args:
        project_data: Dictionary containing project information including:
            - title: Project title (required)
            - description: Short description
            - longDescription: Detailed description
            - startDate: Start date (YYYY-MM-DD format)
            - endDate: End date (YYYY-MM-DD format, optional for ongoing projects)
            - status: Project status (completed, ongoing, planned)
            - technologies: List of technologies used
            - category: Project category (ai, real-time-graphics, web, mobile, other)
            - client: Client name
            - role: Role/title for this project
            - responsibilities: List of responsibilities
            - impact: Impact statement
            - featured: Boolean for featured status
            - order: Display order number
    
    Returns:
        Dictionary containing the created project or error message
    """
    try:
        client = await get_api_client()
        result = await client.create_project(project_data)
        return result
    except Exception as e:
        return {"error": f"Failed to create project: {str(e)}"}


@mcp.tool()
async def update_project(project_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update an existing project in Hugo's portfolio.
    
    Args:
        project_id: The unique identifier of the project to update
        updates: Dictionary containing fields to update
    
    Returns:
        Dictionary containing the updated project or error message
    """
    try:
        client = await get_api_client()
        result = await client.update_project(project_id, updates)
        return result
    except Exception as e:
        return {"error": f"Failed to update project: {str(e)}"}


@mcp.tool()
async def delete_project(project_id: str) -> Dict[str, Any]:
    """
    Delete a project from Hugo's portfolio.
    
    Args:
        project_id: The unique identifier of the project to delete
    
    Returns:
        Dictionary containing success message or error
    """
    try:
        client = await get_api_client()
        result = await client.delete_project(project_id)
        return result
    except Exception as e:
        return {"error": f"Failed to delete project: {str(e)}"}


@mcp.tool()
async def update_project_role(project_id: str, role: str) -> Dict[str, Any]:
    """
    Update the role field for a specific project.
    
    Args:
        project_id: The unique identifier of the project
        role: The new role/title for this project
    
    Returns:
        Dictionary containing the updated project or error message
    """
    try:
        client = await get_api_client()
        result = await client.update_project_field(project_id, "role", role)
        return result
    except Exception as e:
        return {"error": f"Failed to update project role: {str(e)}"}


@mcp.tool()
async def update_project_status(project_id: str, status: str) -> Dict[str, Any]:
    """
    Update the status field for a specific project.
    
    Args:
        project_id: The unique identifier of the project
        status: The new status (completed, ongoing, planned)
    
    Returns:
        Dictionary containing the updated project or error message
    """
    try:
        client = await get_api_client()
        result = await client.update_project_field(project_id, "status", status)
        return result
    except Exception as e:
        return {"error": f"Failed to update project status: {str(e)}"}


@mcp.tool()
async def update_project_technologies(project_id: str, technologies: List[str]) -> Dict[str, Any]:
    """
    Update the technologies list for a specific project.
    
    Args:
        project_id: The unique identifier of the project
        technologies: List of technology names
    
    Returns:
        Dictionary containing the updated project or error message
    """
    try:
        client = await get_api_client()
        result = await client.update_project_field(project_id, "technologies", technologies)
        return result
    except Exception as e:
        return {"error": f"Failed to update project technologies: {str(e)}"}


@mcp.tool()
async def update_project_description(project_id: str, description: str, long_description: str = None) -> Dict[str, Any]:
    """
    Update the description fields for a specific project.
    
    Args:
        project_id: The unique identifier of the project
        description: Short description
        long_description: Detailed description (optional)
    
    Returns:
        Dictionary containing the updated project or error message
    """
    try:
        client = await get_api_client()
        updates = {"description": description}
        if long_description is not None:
            updates["longDescription"] = long_description
        result = await client.update_project(project_id, updates)
        return result
    except Exception as e:
        return {"error": f"Failed to update project description: {str(e)}"}


@mcp.tool()
async def update_project_impact(project_id: str, impact: str) -> Dict[str, Any]:
    """
    Update the impact statement for a specific project.
    
    Args:
        project_id: The unique identifier of the project
        impact: The new impact statement
    
    Returns:
        Dictionary containing the updated project or error message
    """
    try:
        client = await get_api_client()
        result = await client.update_project_field(project_id, "impact", impact)
        return result
    except Exception as e:
        return {"error": f"Failed to update project impact: {str(e)}"}


@mcp.tool()
async def set_project_featured(project_id: str, featured: bool) -> Dict[str, Any]:
    """
    Set the featured status for a specific project.
    
    Args:
        project_id: The unique identifier of the project
        featured: Boolean indicating if project should be featured
    
    Returns:
        Dictionary containing the updated project or error message
    """
    try:
        client = await get_api_client()
        result = await client.update_project_field(project_id, "featured", featured)
        return result
    except Exception as e:
        return {"error": f"Failed to update project featured status: {str(e)}"}


@mcp.tool()
async def bulk_update_roles(role_updates: Dict[str, str]) -> Dict[str, Any]:
    """
    Update roles for multiple projects at once.
    
    Args:
        role_updates: Dictionary mapping project_id to new role
    
    Returns:
        Dictionary containing results for each update
    """
    try:
        client = await get_api_client()
        results = {}
        
        for project_id, new_role in role_updates.items():
            result = await client.update_project_field(project_id, "role", new_role)
            results[project_id] = result
        
        return {
            "success": True,
            "message": f"Updated roles for {len(role_updates)} projects",
            "results": results
        }
    except Exception as e:
        return {"error": f"Failed to bulk update roles: {str(e)}"}


if __name__ == "__main__":
    # Run the server with HTTP transport for easy testing
    port = int(os.getenv('MCP_SERVER_PORT', '8017'))
    host = os.getenv('MCP_SERVER_HOST', '0.0.0.0')
    
    print(f"Starting Hugo Portfolio Management MCP Server on {host}:{port}")
    print("Available READ tools:")
    print("- get_all_projects (with filtering)")
    print("- get_project_by_id")
    print("- get_projects_by_category")
    print("- get_projects_by_technology")
    print("- get_featured_projects")
    print("- search_projects")
    print("- get_projects_by_status")
    print("- get_projects_by_year")
    print("- get_recent_projects (most recent by end date)")
    print("- get_all_technologies")
    print("- get_all_categories")
    print("- get_project_statistics")
    print("- get_hugo_expertise_summary")
    print()
    print("Available WRITE tools:")
    print("- create_project")
    print("- update_project")
    print("- delete_project")
    print("- update_project_role")
    print("- update_project_status")
    print("- update_project_technologies")
    print("- update_project_description")
    print("- update_project_impact")
    print("- set_project_featured")
    print("- bulk_update_roles")
    print()
    print("This server connects to your existing portfolio API at:")
    print(f"  {os.getenv('PORTFOLIO_API_URL', 'http://localhost:3017/api')}")
    print()
    
    mcp.run(transport="http", host=host, port=port)