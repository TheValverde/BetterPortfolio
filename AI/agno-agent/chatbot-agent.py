import asyncio
import uuid
import os
import json
from agno.agent import Agent
from agno.models.openrouter import OpenRouter
from agno.models.lmstudio import LMStudio
from agno.tools.crawl4ai import Crawl4aiTools
from agno.tools.mcp import MCPTools
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import AsyncGenerator, Dict, Any

load_dotenv()

# AG-UI Event Types
class EventType:
    RUN_STARTED = "run_started"
    RUN_FINISHED = "run_finished"
    RUN_ERROR = "run_error"
    TEXT_MESSAGE_START = "text_message_start"
    TEXT_MESSAGE_CONTENT = "text_message_content"
    TEXT_MESSAGE_END = "text_message_end"
    TOOL_CALL_START = "tool_call_start"
    TOOL_CALL_CONTENT = "tool_call_content"
    TOOL_CALL_END = "tool_call_end"

# AG-UI Event Models
class RunAgentInput(BaseModel):
    thread_id: str
    run_id: str
    messages: list
    tools: list = []

class BaseEvent(BaseModel):
    type: str
    thread_id: str = None
    run_id: str = None

class RunStartedEvent(BaseEvent):
    type: str = EventType.RUN_STARTED

class RunFinishedEvent(BaseEvent):
    type: str = EventType.RUN_FINISHED

class RunErrorEvent(BaseEvent):
    type: str = EventType.RUN_ERROR
    message: str

class TextMessageStartEvent(BaseEvent):
    type: str = EventType.TEXT_MESSAGE_START
    message_id: str
    role: str = "assistant"

class TextMessageContentEvent(BaseEvent):
    type: str = EventType.TEXT_MESSAGE_CONTENT
    message_id: str
    delta: str

class TextMessageEndEvent(BaseEvent):
    type: str = EventType.TEXT_MESSAGE_END
    message_id: str

