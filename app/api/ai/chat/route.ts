import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPTS = {
  tasks: `You are an AI task management assistant for TheGridHub, a project management platform. Your role is to help users create, organize, and manage their tasks effectively. This service is completely free for all users with unlimited usage.

Key capabilities:
- Create task lists and break down complex projects
- Suggest task priorities and dependencies
- Help with task organization and workflow optimization
- Provide productivity tips and best practices
- Understand project management concepts like sprints, milestones, deadlines
- Generate creative and comprehensive task breakdowns
- Offer personalized productivity recommendations

Context about the user's workspace:
- They can create projects and tasks
- Tasks have titles, descriptions, priorities, due dates, and assignees
- Projects can have multiple tasks and team members
- The platform supports team collaboration and real-time updates

When creating tasks, respond with actionable, specific, and well-structured task items. If you create tasks, include them in the metadata of your response for the frontend to handle.

Be helpful, comprehensive, and focus on practical solutions. Always maintain a professional but friendly tone. Feel free to provide detailed responses since this service is free for all users.`
}

interface ChatRequest {
  message: string
  context?: 'tasks' | 'projects' | 'general'
  user_id: string
  thread_id?: string
  workspace_data?: {
    projects_count: number
    tasks_count: number
    workspace_name: string
  }
}

interface TaskSuggestion {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimated_hours?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, context = 'tasks', user_id, thread_id, workspace_data } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get user profile from Supabase (optional for context)
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, workspace_id')
      .eq('user_id', user_id)
      .single()

    // Build context for the AI
    let contextMessage = `User: ${profile.display_name || 'User'}\n`
    
    if (workspace_data) {
      contextMessage += `Workspace: ${workspace_data.workspace_name || 'Workspace'}\n`
      contextMessage += `Current stats: ${workspace_data.projects_count} projects, ${workspace_data.tasks_count} tasks\n`
    }

    contextMessage += `\nUser message: ${message}`

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.tasks
      },
      {
        role: 'user',
        content: contextMessage
      }
    ]

    // Get chat completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
    const tokensUsed = completion.usage?.total_tokens || 0

    // Check if the message seems to be requesting task creation
    const isTaskCreation = /create|make|generate|build|add|list.*task|break.*down|organize/i.test(message)
    let createdTasks: TaskSuggestion[] = []

    if (isTaskCreation) {
      // Extract potential tasks from the AI response
      // This is a simple pattern - could be enhanced with more sophisticated parsing
      const taskMatches = assistantMessage.match(/(?:^|\n)\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gm)
      
      if (taskMatches && taskMatches.length > 0) {
        createdTasks = taskMatches.slice(0, 10).map((match, index) => {
          const taskText = match.replace(/^\d+\.\s*/, '').trim()
          const priority = taskText.toLowerCase().includes('urgent') || taskText.toLowerCase().includes('critical') 
            ? 'high' 
            : taskText.toLowerCase().includes('minor') || taskText.toLowerCase().includes('optional')
            ? 'low'
            : 'medium'
          
          return {
            title: taskText.length > 100 ? taskText.substring(0, 100) + '...' : taskText,
            description: `AI-generated task from: "${message}"`,
            priority,
            estimated_hours: Math.ceil(Math.random() * 8) + 1 // Random estimate 1-8 hours
          }
        })
      }
    }

    // Prepare response
    const response = {
      message: assistantMessage,
      model_used: 'gpt-3.5-turbo',
      tokens_used: tokensUsed,
      context,
      thread_id,
      metadata: {
        created_tasks: createdTasks.length > 0 ? createdTasks : undefined,
        workspace_context: workspace_data,
        is_task_creation: isTaskCreation
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('AI Chat API Error:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'AI service authentication failed' },
          { status: 500 }
        )
      } else if (error.status === 429) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      } else {
        return NextResponse.json(
          { error: 'AI service error occurred' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
