"""
Test client for the Hugo Portfolio MCP Server.
This script demonstrates how to connect to and use the MCP server.
"""

import asyncio
from fastmcp import Client


async def test_mcp_server():
    """Test the MCP server functionality."""
    # Connect to the MCP server
    client = Client("http://127.0.0.1:8001/mcp")
    
    try:
        async with client:
            print("🔗 Connected to Hugo Portfolio MCP Server")
            print("=" * 50)
            
            # Test 1: Get all projects (with API filtering)
            print("\n📋 Testing: get_all_projects")
            all_projects = await client.call_tool("get_all_projects", {"limit": 5})
            if "projects" in all_projects:
                print(f"Total Projects: {all_projects.get('total', 0)}")
                print(f"Showing first {len(all_projects['projects'])} projects:")
                for project in all_projects["projects"][:3]:
                    print(f"  - {project.get('title', 'Unknown')} ({project.get('category', 'Unknown')})")
            else:
                print(f"Error: {all_projects}")
            
            # Test 2: Get project statistics
            print("\n📊 Testing: get_project_statistics")
            stats = await client.call_tool("get_project_statistics", {})
            print(f"Portfolio Statistics: {stats}")
            
            # Test 3: Get all technologies
            print("\n🛠️  Testing: get_all_technologies")
            technologies = await client.call_tool("get_all_technologies", {})
            print(f"Technologies ({len(technologies)}): {technologies[:10]}...")  # Show first 10
            
            # Test 4: Get featured projects
            print("\n⭐ Testing: get_featured_projects")
            featured = await client.call_tool("get_featured_projects", {})
            print(f"Featured Projects ({len(featured)}):")
            for project in featured[:3]:  # Show first 3
                print(f"  - {project.get('title', 'Unknown')} ({project.get('category', 'Unknown')})")
            
            # Test 5: Search for AI projects
            print("\n🤖 Testing: search_projects with 'AI'")
            ai_projects = await client.call_tool("search_projects", {"search_term": "AI"})
            print(f"AI-related Projects ({len(ai_projects)}):")
            for project in ai_projects[:3]:  # Show first 3
                print(f"  - {project.get('title', 'Unknown')}")
            
            # Test 6: Get Hugo's expertise summary
            print("\n👨‍💻 Testing: get_hugo_expertise_summary")
            expertise = await client.call_tool("get_hugo_expertise_summary", {})
            print(f"Expertise Summary: {expertise.get('experience_summary', 'N/A')}")
            
            print("\n✅ All tests completed successfully!")
            
    except Exception as e:
        print(f"❌ Error testing MCP server: {e}")


if __name__ == "__main__":
    print("🧪 Testing Hugo Portfolio MCP Server")
    print("Make sure the server is running on http://127.0.0.1:8001")
    print("Run: python server.py")
    print()
    
    asyncio.run(test_mcp_server())
