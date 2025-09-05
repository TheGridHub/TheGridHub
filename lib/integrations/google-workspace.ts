import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

interface GoogleWorkspaceConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

interface TheGridHubTask {
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
  summary: string
  start: Date
  end: Date
  attendees?: string[]
  location?: string
}

export class GoogleWorkspaceIntegration {
  private oauth2Client: OAuth2Client
  private config: GoogleWorkspaceConfig

  constructor(config: GoogleWorkspaceConfig, accessToken: string, refreshToken?: string) {
    this.config = config
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    // Set up automatic token refresh
    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        // Store the new refresh token
        console.log('New refresh token received:', tokens.refresh_token)
      }
    })
  }

  /**
   * GOOGLE CALENDAR INTEGRATION
   */

  // Create calendar event from TaskWork task
async createCalendarEventFromTask(task: TheGridHubTask, calendarId: string = 'primary'): Promise<string> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

      const event = {
        summary: `📋 ${task.title}`,
        description: `
TheGridHub Task: ${task.title}

Description: ${task.description || 'No description'}
Priority: ${task.priority}
Status: ${task.status}

View in TheGridHub: ${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}
        `.trim(),
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
        attendees: task.assigneeEmail ? [{ email: task.assigneeEmail }] : [],
        colorId: task.priority === 'High' ? '11' : task.priority === 'Medium' ? '5' : '10', // Red, Yellow, Green
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'email', minutes: 60 }
          ]
        },
        extendedProperties: {
          private: {
TheGridHubId: task.id,
TheGridHubPriority: task.priority
          }
        }
      }

      const response = await calendar.events.insert({
        calendarId,
        requestBody: event
      })

      return response.data.id!
    } catch (error) {
      console.error('Error creating Google Calendar event:', error)
      throw new Error('Failed to create Google Calendar event')
    }
  }

  // Get upcoming calendar events
  async getUpcomingEvents(calendarId: string = 'primary', days: number = 7): Promise<CalendarEvent[]> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

      const response = await calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
      })

      return response.data.items?.map(event => ({
        id: event.id!,
        summary: event.summary || 'No title',
        start: new Date(event.start?.dateTime || event.start?.date || ''),
        end: new Date(event.end?.dateTime || event.end?.date || ''),
        attendees: event.attendees?.map(a => a.email!).filter(Boolean) || [],
        location: event.location
      })) || []
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error)
      return []
    }
  }

  /**
   * GMAIL INTEGRATION
   */

  // Send task assignment email via Gmail
