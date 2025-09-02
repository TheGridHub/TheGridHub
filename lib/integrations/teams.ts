interface TeamsConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  accessToken?: string
}

interface TaskGridTask {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: 'High' | 'Medium' | 'Low'
  status: 'pending' | 'in_progress' | 'completed'
  assigneeEmail?: string
}

interface TeamsChannel {
  id: string
  displayName: string
  description?: string
  membershipType: 'standard' | 'private'
  webUrl: string
}

interface TeamsUser {
  id: string
  displayName: string
  userPrincipalName: string
  mail?: string
}

export class TeamsIntegration {
  private config: TeamsConfig
  private baseUrl = 'https://graph.microsoft.com/v1.0'

  constructor(config: TeamsConfig) {
    this.config = config
  }

  /**
   * TEAMS MESSAGING
   */

  // Send task notification to Teams channel
  async sendTaskNotification(
    teamId: string,
    channelId: string,
    task: TaskGridTask,
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
        High: 'attention',
        Medium: 'warning',
        Low: 'good'
      }

      const adaptiveCard = {
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.4',
            body: [
              {
                type: 'TextBlock',
                text: `${actionEmoji[action]} Task ${action.charAt(0).toUpperCase() + action.slice(1)}${userName ? ` by ${userName}` : ''}`,
                weight: 'bolder',
                size: 'medium'
              },
              {
                type: 'FactSet',
                facts: [
                  {
                    title: 'Task:',
                    value: task.title
                  },
                  {
                    title: 'Priority:',
                    value: task.priority
                  },
                  {
                    title: 'Status:',
                    value: task.status.replace('_', ' ').toUpperCase()
                  },
                  ...(task.dueDate ? [{
                    title: 'Due Date:',
                    value: task.dueDate.toLocaleDateString()
                  }] : [])
                ]
              },
              ...(task.description ? [{
                type: 'TextBlock',
                text: task.description,
                wrap: true,
                spacing: 'medium'
              }] : [])
            ],
            actions: [
              {
                type: 'Action.OpenUrl',
                title: 'View in NexusWork',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`
              }
            ]
          }
        }]
      }

      await this.makeRequest(
        'POST',
        `/teams/${teamId}/channels/${channelId}/messages`,
        adaptiveCard
      )

    } catch (error) {
      console.error('Error sending Teams notification:', error)
      throw new Error('Failed to send Teams notification')
    }
  }

  // Send private task assignment message
  async sendTaskAssignment(
    userId: string,
    task: TaskGridTask,
    assignerName?: string
  ): Promise<void> {
    try {
      const adaptiveCard = {
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.4',
            body: [
              {
                type: 'TextBlock',
                text: `📋 New task assigned to you${assignerName ? ` by ${assignerName}` : ''}`,
                weight: 'bolder',
                size: 'medium'
              },
              {
                type: 'FactSet',
                facts: [
                  {
                    title: 'Task:',
                    value: task.title
                  },
                  {
                    title: 'Priority:',
                    value: task.priority
                  },
                  ...(task.dueDate ? [{
                    title: 'Due Date:',
                    value: task.dueDate.toLocaleDateString()
                  }] : [])
                ]
              },
              ...(task.description ? [{
                type: 'TextBlock',
                text: task.description,
                wrap: true,
                spacing: 'medium'
              }] : [])
            ],
            actions: [
              {
                type: 'Action.Submit',
                title: 'Accept Task',
                data: {
                  action: 'accept_task',
                  taskId: task.id
                }
              },
              {
                type: 'Action.OpenUrl',
                title: 'View Details',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`
              }
            ]
          }
        }]
      }

      // Send as chat message to user
      await this.sendChatMessage(userId, adaptiveCard)

    } catch (error) {
      console.error('Error sending task assignment:', error)
      throw new Error('Failed to send task assignment')
    }
  }

  // Send chat message to user
  private async sendChatMessage(userId: string, message: any): Promise<void> {
    try {
      // First create or get existing chat with user
      const chat = await this.makeRequest('POST', '/chats', {
        chatType: 'oneOnOne',
        members: [
          {
            '@odata.type': '#microsoft.graph.aadUserConversationMember',
            userId: userId,
            roles: ['owner']
          },
          {
            '@odata.type': '#microsoft.graph.aadUserConversationMember',
            userId: await this.getCurrentUserId(),
            roles: ['owner']
          }
        ]
      })

      // Send message to chat
      await this.makeRequest('POST', `/chats/${chat.id}/messages`, message)
    } catch (error) {
      console.error('Error sending chat message:', error)
      throw new Error('Failed to send chat message')
    }
  }

  /**
   * TEAMS MANAGEMENT
   */

  // Get all teams the user is a member of
  async getTeams(): Promise<Array<{
    id: string
    displayName: string
    description?: string
    webUrl: string
  }>> {
    try {
      const response = await this.makeRequest('GET', '/me/joinedTeams')
      
      return response.value.map((team: any) => ({
        id: team.id,
        displayName: team.displayName,
        description: team.description,
        webUrl: team.webUrl
      }))
    } catch (error) {
      console.error('Error fetching teams:', error)
      return []
    }
  }

  // Get channels for a team
  async getChannels(teamId: string): Promise<TeamsChannel[]> {
    try {
      const response = await this.makeRequest('GET', `/teams/${teamId}/channels`)
      
      return response.value.map((channel: any): TeamsChannel => ({
        id: channel.id,
        displayName: channel.displayName,
        description: channel.description,
        membershipType: channel.membershipType,
        webUrl: channel.webUrl
      }))
    } catch (error) {
      console.error('Error fetching channels:', error)
      return []
    }
  }

  // Get team members
  async getTeamMembers(teamId: string): Promise<TeamsUser[]> {
    try {
      const response = await this.makeRequest('GET', `/teams/${teamId}/members`)
      
      return response.value.map((member: any): TeamsUser => ({
        id: member.userId,
        displayName: member.displayName,
        userPrincipalName: member.userPrincipalName,
        mail: member.email
      }))
    } catch (error) {
      console.error('Error fetching team members:', error)
      return []
    }
  }

  /**
   * TEAMS APPS & TABS
   */

  // Install NexusWork app to a team
  async installAppToTeam(teamId: string, appId: string): Promise<void> {
    try {
      await this.makeRequest('POST', `/teams/${teamId}/installedApps`, {
        'teamsApp@odata.bind': `https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/${appId}`
      })
    } catch (error) {
      console.error('Error installing app to team:', error)
      throw new Error('Failed to install app to team')
    }
  }

  // Create a tab in a Teams channel for NexusWork project
  async createProjectTab(
    teamId: string,
    channelId: string,
    projectId: string,
    projectName: string
  ): Promise<void> {
    try {
      const tabData = {
        displayName: `NexusWork: ${projectName}`,
        'teamsApp@odata.bind': `https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/${process.env.TEAMS_APP_ID}`,
        configuration: {
          entityId: projectId,
          contentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}?teams=true`,
          websiteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`,
          removeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/teams/remove-tab`
        }
      }

      await this.makeRequest('POST', `/teams/${teamId}/channels/${channelId}/tabs`, tabData)
    } catch (error) {
      console.error('Error creating project tab:', error)
      throw new Error('Failed to create project tab')
    }
  }

  /**
   * MEETINGS & CALENDAR
   */

  // Schedule a project standup meeting
  async scheduleStandupMeeting(
    teamId: string,
    projectName: string,
    startTime: Date,
    duration: number = 30,
    recurrence: 'daily' | 'weekly' = 'daily'
  ): Promise<string> {
    try {
      const endTime = new Date(startTime.getTime() + duration * 60000)

      const meetingData = {
        subject: `${projectName} - Daily Standup`,
        body: {
          contentType: 'HTML',
          content: `
            <h3>Daily Standup for ${projectName}</h3>
            <p>Quick sync on project progress, blockers, and next steps.</p>
            <br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${teamId}">View Project in NexusWork</a>
          `
        },
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC'
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
        recurrence: {
          pattern: {
            type: recurrence,
            interval: 1,
            daysOfWeek: recurrence === 'daily' ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] : ['monday']
          },
          range: {
            type: 'noEnd',
            startDate: startTime.toISOString().split('T')[0]
          }
        }
      }

      const response = await this.makeRequest('POST', '/me/events', meetingData)
      
      // Add team members to the meeting
      const members = await this.getTeamMembers(teamId)
      if (members.length > 0) {
        const attendees = members.map(member => ({
          emailAddress: {
            address: member.mail || member.userPrincipalName,
            name: member.displayName
          },
          type: 'required'
        }))

        await this.makeRequest('PATCH', `/me/events/${response.id}`, {
          attendees
        })
      }

      return response.webLink
    } catch (error) {
      console.error('Error scheduling standup meeting:', error)
      throw new Error('Failed to schedule standup meeting')
    }
  }

  /**
   * TEAMS WORKFLOWS & POWER AUTOMATE
   */

  // Create workflow for task automation
  async createTaskWorkflow(
    teamId: string,
    channelId: string,
    triggers: Array<'task_created' | 'task_completed' | 'deadline_approaching'>
  ): Promise<string> {
    try {
      // This would integrate with Power Automate to create workflows
      // For now, we'll create a webhook endpoint for the workflow
      
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/teams/workflows/tasks/${teamId}/${channelId}`
      
      // Send setup notification to the channel
      const setupMessage = {
        type: 'message',
        attachments: [{
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.4',
            body: [
              {
                type: 'TextBlock',
                text: '🔄 NexusWork Task Workflow Activated',
                weight: 'bolder',
                size: 'medium'
              },
              {
                type: 'TextBlock',
                text: `This channel will now receive notifications for: ${triggers.join(', ')}`,
                wrap: true
              }
            ],
            actions: [
              {
                type: 'Action.OpenUrl',
                title: 'Configure Settings',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations`
              }
            ]
          }
        }]
      }

      await this.makeRequest('POST', `/teams/${teamId}/channels/${channelId}/messages`, setupMessage)

      return webhookUrl
    } catch (error) {
      console.error('Error creating task workflow:', error)
      throw new Error('Failed to create task workflow')
    }
  }

  /**
   * UTILITY METHODS
   */

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.config.accessToken) {
      throw new Error('Access token required for Teams integration')
    }

    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      }
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data)
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Teams API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const response = await this.makeRequest('GET', '/me')
      return response.id
    } catch (error) {
      console.error('Error getting current user ID:', error)
      return ''
    }
  }

  // Get user's presence status
  async getUserPresence(userId: string): Promise<{
    availability: string
    activity: string
  }> {
    try {
      const response = await this.makeRequest('GET', `/users/${userId}/presence`)
      
      return {
        availability: response.availability,
        activity: response.activity
      }
    } catch (error) {
      console.error('Error fetching user presence:', error)
      return {
        availability: 'unknown',
        activity: 'unknown'
      }
    }
  }

  // Send activity feed update
  async sendActivityFeedNotification(
    userId: string,
    title: string,
    description: string,
    actionUrl?: string
  ): Promise<void> {
    try {
      const notification = {
        topic: {
          source: 'entityUrl',
          value: `${process.env.NEXT_PUBLIC_APP_URL}/tasks`
        },
        activityType: 'taskUpdated',
        previewText: {
          content: description
        },
        summary: title,
        ...(actionUrl && {
          webUrl: actionUrl
        })
      }

      await this.makeRequest('POST', `/users/${userId}/teamwork/sendActivityNotification`, notification)
    } catch (error) {
      console.error('Error sending activity feed notification:', error)
      throw new Error('Failed to send activity feed notification')
    }
  }

  // Create a new team for a project
  async createProjectTeam(
    projectName: string,
    description?: string,
    members?: string[]
  ): Promise<{
    id: string
    displayName: string
    webUrl: string
  }> {
    try {
      const teamData = {
        '@microsoft.graph.teamCreationMode': 'standard',
        displayName: `NexusWork: ${projectName}`,
        description: description || `Team for ${projectName} project management`,
        members: [
          {
            '@odata.type': '#microsoft.graph.aadUserConversationMember',
            userId: await this.getCurrentUserId(),
            roles: ['owner']
          },
          ...(members || []).map(memberId => ({
            '@odata.type': '#microsoft.graph.aadUserConversationMember',
            userId: memberId,
            roles: ['member']
          }))
        ],
        channels: [
          {
            displayName: 'General',
            isFavoriteByDefault: true
          },
          {
            displayName: 'Task Updates',
            description: 'Automated notifications for task changes'
          },
          {
            displayName: 'Sprint Planning',
            description: 'Planning and retrospective discussions'
          }
        ]
      }

      const response = await this.makeRequest('POST', '/teams', teamData)
      
      return {
        id: response.id,
        displayName: response.displayName,
        webUrl: response.webUrl
      }
    } catch (error) {
      console.error('Error creating project team:', error)
      throw new Error('Failed to create project team')
    }
  }
}
