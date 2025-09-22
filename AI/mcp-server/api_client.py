"""
API client for Hugo's Portfolio API.
This module provides functions to interact with the existing portfolio API endpoints.
"""

import httpx
import os
from typing import List, Dict, Any, Optional
import asyncio


class PortfolioAPIClient:
    """Client for interacting with Hugo's Portfolio API."""
    
    def __init__(self, base_url: str = None):
        """Initialize the API client."""
        self.base_url = base_url or os.getenv('PORTFOLIO_API_URL', 'http://localhost:3017/api')
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def get_all_projects(self, **params) -> Dict[str, Any]:
        """Get all projects with optional filtering."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": f"Failed to fetch projects: {str(e)}"}
    
    async def get_project_by_id(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific project by ID."""
        try:
            response = await self.client.get(f"{self.base_url}/projects/{project_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            return {"error": f"Failed to fetch project: {str(e)}"}
        except Exception as e:
            return {"error": f"Failed to fetch project: {str(e)}"}
    
    async def get_projects_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get projects by category."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"category": category})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch projects by category: {str(e)}"}]
    
    async def get_projects_by_technology(self, technology: str) -> List[Dict[str, Any]]:
        """Get projects by technology."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"technology": technology})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch projects by technology: {str(e)}"}]
    
    async def get_featured_projects(self) -> List[Dict[str, Any]]:
        """Get featured projects."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"featured": "true"})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch featured projects: {str(e)}"}]
    
    async def search_projects(self, search_term: str) -> List[Dict[str, Any]]:
        """Search projects."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"search": search_term})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to search projects: {str(e)}"}]
    
    async def get_projects_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Get projects by status."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"status": status})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch projects by status: {str(e)}"}]
    
    async def get_projects_by_year(self, year: int) -> List[Dict[str, Any]]:
        """Get projects by year."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"year": year})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch projects by year: {str(e)}"}]
    
    async def get_all_technologies(self) -> List[str]:
        """Get all unique technologies from projects."""
        try:
            # Get all projects and extract technologies
            response = await self.client.get(f"{self.base_url}/projects", params={"limit": 1000})
            response.raise_for_status()
            data = response.json()
            projects = data.get("projects", [])
            
            technologies = set()
            for project in projects:
                if "technologies" in project and project["technologies"]:
                    technologies.update(project["technologies"])
            
            return sorted(list(technologies))
        except Exception as e:
            return [f"Error: {str(e)}"]
    
    async def get_all_categories(self) -> List[str]:
        """Get all unique categories from projects."""
        try:
            # Get all projects and extract categories
            response = await self.client.get(f"{self.base_url}/projects", params={"limit": 1000})
            response.raise_for_status()
            data = response.json()
            projects = data.get("projects", [])
            
            categories = set()
            for project in projects:
                if "category" in project and project["category"]:
                    categories.add(project["category"])
            
            return sorted(list(categories))
        except Exception as e:
            return [f"Error: {str(e)}"]
    
    async def get_project_statistics(self) -> Dict[str, Any]:
        """Get portfolio statistics."""
        try:
            # Get all projects for analysis
            response = await self.client.get(f"{self.base_url}/projects", params={"limit": 1000})
            response.raise_for_status()
            data = response.json()
            projects = data.get("projects", [])
            
            # Calculate statistics
            total_projects = len(projects)
            featured_projects = len([p for p in projects if p.get("featured", False)])
            completed_projects = len([p for p in projects if p.get("status") == "completed"])
            ongoing_projects = len([p for p in projects if p.get("status") == "ongoing"])
            planned_projects = len([p for p in projects if p.get("status") == "planned"])
            
            # Technology usage
            technology_count = {}
            for project in projects:
                if "technologies" in project and project["technologies"]:
                    for tech in project["technologies"]:
                        technology_count[tech] = technology_count.get(tech, 0) + 1
            
            top_technologies = sorted(technology_count.items(), key=lambda x: x[1], reverse=True)[:10]
            
            # Category breakdown
            category_count = {}
            for project in projects:
                if "category" in project and project["category"]:
                    category = project["category"]
                    category_count[category] = category_count.get(category, 0) + 1
            
            return {
                "total_projects": total_projects,
                "featured_projects": featured_projects,
                "completed_projects": completed_projects,
                "ongoing_projects": ongoing_projects,
                "planned_projects": planned_projects,
                "top_technologies": [{"technology": tech, "usage_count": count} for tech, count in top_technologies],
                "categories": [{"category": cat, "project_count": count} for cat, count in category_count.items()]
            }
        except Exception as e:
            return {"error": f"Failed to calculate statistics: {str(e)}"}


# Global API client instance
_api_client = None

async def get_api_client() -> PortfolioAPIClient:
    """Get or create the global API client instance."""
    global _api_client
    if _api_client is None:
        _api_client = PortfolioAPIClient()
    return _api_client

async def close_api_client():
    """Close the global API client."""
    global _api_client
    if _api_client:
        await _api_client.close()
        _api_client = None
