# AI Chat Development Plan - Hugo's Portfolio

## 🎯 **Project Overview**

**Goal**: Implement an intelligent AI chat interface that showcases Hugo's AI engineering skills to potential clients, using AG-UI protocol for modern, streaming chat experience.

**Key Features**:
- Self-aware AI version of Hugo that speaks in first person about projects
- Modern sidebar chat widget (bottom-right)
- Real-time streaming responses using AG-UI
- Read-only database access to Hugo's actual project data
- Professional, modern UI design

---

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **AG-UI Protocol** - Modern streaming chat interface
- **React Components** - Custom chat widget
- **Tailwind CSS** - Modern, responsive design
- **Next.js** - Integration with existing portfolio

### **Backend Stack**
- **AG-UI Server** - Streaming chat endpoint
- **OpenRouter API** - AI model integration (existing setup)
- **PostgreSQL** - Read-only project data access
- **Prisma** - Database queries for AI context

### **AI Configuration**
- **Model**: GPT-4o via OpenRouter
- **Personality**: Self-aware AI version of Hugo
- **Knowledge Base**: Hugo's 23 projects, skills, timeline, experience
- **Tone**: Professional, first-person, technically accurate

---

## 🎨 **UI/UX Design**

### **Chat Widget Design**
```
┌─────────────────────────────────┐
│  🤖 Hugo's AI Assistant    [×]  │
├─────────────────────────────────┤
│                                 │
│  👤 User: Tell me about your    │
│      Riot Games work            │
│                                 │
│  🤖 Hugo AI: I worked on the    │
│      MSI Tournament 2025...     │
│      [streaming response]       │
│                                 │
│  👤 User: What technologies     │
│      did you use?               │
│                                 │
│  🤖 Hugo AI: For that project   │
│      I used Ventuz for real-    │
│      time graphics...           │
│                                 │
├─────────────────────────────────┤
│ Type your message...        [📎]│
└─────────────────────────────────┘
```

### **Design Specifications**
- **Position**: Fixed bottom-right corner
- **Size**: 350px wide, 500px tall (expandable)
- **Colors**: Dark theme matching portfolio
- **Animations**: Smooth slide-in, typing indicators
- **Mobile**: Responsive, full-width on mobile

---

## 🔧 **Implementation Plan**

### **Phase 1: AG-UI Server Setup**
1. **Install AG-UI Dependencies**
   ```bash
   npm install @ag-ui/core @ag-ui/react
   ```

2. **Create AG-UI Server**
   ```typescript
   // src/lib/ag-ui-server.ts
   import { createAGUIServer } from '@ag-ui/core'
   import { openai } from '@ai-sdk/openai'
   
   export const aguiServer = createAGUIServer({
     model: openai('gpt-4o'),
     systemPrompt: `You are Hugo Valverde's AI assistant...`,
     tools: [projectQueryTool, skillQueryTool]
   })
   ```

3. **Database Context Tools**
   ```typescript
   // Tools for AI to access Hugo's data
   const projectQueryTool = {
     name: 'query_projects',
     description: 'Query Hugo\'s project database',
     parameters: { query: 'string' }
   }
   ```

### **Phase 2: Chat Widget Component**
1. **AG-UI Chat Component**
   ```typescript
   // src/components/AIChatWidget.tsx
   import { useAGUIChat } from '@ag-ui/react'
   
   export function AIChatWidget() {
     const { messages, sendMessage, isLoading } = useAGUIChat({
       endpoint: '/api/chat',
       initialMessage: "Hi! I'm Hugo's AI assistant. Ask me about his projects, experience, or how he can help your business!"
     })
     
     return (
       <div className="fixed bottom-4 right-4 w-80 h-96 bg-gray-900 rounded-lg shadow-xl">
         {/* Chat UI */}
       </div>
     )
   }
   ```

2. **Modern Styling**
   - Dark theme with Hugo's brand colors
   - Smooth animations and transitions
   - Typing indicators and message bubbles
   - Mobile-responsive design

### **Phase 3: AI Personality & Knowledge**
1. **System Prompt Engineering**
   ```typescript
   const systemPrompt = `
   You are Hugo Valverde's AI assistant. You are self-aware that you are AI, 
   but you speak in first person about Hugo's work and experience.
   
   Key facts about Hugo:
   - AI Engineer & Real-Time Graphics Developer
   - Worked with Riot Games, NHL, Yale University, World Bank
   - Expert in LangChain, CrewAI, MCP servers, Ventuz, Unreal Engine
   - 23 projects in portfolio covering AI, real-time graphics, web development
   
   Always be professional, accurate, and showcase Hugo's expertise.
   When asked about projects, provide specific details from the database.
   `
   ```

2. **Database Integration**
   ```typescript
   // Tools for AI to query Hugo's data
   const tools = [
     {
       name: 'get_projects',
       description: 'Get Hugo\'s projects by category or technology',
       handler: async (params) => {
         return await prisma.project.findMany({
           where: { technologies: { has: params.technology } }
         })
       }
     },
     {
       name: 'get_project_details',
       description: 'Get detailed information about a specific project',
       handler: async (params) => {
         return await prisma.project.findUnique({
           where: { id: params.projectId }
         })
       }
     }
   ]
   ```

### **Phase 4: API Integration**
1. **Chat API Endpoint**
   ```typescript
   // src/app/api/chat/route.ts
   import { aguiServer } from '@/lib/ag-ui-server'
   
   export async function POST(request: Request) {
     const { messages } = await request.json()
     
     return aguiServer.streamResponse(messages, {
       onChunk: (chunk) => {
         // Stream to client
       }
     })
   }
   ```

2. **OpenRouter Integration**
   ```typescript
   // Use existing OpenRouter setup
   const openai = new OpenAI({
     baseURL: process.env.OPENROUTER_BASE_URL,
     apiKey: process.env.OPENROUTER_API_KEY
   })
   ```

---

## 🚀 **Development Workflow**

### **Step 1: Environment Setup**
```bash
# Install AG-UI dependencies
npm install @ag-ui/core @ag-ui/react

