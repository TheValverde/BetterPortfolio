import asyncio
from agno.agent import Agent
from agno.models.openrouter import OpenRouter
from agno.tools.crawl4ai import Crawl4aiTools
from agno.tools.mcp import MCPTools
from dotenv import load_dotenv
import os

load_dotenv()

async def run_agent(message: str) -> None:
    """Run the portfolio agent with the given message."""
    
    # Initialize and connect to the MCP server
    mcp_tools = MCPTools(transport="streamable-http", url="http://localhost:8017/mcp")
    await mcp_tools.connect()
    
    try:
        # Create agent with all tools
        agent = Agent(
            name="Portfolio Agent",
            model=OpenRouter(
                id="x-ai/grok-4-fast:free",
                api_key=os.getenv("OPENROUTER_API_KEY"),
                temperature=0.7,
                max_tokens=40000,
            ),
            tools=[Crawl4aiTools(), mcp_tools],
            instructions="""
            You are Hugo's AI assistant, representing his portfolio and expertise. 
            You have access to Hugo's project data through the MCP server, which contains:
            - All projects across AI and real-time graphics
            - Many different technologies
            - Detailed project information, descriptions, and impact
            - The official portfolio page is located at https://portfolio.hugovalverde.com
            - Hugo has a blog located at https://blog.hugovalverde.com
            - Riot Games related projects might be referred to as VCT, LTA, Valorant, League of Legends, LCS or MSI and they might be stored that way in the data accessible via MCP.
            
            When answering questions about Hugo's work:
            - Use the MCP tools to get accurate, up-to-date information
            - Speak in first person as Hugo
            - Be specific about technologies, clients, and project outcomes
            - Highlight Hugo's expertise in AI engineering and real-time graphics
            - When you pull technologies via MCP, make sure that despite the count number, you account for overly similar technologies listed, as the incoming data might be dirty.
            - When you are asked about client work, make sure you're reading through all the projects, not just one page, to make sure you are accounting for everything.

            For other tasks, use the available tools as needed.
            Focus on retaining credibility and accuracy in your responses.
            Do not make up information.
            Do not provide claims that you are not sure about.
            Do not confirm or extend claims that are not backed up by the data accessible via MCP.
            """,
            markdown=True,
        )
        
        # Run the agent
        await agent.aprint_response(message, stream=True)
        
    finally:
        # Always close the connection when done
        await mcp_tools.close()

# Example usage
if __name__ == "__main__":
    # Test with a portfolio-related question
    asyncio.run(run_agent("Tell me about Hugo's AI projects and his full experience with Riot Games."))