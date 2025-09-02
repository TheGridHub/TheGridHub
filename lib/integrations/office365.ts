import { Client } from '@microsoft/microsoft-graph-client'
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client'

interface Office365Config {
  clientId: string
  clientSecret: string
  tenantId: string
  redirectUri: string
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

interface CalendarEvent {
  id: string
  subject: string
  start: Date
  end: Date
  attendees?: string[]
  location?: string
}

interface TeamsMessage {
  id: string
  content: string
  from: string
  timestamp: Date
  channelId: string
}

export class Office365Integration {
  private client: Client
  private config: Office365Config

  constructor(config: Office365Config, accessToken: string) {
    this.config = config
    
    // Create custom auth provider
    const authProvider: AuthenticationProvider = {
      getAccessToken: async () => {
        return accessToken
      }
    }

    this.client = Client.initWithMiddleware({ authProvider })
  }

  /**
   * OUTLOOK CALENDAR INTEGRATION
   */
  
  // Create calendar event from TaskGrid task
  async createCalendarEventFromTask(task: TaskGridTask, userEmail: string): Promise<string> {
    try {
      const event = {
        subject: `📋 ${task.title}`,
        body: {
          contentType: 'HTML',
          content: `
            <div>
              <h3>TaskGrid Task: ${task.title}</h3>
              <p><strong>Description:</strong> ${task.description || 'No description'}</p>
              <p><strong>Priority:</strong> ${task.priority}</p>
              <p><strong>Status:</strong> ${task.status}</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}">View in TaskGrid</a></p>
            </div>
          `
        },
        start: {
          dateTime: task.dueDate?.toISOString() || new Date().toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: task.dueDate ? 
            new Date(task.dueDate.getTime() + 60 * 60 * 1000).toISOString() : // 1 hour duration
            new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          timeZone: 'UTC'
        },
        attendees: task.assigneeEmail ? [{
          emailAddress: {
            address: task.assigneeEmail,
            name: task.assigneeEmail
          }
        }] : [],
        categories: ['TaskGrid', `Priority-${task.priority}`],
        isReminderOn: true,
        reminderMinutesBeforeStart: 15
      }

      const response = await this.client.api(`/users/${userEmail}/events`).post(event)
      return response.id
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw new Error('Failed to create calendar event')
    }
  }

  // Sync upcoming calendar events to TaskGrid
  async getUpcomingEvents(userEmail: string, days: number = 7): Promise<CalendarEvent[]> {
    try {
      const startTime = new Date().toISOString()
      const endTime = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

      const events = await this.client
        .api(`/users/${userEmail}/calendarview`)
        .query({
          startDateTime: startTime,
          endDateTime: endTime,
          $select: 'id,subject,start,end,attendees,location,categories',
          $top: 50
        })
        .get()

      return events.value.map((event: any) => ({
        id: event.id,
        subject: event.subject,
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        attendees: event.attendees?.map((a: any) => a.emailAddress.address) || [],
        location: event.location?.displayName
      }))
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return []
    }
  }

  /**
   * MICROSOFT TEAMS INTEGRATION
   */

  // Send task notification to Teams channel
  async sendTaskNotificationToTeams(
    teamId: string, 
    channelId: string, 
    task: TaskGridTask,
    action: 'created' | 'updated' | 'completed'
  ): Promise<void> {
    try {
      const actionEmoji = {
        created: '🆕',
        updated: '📝',
        completed: '✅'
      }

      const priorityColor = {
        High: '#ff4444',
        Medium: '#ffaa00', 
        Low: '#00aa44'
      }

      const message = {
        body: {
          contentType: 'html',
          content: `
            <div>
              <h3>${actionEmoji[action]} Task ${action.charAt(0).toUpperCase() + action.slice(1)}</h3>
              <div style="border-left: 4px solid ${priorityColor[task.priority]}; padding-left: 12px; margin: 8px 0;">
                <h4>${task.title}</h4>
                <p><strong>Priority:</strong> ${task.priority}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
                ${task.dueDate ? `<p><strong>Due:</strong> ${task.dueDate.toLocaleDateString()}</p>` : ''}
                ${task.assigneeEmail ? `<p><strong>Assigned to:</strong> ${task.assigneeEmail}</p>` : ''}
              </div>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}">View in TaskGrid →</a></p>
            </div>
          `
        }
      }

      await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post(message)

    } catch (error) {
      console.error('Error sending Teams notification:', error)
      throw new Error('Failed to send Teams notification')
    }
  }

  // Get Teams channels for project integration
  async getTeamsChannels(teamId: string): Promise<Array<{id: string, displayName: string}>> {
    try {
      const channels = await this.client
        .api(`/teams/${teamId}/channels`)
        .select('id,displayName,description')
        .get()

      return channels.value.map((channel: any) => ({
        id: channel.id,
        displayName: channel.displayName
      }))
    } catch (error) {
      console.error('Error fetching Teams channels:', error)
      return []
    }
  }

  /**
   * ONEDRIVE INTEGRATION
   */

  // Upload TaskGrid export to OneDrive
  async uploadProjectExportToOneDrive(
    userEmail: string,
    projectData: any,
    fileName: string
  ): Promise<string> {
    try {
      const jsonData = JSON.stringify(projectData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })

      const uploadSession = await this.client
        .api(`/users/${userEmail}/drive/root:/${fileName}:/createUploadSession`)
        .post({
          item: {
            '@microsoft.graph.conflictBehavior': 'rename',
            name: fileName
          }
        })

      // For small files, we can upload directly
      if (blob.size < 4 * 1024 * 1024) { // 4MB
        const response = await this.client
          .api(`/users/${userEmail}/drive/root:/${fileName}:/content`)
          .put(jsonData)
        
        return response.webUrl
      }

      // For larger files, use the upload session
      return uploadSession.uploadUrl
    } catch (error) {
      console.error('Error uploading to OneDrive:', error)
      throw new Error('Failed to upload to OneDrive')
    }
  }

