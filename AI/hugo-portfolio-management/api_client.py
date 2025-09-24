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
            response = await self.client.get(f"{self.base_url}/projects", params={"category": category, "limit": 1000})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch projects by category: {str(e)}"}]
    
    async def get_projects_by_technology(self, technology: str) -> List[Dict[str, Any]]:
        """Get projects by technology."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"technology": technology, "limit": 1000})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch projects by technology: {str(e)}"}]
    
    async def get_featured_projects(self) -> List[Dict[str, Any]]:
        """Get featured projects."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"featured": "true", "limit": 1000})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch featured projects: {str(e)}"}]
    
    async def search_projects(self, search_term: str) -> List[Dict[str, Any]]:
        """Search projects."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"search": search_term, "limit": 1000})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to search projects: {str(e)}"}]
    
    async def get_projects_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Get projects by status."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"status": status, "limit": 1000})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch projects by status: {str(e)}"}]
    
    async def get_projects_by_year(self, year: int) -> List[Dict[str, Any]]:
        """Get projects by year."""
        try:
            response = await self.client.get(f"{self.base_url}/projects", params={"year": year, "limit": 1000})
            response.raise_for_status()
            data = response.json()
            return data.get("projects", [])
        except Exception as e:
            return [{"error": f"Failed to fetch projects by year: {str(e)}"}]
    
    async def get_recent_projects(self, limit: int = 5) -> Dict[str, Any]:
        """Get the most recent projects based on end date, with ongoing projects first."""
        try:
            response = await self.client.get(f"{self.base_url}/projects/recent", params={"limit": limit})
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": f"Failed to fetch recent projects: {str(e)}"}
    
    # CRUD Operations
    async def create_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new project."""
        try:
            response = await self.client.post(f"{self.base_url}/projects", json=project_data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": f"Failed to create project: {str(e)}"}
    
    async def update_project(self, project_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing project."""
        try:
            response = await self.client.put(f"{self.base_url}/projects/{project_id}", json=updates)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": f"Failed to update project: {str(e)}"}
    
    async def delete_project(self, project_id: str) -> Dict[str, Any]:
        """Delete a project."""
        try:
            response = await self.client.delete(f"{self.base_url}/projects/{project_id}")
            response.raise_for_status()
            return {"success": True, "message": f"Project {project_id} deleted successfully"}
        except Exception as e:
            return {"error": f"Failed to delete project: {str(e)}"}
    
    async def update_project_field(self, project_id: str, field: str, value: Any) -> Dict[str, Any]:
        """Update a specific field of a project."""
        try:
            updates = {field: value}
            response = await self.client.put(f"{self.base_url}/projects/{project_id}", json=updates)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": f"Failed to update project {field}: {str(e)}"}
    
    def _categorize_technology_entry(self, entry: str) -> str:
        """
        Categorize a technology entry using pattern recognition and heuristics.
        Returns: 'technology', 'tool', 'skill', 'responsibility', 'process', 'hardware', 'other'
        """
        entry_lower = entry.lower().strip()
        
        # Programming languages and frameworks (actual technologies)
        tech_patterns = [
            # Programming languages
            r'\b(python|javascript|typescript|java|c\+\+|c#|swift|kotlin|go|rust|php|ruby|scala|r|matlab)\b',
            # Web frameworks
            r'\b(react|vue|angular|next\.js|nuxt|svelte|express|django|flask|fastapi|spring|laravel|rails)\b',
            # Mobile frameworks
            r'\b(react native|flutter|xamarin|ionic|cordova)\b',
            # Databases
            r'\b(mysql|postgresql|mongodb|redis|sqlite|elasticsearch|dynamodb)\b',
            # Cloud platforms
            r'\b(aws|azure|gcp|google cloud|heroku|vercel|netlify)\b',
            # Version control
            r'\b(git|github|gitlab|bitbucket)\b',
            # Package managers
            r'\b(npm|yarn|pip|conda|maven|gradle|composer|nuget)\b',
            # Build tools
            r'\b(webpack|vite|rollup|parcel|gulp|grunt)\b',
            # Testing frameworks
            r'\b(jest|mocha|cypress|selenium|pytest|junit|rspec)\b',
            # AI/ML frameworks
            r'\b(tensorflow|pytorch|keras|scikit-learn|pandas|numpy|opencv)\b',
            # Real-time graphics
            r'\b(unreal engine|unity|blender|maya|3ds max|houdini)\b',
            # Containerization
            r'\b(docker|kubernetes|podman)\b',
            # Specific technologies mentioned
            r'\b(mcp|model context protocol|fastmcp|prisma|tailwind|bootstrap)\b'
        ]
        
        # Software tools and platforms
        tool_patterns = [
            r'\b(ventuz|after effects|premiere|figma|sketch|adobe|photoshop|illustrator)\b',
            r'\b(disguise|notion|slack|discord|zoom|teams)\b',
            r'\b(blender|maya|3ds max|houdini|cinema 4d)\b',
            r'\b(visual studio|vscode|intellij|eclipse|sublime|atom)\b',
            r'\b(postman|insomnia|swagger|openapi)\b'
        ]
        
        # Skills and soft skills
        skill_patterns = [
            r'\b(leadership|teamwork|communication|project management|mentoring)\b',
            r'\b(problem solving|critical thinking|analytical|creative)\b',
            r'\b(collaboration|consulting|client interaction|stakeholder management)\b'
        ]
        
        # Responsibilities and processes
        responsibility_patterns = [
            r'\b(ensuring|providing|creating|developing|implementing|maintaining)\b',
            r'\b(coordinating|managing|optimizing|debugging|testing|deploying)\b',
            r'\b(adapting|re-familiarizing|transitioning|allocating|triage)\b',
            r'\b(writing|recording|editing|producing|programming for)\b',
            r'\b(mentoring|training|teaching|guiding|supporting)\b',
            r'\b(operating|running|executing|performing|conducting)\b',
            r'\b(leading|directing|overseeing|supervising|monitoring)\b',
            r'\b(collaborating|working with|interacting with|communicating with)\b'
        ]
        
        # Hardware and systems
        hardware_patterns = [
            r'\b(custom hardware|touchscreen|kiosk|audio visual|av systems)\b',
            r'\b(server|workstation|gpu|cpu|memory|storage)\b',
            r'\b(projection|display|monitor|camera|microphone)\b'
        ]
        
        # Check patterns (order matters - check responsibilities first)
        import re
        
        # Check responsibilities first (they often contain technology names)
        for pattern in responsibility_patterns:
            if re.search(pattern, entry_lower):
                return 'responsibility'
        
        # Check skills
        for pattern in skill_patterns:
            if re.search(pattern, entry_lower):
                return 'skill'
        
        # Check hardware
        for pattern in hardware_patterns:
            if re.search(pattern, entry_lower):
                return 'hardware'
        
        # Check tools
        for pattern in tool_patterns:
            if re.search(pattern, entry_lower):
                return 'tool'
        
        # Check technologies last (to avoid false positives)
        for pattern in tech_patterns:
            if re.search(pattern, entry_lower):
                return 'technology'
        
        # Additional heuristics
        if len(entry) > 50:  # Very long entries are likely responsibilities
            return 'responsibility'
        
        if any(word in entry_lower for word in ['for ', 'during ', 'with ', 'and ', 'or ']):
            return 'responsibility'
        
        if entry_lower.startswith(('create', 'write', 'record', 'edit', 'ensure', 'provide')):
            return 'responsibility'
        
        # Default to 'other' for unrecognized patterns
        return 'other'

    async def get_all_technologies(self, filter_type: str = 'all') -> List[str]:
        """
        Get all unique technologies from projects with optional filtering.
        
        Args:
            filter_type: 'all', 'technology', 'tool', 'skill', 'responsibility', 'process', 'hardware', 'other'
        """
        try:
            # Get all projects and extract technologies
            response = await self.client.get(f"{self.base_url}/projects", params={"limit": 1000})
            response.raise_for_status()
            data = response.json()
            projects = data.get("projects", [])
            
            all_entries = set()
            for project in projects:
                if "technologies" in project and project["technologies"]:
                    all_entries.update(project["technologies"])
            
            if filter_type == 'all':
                return sorted(list(all_entries))
            
            # Filter by category
            filtered_entries = []
            for entry in all_entries:
                category = self._categorize_technology_entry(entry)
                if category == filter_type:
                    filtered_entries.append(entry)
            
            return sorted(filtered_entries)
        except Exception as e:
            return [f"Error: {str(e)}"]

    async def get_technology_categories(self) -> Dict[str, List[str]]:
        """Get all technologies categorized by type."""
        try:
            # Get all projects and extract technologies
            response = await self.client.get(f"{self.base_url}/projects", params={"limit": 1000})
            response.raise_for_status()
            data = response.json()
            projects = data.get("projects", [])
            
            all_entries = set()
            for project in projects:
                if "technologies" in project and project["technologies"]:
                    all_entries.update(project["technologies"])
            
            # Categorize all entries
            categories = {
                'technology': [],
                'tool': [],
                'skill': [],
                'responsibility': [],
                'process': [],
                'hardware': [],
                'other': []
            }
            
            for entry in all_entries:
                category = self._categorize_technology_entry(entry)
                categories[category].append(entry)
            
            # Sort each category
            for category in categories:
                categories[category] = sorted(categories[category])
            
            return categories
        except Exception as e:
            return {"error": f"Failed to categorize technologies: {str(e)}"}
    
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
            
            # Technology usage (filtered to actual technologies only)
            technology_count = {}
            for project in projects:
                if "technologies" in project and project["technologies"]:
                    for tech in project["technologies"]:
                        # Only count actual technologies, not responsibilities/skills
                        if self._categorize_technology_entry(tech) == 'technology':
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