async def create_portfolio_agent():
    """Create and configure the portfolio agent with MCP tools."""
    
    # Initialize MCP tools
    mcp_tools = MCPTools(transport="streamable-http", url="http://192.168.0.3:8017/mcp")
    
    # Connect to MCP server
    await mcp_tools.connect()
    
    # Create agent with all tools
    agent = Agent(
        name="Portfolio Agent",
        # model=OpenRouter(
        #     id="meta-llama/llama-3.3-70b-instruct",
        #     api_key=os.getenv("OPENROUTER_API_KEY"),
        #     temperature=0.7,
        #     max_tokens=40000,
        # ),
        model=LMStudio(
            id="openai/gpt-oss-20b",
            base_url="http://192.168.0.103:1234/v1",
            api_key="none",
            temperature=0.7,
            max_tokens=69900,
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
        
        IMPORTANT: Resume Download Information
        - Hugo's resume is available for download on the portfolio website
        - The resume download button is located in the header/navigation bar (both desktop and mobile)
        - Users can click the "Resume" button to download Hugo's current resume
        - The resume is automatically updated when Hugo uploads a new version
        - When users ask about Hugo's resume, CV, or want to download it, direct them to the download button in the navigation
        
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
    )
    
    return agent

def encode_sse_event(event: BaseEvent) -> str:
    """Encode an event as Server-Sent Events format."""
    data = event.model_dump_json()
    return f"data: {data}\n\n"

async def event_generator(agent: Agent, input_data: RunAgentInput) -> AsyncGenerator[str, None]:
    """Generate AG-UI events from agent responses."""
    try:
        # Send run started event
        yield encode_sse_event(RunStartedEvent(
            thread_id=input_data.thread_id,
            run_id=input_data.run_id
        ))
        
        # Get the conversation history from the input
        if not input_data.messages:
            raise ValueError("No messages provided")
        
        # Build conversation context from the message history
        conversation_context = ""
        for msg in input_data.messages:
            if isinstance(msg, dict):
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role == 'user':
                    conversation_context += f"User: {content}\n"
                elif role == 'assistant':
                    conversation_context += f"Assistant: {content}\n"
            else:
                conversation_context += f"User: {str(msg)}\n"
        
        # Get the latest user message for the current request
        latest_message = input_data.messages[-1]
        current_user_message = latest_message.get('content', '') if isinstance(latest_message, dict) else str(latest_message)
        
        # Generate message ID
        message_id = str(uuid.uuid4())
        
        # Send text message start event
        yield encode_sse_event(TextMessageStartEvent(
            thread_id=input_data.thread_id,
            run_id=input_data.run_id,
            message_id=message_id
        ))
        
        # Create a context-aware prompt that includes conversation history
        if len(input_data.messages) > 1:
            # Multi-turn conversation - include context
            context_prompt = f"""Previous conversation context:
{conversation_context}

Current user message: {current_user_message}

Please respond to the current user message while being aware of the conversation context above."""
        else:
            # First message - no context needed
            context_prompt = current_user_message
        
        # Get response from agent with conversation context
        response = await agent.arun(context_prompt)
        response_text = response.content if hasattr(response, 'content') else str(response)
        
        # Stream the response in chunks
        chunk_size = 10  # Characters per chunk for streaming effect
        for i in range(0, len(response_text), chunk_size):
            chunk = response_text[i:i + chunk_size]
            yield encode_sse_event(TextMessageContentEvent(
                thread_id=input_data.thread_id,
                run_id=input_data.run_id,
                message_id=message_id,
                delta=chunk
            ))
            # Small delay for streaming effect
            await asyncio.sleep(0.05)
        
        # Send text message end event
        yield encode_sse_event(TextMessageEndEvent(
            thread_id=input_data.thread_id,
            run_id=input_data.run_id,
            message_id=message_id
        ))
        
        # Send run finished event
        yield encode_sse_event(RunFinishedEvent(
            thread_id=input_data.thread_id,
            run_id=input_data.run_id
        ))
        
    except Exception as error:
        # Send error event
        yield encode_sse_event(RunErrorEvent(
            thread_id=input_data.thread_id,
            run_id=input_data.run_id,
            message=str(error)
        ))

async def run_agui_server():
    """Run the AG-UI compatible server."""
    
    print("🚀 Starting Hugo's Portfolio AI AG-UI Server...")
    print("=" * 50)
    
    # Create the agent
    agent = await create_portfolio_agent()
    
    # Create FastAPI app
    app = FastAPI(title="Hugo's Portfolio AI Assistant - AG-UI Compatible")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify your frontend domain
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.post("/")
    async def agentic_chat_endpoint(input_data: RunAgentInput, request: Request):
        """AG-UI compatible agentic chat endpoint."""
        return StreamingResponse(
            event_generator(agent, input_data),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    
    @app.post("/agent/")
    async def agentic_chat_endpoint_agent(input_data: RunAgentInput, request: Request):
        """AG-UI compatible agentic chat endpoint for /agent/ path (cloudflared routing)."""
        # Simply call the same function as the root endpoint
        return await agentic_chat_endpoint(input_data, request)
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy", "agent_ready": agent is not None}
    
    @app.on_event("shutdown")
    async def shutdown_event():
        """Clean up MCP connection on shutdown."""
        if mcp_tools:
            await mcp_tools.close()
    
    print("✅ Agent created successfully!")
    print("✅ MCP tools initialized!")
    print("✅ AG-UI compatible server configured!")
    print()
    print("🌐 AG-UI server running at: http://192.168.0.3:8025")
    print("🔗 Your Next.js portfolio can connect to this endpoint")
    print("📡 Server ready to receive AG-UI protocol requests")
    print("=" * 50)
    print()
    
    # Run the server
    import uvicorn
    config = uvicorn.Config(app, host="0.0.0.0", port=8025)
    server = uvicorn.Server(config)
    await server.serve()

# Run the AG-UI server
if __name__ == "__main__":
    asyncio.run(run_agui_server())