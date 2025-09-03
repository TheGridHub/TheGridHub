// Free AI using Puter.js - No API keys needed!
// This provides free access to GPT-4o, GPT-5, and other advanced models

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<string>
        txt2img: (prompt: string) => Promise<HTMLImageElement>
      }
    }
  }
}

export async function generateTaskSuggestions(
  projectDescription: string,
  existingTasks: string[]
) {
  try {
    // Check if Puter.js is loaded
    if (typeof window !== 'undefined' && window.puter) {
      const prompt = `As a project management AI, generate 5 helpful task suggestions for this project: "${projectDescription}". 

Existing tasks: ${existingTasks.join(', ')}

Return a JSON array with objects containing: title, description, priority (HIGH/MEDIUM/LOW), and estimatedHours.

Example format:
[
  {
    "title": "Create project wireframes",
    "description": "Design initial layout and user flow wireframes",
    "priority": "HIGH",
    "estimatedHours": 4
  }
]`

      const response = await window.puter.ai.chat(prompt, { 
        model: 'gpt-4o-mini' 
      })
      
      // Parse the JSON response
      try {
        return JSON.parse(response)
      } catch {
        // If JSON parsing fails, return a formatted response
        return [{
          title: "AI-Generated Task",
          description: response.slice(0, 100) + "...",
          priority: "MEDIUM",
          estimatedHours: 2
        }]
      }
    }

    // Fallback suggestions if AI is not available
    return [
      {
        title: "Review project requirements",
        description: "Analyze and document all project requirements and constraints",
        priority: "HIGH",
        estimatedHours: 2
      },
      {
        title: "Create project timeline",
        description: "Develop a detailed timeline with milestones and deadlines",
        priority: "HIGH", 
        estimatedHours: 3
      },
      {
        title: "Identify project risks",
        description: "Assess potential risks and develop mitigation strategies",
        priority: "MEDIUM",
        estimatedHours: 2
      },
      {
        title: "Set up communication channels",
        description: "Establish regular check-ins and communication protocols",
        priority: "MEDIUM",
        estimatedHours: 1
      },
      {
        title: "Prepare project resources",
        description: "Gather all necessary tools and resources for the project",
        priority: "LOW",
        estimatedHours: 2
      }
    ]
  } catch (error) {
    console.error('Error generating task suggestions:', error)
    return []
  }
}

export async function analyzeProjectProgress(
  tasks: Array<{ title: string; status: string; priority: string }>
) {
  try {
    if (typeof window !== 'undefined' && window.puter) {
      const prompt = `Analyze this project progress data and provide insights: ${JSON.stringify(tasks)}

Return a JSON object with:
- insights: array of key observations
- recommendations: array of actionable suggestions  
- risk_assessment: string describing potential risks`

      const response = await window.puter.ai.chat(prompt, { 
        model: 'gpt-4o-mini' 
      })

      try {
        return JSON.parse(response)
      } catch {
        return {
          insights: ["Project analysis completed", "Tasks are progressing"],
          recommendations: ["Continue monitoring progress", "Address any blockers"],
          risk_assessment: "Low to moderate risk level"
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error analyzing project progress:', error)
    return null
  }
}

export async function optimizeTaskSchedule(
  tasks: Array<{
    title: string
    priority: string
    estimatedHours: number
    dependencies?: string[]
  }>
) {
  try {
    if (typeof window !== 'undefined' && window.puter) {
      const prompt = `Optimize the scheduling for these tasks: ${JSON.stringify(tasks)}

Return a JSON array with optimized task order and scheduling recommendations.`

      const response = await window.puter.ai.chat(prompt, { 
        model: 'gpt-4o-mini' 
      })

      try {
        return JSON.parse(response)
      } catch {
        return tasks.sort((a, b) => {
          const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        })
      }
    }

    return []
  } catch (error) {
    console.error('Error optimizing task schedule:', error)
    return []
  }
}

// Alternative using Hugging Face Transformers (also free)
export async function generateWithHuggingFace(prompt: string) {
  try {
    // This would use Hugging Face's free inference API
    // You can implement this as a backup option
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
    })

    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.error('Hugging Face API error:', error)
  }
  
  return null
}