async sendTaskAssignmentEmail(
    recipientEmail: string,
    task: TheGridHubTask
  ): Promise<void> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

      const subject = `📋 New Task Assigned: ${task.title}`
      const htmlBody = `
        <div style="font-family: 'Google Sans', Roboto, Arial, sans-serif; max-width: 600px;">
          <div style="background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); padding: 24px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; font-size: 24px;">📋 New Task Assigned</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #202124; margin-top: 0; font-size: 20px;">${task.title}</h3>
            
            <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid ${
              task.priority === 'High' ? '#ea4335' : 
              task.priority === 'Medium' ? '#fbbc04' : '#34a853'
            }; margin: 16px 0;">
              <p style="margin: 8px 0;"><strong>Priority:</strong> 
                <span style="color: ${
                  task.priority === 'High' ? '#ea4335' : 
                  task.priority === 'Medium' ? '#fbbc04' : '#34a853'
                }; font-weight: 500;">${task.priority}</span>
              </p>
              
              ${task.description ? `<p style="margin: 8px 0;"><strong>Description:</strong><br>${task.description}</p>` : ''}
              
              ${task.dueDate ? `<p style="margin: 8px 0;"><strong>Due Date:</strong> ${task.dueDate.toLocaleDateString()}</p>` : ''}
              
              <p style="margin: 8px 0;"><strong>Status:</strong> ${task.status.replace('_', ' ').toUpperCase()}</p>
            </div>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}" 
                 style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: 500; display: inline-block;">
View Task in TheGridHub
              </a>
            </div>
            
            <p style="color: #5f6368; font-size: 12px; margin-top: 24px; border-top: 1px solid #dadce0; padding-top: 16px;">
              This task was assigned to you via TaskWork. 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color: #4285f4;">Manage notification preferences</a>
            </p>
          </div>
        </div>
      `

      const textBody = `
New Task Assigned: ${task.title}

Priority: ${task.priority}
Status: ${task.status}
${task.description ? `Description: ${task.description}` : ''}
${task.dueDate ? `Due Date: ${task.dueDate.toLocaleDateString()}` : ''}

View in TheGridHub: ${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}

This task was assigned to you via TheGridHub.
      `.trim()

      // Create the email message
      const message = [
        `To: ${recipientEmail}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="boundary123"',
        '',
        '--boundary123',
        'Content-Type: text/plain; charset=UTF-8',
        '',
        textBody,
        '',
        '--boundary123',
        'Content-Type: text/html; charset=UTF-8',
        '',
        htmlBody,
        '',
        '--boundary123--'
      ].join('\n')

      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      })

    } catch (error) {
      console.error('Error sending Gmail:', error)
      throw new Error('Failed to send task assignment email')
    }
  }

  /**
   * GOOGLE TASKS INTEGRATION
   */

  // Sync TaskWork task to Google Tasks
async syncTaskToGoogleTasks(task: TheGridHubTask, taskListId?: string): Promise<string> {
    try {
      const tasks = google.tasks({ version: 'v1', auth: this.oauth2Client })

      // Get or create TaskWork task list
      let listId = taskListId
      if (!listId) {
        const taskLists = await tasks.tasklists.list()
        let TaskWorkList = taskLists.data.items?.find(list => list.title === 'TheGridHub Tasks')
        
        if (!TaskWorkList) {
          const newList = await tasks.tasklists.insert({
            requestBody: {
            title: 'TheGridHub Tasks'
            }
          })
          TaskWorkList = newList.data
        }
        
        listId = TaskWorkList.id!
      }

      const googleTask = {
        title: task.title,
        notes: `${task.description || ''}\n\nPriority: ${task.priority}\nView in TheGridHub: ${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`,
        due: task.dueDate?.toISOString(),
        status: task.status === 'completed' ? 'completed' : 'needsAction'
      }

      const response = await tasks.tasks.insert({
        tasklist: listId,
        requestBody: googleTask
      })

      return response.data.id!
    } catch (error) {
      console.error('Error syncing to Google Tasks:', error)
      throw new Error('Failed to sync task to Google Tasks')
    }
  }

  /**
   * GOOGLE DRIVE INTEGRATION
   */

  // Upload TaskWork project export to Google Drive
  async uploadProjectExportToDrive(
    projectData: any,
    fileName: string,
    folderId?: string
  ): Promise<string> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client })

      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
description: 'TheGridHub project export'
      }

      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(projectData, null, 2)
      }

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink'
      })

      return response.data.webViewLink!
    } catch (error) {
      console.error('Error uploading to Google Drive:', error)
      throw new Error('Failed to upload to Google Drive')
    }
  }

  // Create shared folder for project collaboration
  async createProjectFolder(projectName: string, teamEmails: string[]): Promise<string> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client })

      // Create folder
      const folderMetadata = {
name: `TheGridHub - ${projectName}`
        mimeType: 'application/vnd.google-apps.folder',
description: `Shared folder for TheGridHub project: ${projectName}`
      }

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id,webViewLink'
      })

      const folderId = folder.data.id!

      // Share with team members
      for (const email of teamEmails) {
        await drive.permissions.create({
          fileId: folderId,
          requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: email
          },
          sendNotificationEmail: true
        })
      }

      return folder.data.webViewLink!
    } catch (error) {
      console.error('Error creating project folder:', error)
      throw new Error('Failed to create project folder')
    }
  }

  /**
   * GOOGLE CHAT INTEGRATION
   */

  // Send task notification to Google Chat space
async sendTaskNotificationToChat(
    spaceName: string,
    task: TheGridHubTask,
    action: 'created' | 'updated' | 'completed'
  ): Promise<void> {
    try {
      const chat = google.chat({ version: 'v1', auth: this.oauth2Client })

      const actionEmoji = {
        created: '🆕',
        updated: '📝',
        completed: '✅'
      }

      const priorityColor = {
        High: 'RED',
        Medium: 'YELLOW',
        Low: 'GREEN'
      }

      const message = {
        cards: [{
          header: {
            title: `${actionEmoji[action]} Task ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            subtitle: task.title,
            imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg`
          },
          sections: [{
            widgets: [
              {
                keyValue: {
                  topLabel: 'Priority',
                  content: task.priority,
                  contentMultiline: false,
                  icon: 'FLAG'
                }
              },
              {
                keyValue: {
                  topLabel: 'Status',
                  content: task.status.replace('_', ' ').toUpperCase(),
                  contentMultiline: false,
                  icon: 'CLOCK'
                }
              },
              ...(task.description ? [{
                keyValue: {
                  topLabel: 'Description',
                  content: task.description,
                  contentMultiline: true,
                  icon: 'DESCRIPTION'
                }
              }] : []),
              ...(task.dueDate ? [{
                keyValue: {
                  topLabel: 'Due Date',
                  content: task.dueDate.toLocaleDateString(),
                  contentMultiline: false,
                  icon: 'EVENT_SEAT'
                }
              }] : []),
              {
                buttons: [{
                  textButton: {
                    text: 'View in TheGridHub',
                    onClick: {
                      openLink: {
                        url: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`
                      }
                    }
                  }
                }]
              }
            ]
          }]
        }]
      }

      await chat.spaces.messages.create({
        parent: spaceName,
        requestBody: message
      })

    } catch (error) {
      console.error('Error sending Google Chat notification:', error)
      throw new Error('Failed to send Google Chat notification')
    }
  }

  /**
   * GOOGLE SHEETS INTEGRATION
   */

  // Export project data to Google Sheets
  async exportProjectToSheets(
    projectData: any,
    spreadsheetTitle: string,
    teamEmails: string[]
  ): Promise<string> {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client })
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client })

      // Create spreadsheet
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `TheGridHub - ${spreadsheetTitle}`,
            locale: 'en_US',
            timeZone: 'UTC'
          },
          sheets: [
            {
              properties: {
                title: 'Tasks',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10
                }
              }
            },
            {
              properties: {
                title: 'Team Performance',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 5
                }
              }
            }
          ]
        }
      })

      const spreadsheetId = spreadsheet.data.spreadsheetId!

      // Add task data
      const taskHeaders = ['Task ID', 'Title', 'Description', 'Priority', 'Status', 'Assignee', 'Due Date', 'Created', 'Updated']
      const taskRows = projectData.tasks?.map((task: any) => [
        task.id,
        task.title,
        task.description || '',
        task.priority,
        task.status,
        task.assigneeEmail || '',
        task.dueDate || '',
        task.createdAt || '',
        task.updatedAt || ''
      ]) || []

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Tasks!A1:I' + (taskRows.length + 1),
        valueInputOption: 'RAW',
        requestBody: {
          values: [taskHeaders, ...taskRows]
        }
      })

      // Share with team members
      for (const email of teamEmails) {
        await drive.permissions.create({
          fileId: spreadsheetId,
          requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: email
          },
          sendNotificationEmail: true
        })
      }

      // Get the web URL
      const file = await drive.files.get({
        fileId: spreadsheetId,
        fields: 'webViewLink'
      })

      return file.data.webViewLink!
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error)
      throw new Error('Failed to export to Google Sheets')
    }
  }
}

/**
 * Google Workspace Authentication Helper
 */
export class GoogleWorkspaceAuth {
  private oauth2Client: OAuth2Client
  private config: GoogleWorkspaceConfig

  constructor(config: GoogleWorkspaceConfig) {
    this.config = config
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    )
  }

  // Get authorization URL for OAuth flow
  getAuthorizationUrl(state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/chat.messages',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/userinfo.email'
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state,
      prompt: 'consent'
    })
  }

  // Exchange authorization code for tokens
  async getTokens(code: string): Promise<{
    accessToken: string
    refreshToken: string
    expiryDate: number
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code)

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiryDate: tokens.expiry_date!
      }
    } catch (error) {
      console.error('Error getting tokens:', error)
      throw error
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string
    expiryDate: number
  }> {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken })
      const { credentials } = await this.oauth2Client.refreshAccessToken()

      return {
        accessToken: credentials.access_token!,
        expiryDate: credentials.expiry_date!
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  }
}

