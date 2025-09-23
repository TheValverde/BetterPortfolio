"""
Hugo Portfolio MCP Server
Provides read-only access to Hugo's portfolio via the existing API for AI agents.
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
    name=os.getenv('MCP_SERVER_NAME', 'Hugo Portfolio API Server'),
    instructions="""
    This MCP server provides read-only access to Hugo's portfolio via the existing API.
    It allows AI agents to query project information, technologies, categories,
    and statistics to help answer questions about Hugo's work and expertise.
    
    Available tools:
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
async def get_all_technologies(filter_type: str = 'all') -> List[str]:
    """
    Get all unique technologies used across Hugo's projects with optional filtering.
    
    Args:
        filter_type: 'all', 'technology', 'tool', 'skill', 'responsibility', 'process', 'hardware', 'other'
    
    Returns:
        List of technologies/entries filtered by type
    """
    try:
        client = await get_api_client()
        technologies = await client.get_all_technologies(filter_type=filter_type)
        return technologies
    except Exception as e:
        return [f"Error: {str(e)}"]


@mcp.tool()
async def get_technology_categories() -> Dict[str, List[str]]:
    """
    Get all technologies categorized by type (technology, tool, skill, etc.).
    
    Returns:
        Dictionary with categories as keys and lists of entries as values
    """
    try:
        client = await get_api_client()
        categories = await client.get_technology_categories()
        return categories
    except Exception as e:
        return {"error": f"Failed to categorize technologies: {str(e)}"}


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
        
        # Get filtered technologies (actual technologies only)
        technologies = await client.get_all_technologies(filter_type='technology')
        
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




if __name__ == "__main__":
    # Run the server with HTTP transport for easy testing
    port = int(os.getenv('MCP_SERVER_PORT', '8017'))
    host = os.getenv('MCP_SERVER_HOST', '0.0.0.0')
    
    print(f"Starting Hugo Portfolio MCP Server on {host}:{port}")
    print("Available tools:")
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
    print("This server connects to your existing portfolio API at:")
    print(f"  {os.getenv('PORTFOLIO_API_URL', 'http://localhost:3017/api')}")
    print()
    
    mcp.run(transport="http", host=host, port=port)