  /**
   * OUTLOOK EMAIL INTEGRATION
   */

  // Send task assignment email
  async sendTaskAssignmentEmail(
    senderEmail: string,
    recipientEmail: string,
    task: TaskGridTask
  ): Promise<void> {
    try {
      const message = {
        subject: `📋 New Task Assigned: ${task.title}`,
        body: {
          contentType: 'HTML',
          content: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">📋 New Task Assigned</h2>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
                <h3 style="color: #333; margin-top: 0;">${task.title}</h3>
                
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid ${
                  task.priority === 'High' ? '#ff4444' : 
                  task.priority === 'Medium' ? '#ffaa00' : '#00aa44'
                };">
                  <p><strong>Priority:</strong> <span style="color: ${
                    task.priority === 'High' ? '#ff4444' : 
                    task.priority === 'Medium' ? '#ffaa00' : '#00aa44'
                  };">${task.priority}</span></p>
                  
                  ${task.description ? `<p><strong>Description:</strong><br>${task.description}</p>` : ''}
                  
                  ${task.dueDate ? `<p><strong>Due Date:</strong> ${task.dueDate.toLocaleDateString()}</p>` : ''}
                  
                  <p><strong>Status:</strong> ${task.status.replace('_', ' ').toUpperCase()}</p>
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}" 
                     style="background: #007acc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    View Task in TaskGrid
                  </a>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                  This task was assigned to you via TaskGrid. 
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications">Manage notification preferences</a>
                </p>
              </div>
            </div>
          `
        },
        toRecipients: [{
          emailAddress: {
            address: recipientEmail
          }
        }],
        importance: task.priority === 'High' ? 'high' : 'normal'
      }

      await this.client
        .api(`/users/${senderEmail}/sendMail`)
        .post({ message })

    } catch (error) {
      console.error('Error sending task assignment email:', error)
      throw new Error('Failed to send task assignment email')
    }
  }

  /**
   * TO-DO INTEGRATION
   */

  // Sync TaskGrid tasks to Microsoft To-Do
  async syncTaskToMicrosoftToDo(userEmail: string, task: TaskGridTask, listId?: string): Promise<string> {
    try {
      // Get or create TaskGrid task list
      let taskListId = listId
      if (!taskListId) {
        const lists = await this.client.api(`/users/${userEmail}/todo/lists`).get()
        let taskGridList = lists.value.find((list: any) => list.displayName === 'TaskGrid Tasks')
        
        if (!taskGridList) {
          taskGridList = await this.client.api(`/users/${userEmail}/todo/lists`).post({
            displayName: 'TaskGrid Tasks'
          })
        }
        
        taskListId = taskGridList.id
      }

      const todoTask = {
        title: task.title,
        body: {
          content: task.description || '',
          contentType: 'text'
        },
        dueDateTime: task.dueDate ? {
          dateTime: task.dueDate.toISOString(),
          timeZone: 'UTC'
        } : null,
        importance: task.priority === 'High' ? 'high' : task.priority === 'Medium' ? 'normal' : 'low',
        status: task.status === 'completed' ? 'completed' : 'notStarted'
      }

      const response = await this.client
        .api(`/users/${userEmail}/todo/lists/${taskListId}/tasks`)
        .post(todoTask)

      return response.id
    } catch (error) {
      console.error('Error syncing task to Microsoft To-Do:', error)
      throw new Error('Failed to sync task to Microsoft To-Do')
    }
  }

  /**
   * POWER AUTOMATE INTEGRATION
   */

  // Trigger Power Automate flow for task events
  async triggerPowerAutomateFlow(
    flowUrl: string,
    task: TaskGridTask,
    action: string,
    userEmail: string
  ): Promise<void> {
    try {
      const payload = {
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskPriority: task.priority,
        taskStatus: task.status,
        taskDueDate: task.dueDate?.toISOString(),
        taskAssignee: task.assigneeEmail,
        action: action,
        userEmail: userEmail,
        timestamp: new Date().toISOString(),
        taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`
      }

      const response = await fetch(flowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Power Automate flow failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error triggering Power Automate flow:', error)
      throw new Error('Failed to trigger Power Automate flow')
    }
  }
}

/**
 * Office 365 Authentication Helper
 */
export class Office365Auth {
  private config: Office365Config

  constructor(config: Office365Config) {
    this.config = config
  }

  // Get authorization URL for OAuth flow
  getAuthorizationUrl(state?: string): string {
    const scopes = [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Tasks.ReadWrite',
      'https://graph.microsoft.com/Files.ReadWrite',
      'https://graph.microsoft.com/ChannelMessage.Send',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/offline_access'
    ].join(' ')

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: scopes,
      response_mode: 'query',
      state: state || ''
    })

    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params}`
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: number
  }> {
    try {
      const response = await fetch(`https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: code,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to get access token')
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in
      }
    } catch (error) {
      console.error('Error getting access token:', error)
      throw error
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: number
  }> {
    try {
      const response = await fetch(`https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to refresh access token')
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in
      }
    } catch (error) {
      console.error('Error refreshing access token:', error)
      throw error
    }
  }
}
