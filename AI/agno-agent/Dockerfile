FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN uv pip install --system -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 agnouser && chown -R agnouser:agnouser /app
USER agnouser

# Expose port
EXPOSE 8025

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import httpx; httpx.get('http://localhost:8025/health', timeout=5)"

# Set environment variables
ENV LMSTUDIO_API_KEY=lm-studio

# Start the agent
CMD ["python", "chatbot-agent.py"]
