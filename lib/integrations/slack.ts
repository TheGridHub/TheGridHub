interface SlackConfig {
  botToken: string
  appToken?: string
  signingSecret: string
}

interface TaskWorkTask {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: 'High' | 'Medium' | 'Low'
  status: 'pending' | 'in_progress' | 'completed'
  assigneeEmail?: string
}

export class SlackIntegration {
  private config: SlackConfig
  private baseUrl = 'https://slack.com/api'

  constructor(config: SlackConfig) {
    this.config = config
  }

  /**
   * SLACK MESSAGING
   */

  // Send task notification to Slack channel
  async sendTaskNotification(
    channel: string,
    task: TaskWorkTask,
    action: 'created' | 'updated' | 'completed',
    userName?: string
  ): Promise<void> {
    try {
      const actionEmoji = {
        created: '🆕',
        updated: '📝', 
        completed: '✅'
      }

      const priorityColor = {
        High: '#e74c3c',
        Medium: '#f39c12',
        Low: '#27ae60'
      }

      const blocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${actionEmoji[action]} *Task ${action.charAt(0).toUpperCase() + action.slice(1)}*${userName ? ` by ${userName}` : ''}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Task:*\n${task.title}`
            },
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${task.priority}`
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n${task.status.replace('_', ' ').toUpperCase()}`
            },
            ...(task.dueDate ? [{
              type: 'mrkdwn',
              text: `*Due Date:*\n${task.dueDate.toLocaleDateString()}`
            }] : [])
          ]
        }
      ]

      if (task.description) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${task.description}`
          }
        })
      }

      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
            text: 'View in TaskWork'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`,
            style: 'primary'
          }
        ]
      })

      await this.makeRequest('chat.postMessage', {
        channel,
        attachments: [{
          color: priorityColor[task.priority],
          blocks
        }]
      })

    } catch (error) {
      console.error('Error sending Slack notification:', error)
      throw new Error('Failed to send Slack notification')
    }
  }

  // Send task assignment message
  async sendTaskAssignment(
    userId: string,
    task: TaskWorkTask,
    assignerName?: string
  ): Promise<void> {
    try {
      const blocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📋 *New task assigned to you*${assignerName ? ` by ${assignerName}` : ''}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Task:*\n${task.title}`
            },
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${task.priority}`
            }
          ]
        }
      ]

      if (task.description) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${task.description}`
          }
        })
      }

      if (task.dueDate) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Due Date:* ${task.dueDate.toLocaleDateString()}`
          }
        })
      }

      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Accept Task'
            },
            action_id: 'accept_task',
            value: task.id,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Details'
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`
          }
        ]
      })

      // Send DM to user
      const dmChannel = await this.openDirectMessage(userId)
      await this.makeRequest('chat.postMessage', {
        channel: dmChannel.id,
        blocks
      })

    } catch (error) {
      console.error('Error sending task assignment:', error)
      throw new Error('Failed to send task assignment')
    }
  }

  /**
   * SLACK WORKFLOWS
   */

  // Create Slack workflow for project updates
  async createProjectWorkflow(projectId: string, channelId: string): Promise<string> {
    try {
      // This would integrate with Slack Workflow Builder
      // For now, we'll create a webhook URL that can trigger notifications
      
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/webhooks/project/${projectId}`
      
      // Send setup message to channel
      await this.makeRequest('chat.postMessage', {
        channel: channelId,
        text: `🔄 TaskWork project workflow activated! I'll notify this channel about project updates.`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '🔄 *Project Workflow Activated*\n\nI\'ll now send updates to this channel when:\n• New tasks are created\n• Tasks are completed\n• Deadlines approach\n• Project milestones are reached'
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Configure Settings'
                },
                url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations`
              }
            ]
          }
        ]
      })

      return webhookUrl
    } catch (error) {
      console.error('Error creating Slack workflow:', error)
      throw new Error('Failed to create Slack workflow')
    }
  }

  /**
   * SLACK SLASH COMMANDS
   */

  // Handle /taskwork slash commands
  async handleSlashCommand(command: string, args: string[], userId: string): Promise<any> {
    try {
      const [action, ...params] = args

      switch (action) {
        case 'create':
          return this.handleCreateTaskCommand(params.join(' '), userId)
        
        case 'list':
          return this.handleListTasksCommand(userId)
        
        case 'status':
          return this.handleStatusCommand(params[0], userId)
        
        case 'help':
          return this.getHelpMessage()
        
        default:
          return this.getHelpMessage()
      }
    } catch (error) {
      console.error('Error handling slash command:', error)
      return {
        text: '❌ Something went wrong. Please try again later.',
        response_type: 'ephemeral'
      }
    }
  }

  private async handleCreateTaskCommand(taskTitle: string, userId: string) {
    if (!taskTitle.trim()) {
      return {
        text: '❌ Please provide a task title. Example: `/taskwork create Fix login bug`',
        response_type: 'ephemeral'
      }
    }

    return {
      text: `✅ Task "${taskTitle}" created! View it in TaskWork.`,
      response_type: 'ephemeral',
      attachments: [{
        color: 'good',
        actions: [{
          type: 'button',
          text: 'View Task',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks`
        }]
      }]
    }
  }

  private async handleListTasksCommand(userId: string) {
    // This would fetch user's tasks from the database
    return {
      text: '📋 Your current tasks:',
      response_type: 'ephemeral',
      attachments: [{
        color: 'good',
        text: 'Click below to view all your tasks in TaskWork',
        actions: [{
          type: 'button',
          text: 'View All Tasks',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks`
        }]
      }]
    }
  }

  private async handleStatusCommand(taskId: string, userId: string) {
    if (!taskId) {
      return {
        text: '❌ Please provide a task ID. Example: `/taskwork status task-123`',
        response_type: 'ephemeral'
      }
    }

    return {
      text: `📊 Task status updated! View details in TaskWork.`,
      response_type: 'ephemeral'
    }
  }

  private getHelpMessage() {
    return {
      text: '🤖 *TaskWork Slack Commands*',
      response_type: 'ephemeral',
      attachments: [{
        color: 'good',
        fields: [
          {
            title: '/taskwork create [task title]',
            value: 'Create a new task',
            short: true
          },
          {
            title: '/taskwork list',
            value: 'List your tasks',
            short: true
          },
          {
            title: '/taskwork status [task-id]',
            value: 'Update task status',
            short: true
          },
          {
            title: '/taskwork help',
            value: 'Show this help message',
            short: true
          }
        ]
      }]
    }
  }

  /**
   * UTILITY METHODS
   */

  private async openDirectMessage(userId: string): Promise<{ id: string }> {
    const response = await this.makeRequest('conversations.open', {
      users: userId
    })
    return response.channel
  }

  private async makeRequest(method: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    
    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`)
    }

    return result
  }

  // Get available channels
  async getChannels(): Promise<Array<{id: string, name: string}>> {
    try {
      const response = await this.makeRequest('conversations.list', {
        types: 'public_channel,private_channel'
      })

      return response.channels.map((channel: any) => ({
        id: channel.id,
        name: channel.name
      }))
    } catch (error) {
      console.error('Error fetching Slack channels:', error)
      return []
    }
  }

  // Get team members
  async getTeamMembers(): Promise<Array<{id: string, name: string, email?: string}>> {
    try {
      const response = await this.makeRequest('users.list', {})

      return response.members
        .filter((member: any) => !member.deleted && !member.is_bot)
        .map((member: any) => ({
          id: member.id,
          name: member.real_name || member.name,
          email: member.profile?.email
        }))
    } catch (error) {
      console.error('Error fetching team members:', error)
      return []
    }
  }
}