# Add to development environment
# Update docker-compose.dev.yml if needed
```

### **Step 2: Create AG-UI Server**
- Set up streaming chat server
- Configure AI model and system prompt
- Add database query tools

### **Step 3: Build Chat Widget**
- Create React component with AG-UI
- Implement modern, responsive design
- Add animations and interactions

### **Step 4: Integrate with Portfolio**
- Add chat widget to main layout
- Test on development environment
- Ensure mobile responsiveness

### **Step 5: AI Personality & Testing**
- Fine-tune system prompt
- Test with various questions
- Ensure accurate project information

### **Step 6: Production Deployment**
- Test on production environment
- Monitor performance and usage
- Gather user feedback

---

## 📊 **Success Metrics**

### **Technical Metrics**
- ✅ Chat response time < 2 seconds
- ✅ 99.9% uptime
- ✅ Mobile responsive design
- ✅ Real-time streaming working

### **User Experience Metrics**
- ✅ Professional, modern appearance
- ✅ Accurate project information
- ✅ Engaging, helpful responses
- ✅ Showcases Hugo's AI engineering skills

### **Business Impact**
- ✅ Demonstrates AI expertise to potential clients
- ✅ Provides interactive way to learn about Hugo's work
- ✅ Sets portfolio apart from competitors
- ✅ Shows practical AI implementation skills

---

## 🔒 **Security & Performance**

### **Security Measures**
- Rate limiting on chat API
- Input sanitization
- Read-only database access
- No sensitive data exposure

### **Performance Optimization**
- Streaming responses for fast UX
- Efficient database queries
- Caching for common questions
- Mobile optimization

---

## 📝 **Next Steps**

1. **Research AG-UI Implementation** - Study AG-UI docs and examples
2. **Set up Development Environment** - Install dependencies and create basic structure
3. **Create AG-UI Server** - Implement streaming chat server
4. **Build Chat Widget** - Create modern, responsive UI component
5. **Test & Iterate** - Fine-tune AI personality and responses
6. **Deploy to Production** - Launch on live portfolio

---

## 🎯 **Expected Outcome**

A cutting-edge AI chat interface that:
- Showcases Hugo's AI engineering expertise
- Provides interactive way to learn about his work
- Demonstrates modern AI implementation skills
- Sets the portfolio apart from competitors
- Engages potential clients with intelligent conversation

This will be a significant differentiator in the AI engineering space and demonstrate Hugo's ability to implement sophisticated AI systems in real-world applications.
