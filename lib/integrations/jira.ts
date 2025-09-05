interface JiraConfig {
  baseUrl: string
  email: string
  apiToken: string
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

interface JiraIssue {
  id: string
  key: string
  summary: string
  description?: string
  status: string
  priority: string
  assignee?: string
  reporter?: string
  created: string
  updated: string
  duedate?: string
  issueType: string
  project: string
}

interface JiraProject {
  id: string
  key: string
  name: string
  description?: string
  lead: string
  issueTypes: Array<{
    id: string
    name: string
    description: string
  }>
}

export class JiraIntegration {
  private config: JiraConfig
  private baseUrl: string

  constructor(config: JiraConfig) {
    this.config = config
    this.baseUrl = `${config.baseUrl}/rest/api/3`
  }

  /**
   * ISSUE MANAGEMENT
   */

  // Create Jira issue from TaskWork task
  async createIssueFromTask(
    task: TaskWorkTask,
    projectKey: string,
    issueType: string = 'Task'
  ): Promise<JiraIssue> {
    try {
      const issueData = {
        fields: {
          project: { key: projectKey },
          summary: task.title,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: task.description || 'Created from TaskWork'
                  }
                ]
              }
            ]
          },
          issuetype: { name: issueType },
          priority: { name: this.mapPriorityToJira(task.priority) },
          ...(task.assigneeEmail && {
            assignee: { emailAddress: task.assigneeEmail }
          }),
          ...(task.dueDate && {
            duedate: task.dueDate.toISOString().split('T')[0]
          }),
          customfield_10000: task.id // Store TaskWork task ID
        }
      }

      const response = await this.makeRequest('POST', '/issue', issueData)
      
      return await this.getIssueById(response.id)
    } catch (error) {
      console.error('Error creating Jira issue:', error)
      throw new Error('Failed to create Jira issue')
    }
  }

  // Sync TaskWork task to existing Jira issue
  async syncTaskToIssue(task: TaskWorkTask, issueKey: string): Promise<void> {
    try {
      const updateData = {
        fields: {
          summary: task.title,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: task.description || 'Updated from TaskWork'
                  }
                ]
              }
            ]
          },
          priority: { name: this.mapPriorityToJira(task.priority) },
          ...(task.assigneeEmail && {
            assignee: { emailAddress: task.assigneeEmail }
          }),
          ...(task.dueDate && {
            duedate: task.dueDate.toISOString().split('T')[0]
          })
        }
      }

      await this.makeRequest('PUT', `/issue/${issueKey}`, updateData)

      // Update status if needed
      const statusTransition = this.mapStatusToJiraTransition(task.status)
      if (statusTransition) {
        await this.transitionIssue(issueKey, statusTransition)
      }

    } catch (error) {
      console.error('Error syncing task to Jira:', error)
      throw new Error('Failed to sync task to Jira')
    }
  }

  // Get Jira issues and convert to TaskWork tasks
  async getIssuesAsTaskWorkTasks(projectKey: string): Promise<TaskWorkTask[]> {
    try {
      const jql = `project = ${projectKey} ORDER BY created DESC`
      const response = await this.makeRequest('POST', '/search', {
        jql,
        fields: ['summary', 'description', 'status', 'priority', 'assignee', 'duedate', 'created', 'updated'],
        maxResults: 100
      })

      return response.issues.map((issue: any): TaskWorkTask => ({
        id: `jira_${issue.key}`,
        title: issue.fields.summary,
        description: this.extractDescriptionText(issue.fields.description),
        dueDate: issue.fields.duedate ? new Date(issue.fields.duedate) : undefined,
        priority: this.mapJiraPriorityToTaskWork(issue.fields.priority?.name || 'Medium'),
        status: this.mapJiraStatusToTaskWork(issue.fields.status?.name || 'To Do'),
        assigneeEmail: issue.fields.assignee?.emailAddress
      }))

    } catch (error) {
      console.error('Error fetching Jira issues:', error)
      return []
    }
  }

  // Get single issue by ID
  async getIssueById(issueId: string): Promise<JiraIssue> {
    try {
      const response = await this.makeRequest('GET', `/issue/${issueId}`)
      
      return {
        id: response.id,
        key: response.key,
        summary: response.fields.summary,
        description: this.extractDescriptionText(response.fields.description),
        status: response.fields.status.name,
        priority: response.fields.priority?.name || 'Medium',
        assignee: response.fields.assignee?.displayName,
        reporter: response.fields.reporter?.displayName,
        created: response.fields.created,
        updated: response.fields.updated,
        duedate: response.fields.duedate,
        issueType: response.fields.issuetype.name,
        project: response.fields.project.key
      }
    } catch (error) {
      console.error('Error fetching Jira issue:', error)
      throw new Error('Failed to fetch Jira issue')
    }
  }

  // Transition issue status
  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    try {
      await this.makeRequest('POST', `/issue/${issueKey}/transitions`, {
        transition: { id: transitionId }
      })
    } catch (error) {
      console.error('Error transitioning Jira issue:', error)
      throw new Error('Failed to transition Jira issue')
    }
  }

  /**
   * PROJECT MANAGEMENT
   */

  // Get all projects
  async getProjects(): Promise<JiraProject[]> {
    try {
      const response = await this.makeRequest('GET', '/project')
      
      return response.map((project: any): JiraProject => ({
        id: project.id,
        key: project.key,
        name: project.name,
        description: project.description,
        lead: project.lead?.displayName || 'Unknown',
        issueTypes: project.issueTypes?.map((type: any) => ({
          id: type.id,
          name: type.name,
          description: type.description || ''
        })) || []
      }))
    } catch (error) {
      console.error('Error fetching Jira projects:', error)
      return []
    }
  }

  // Create new project
  async createProject(
    name: string,
    key: string,
    description?: string,
    leadAccountId?: string
  ): Promise<JiraProject> {
    try {
      const projectData = {
        key,
        name,
        projectTypeKey: 'software',
        description: description || `Created from TaskWork: ${name}`,
        leadAccountId: leadAccountId || await this.getCurrentUserAccountId(),
        assigneeType: 'PROJECT_LEAD'
      }

      const response = await this.makeRequest('POST', '/project', projectData)
      
      return {
        id: response.id,
        key: response.key,
        name: response.name,
        description: response.description,
        lead: response.lead?.displayName || 'Unknown',
        issueTypes: []
      }
    } catch (error) {
      console.error('Error creating Jira project:', error)
      throw new Error('Failed to create Jira project')
    }
  }

  /**
   * SPRINTS & AGILE
   */

  // Get active sprints for a project
  async getActiveSprints(projectKey: string): Promise<Array<{
    id: string
    name: string
    state: string
    startDate?: string
    endDate?: string
    goal?: string
  }>> {
    try {
      // First get the board for the project
      const boardsResponse = await this.makeRequest('GET', '/agile/1.0/board', {
        projectKeyOrId: projectKey
      })

      if (!boardsResponse.values.length) {
        return []
      }

      const boardId = boardsResponse.values[0].id
      
      // Get sprints for the board
      const sprintsResponse = await this.makeRequest('GET', `/agile/1.0/board/${boardId}/sprint`, {
        state: 'active,future'
      })

      return sprintsResponse.values.map((sprint: any) => ({
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        goal: sprint.goal
      }))

    } catch (error) {
      console.error('Error fetching active sprints:', error)
      return []
    }
  }

  // Add issues to sprint
  async addIssuesToSprint(sprintId: string, issueKeys: string[]): Promise<void> {
    try {
      await this.makeRequest('POST', `/agile/1.0/sprint/${sprintId}/issue`, {
        issues: issueKeys
      })
    } catch (error) {
      console.error('Error adding issues to sprint:', error)
      throw new Error('Failed to add issues to sprint')
    }
  }

  /**
   * REPORTING & ANALYTICS
   */

  // Get project velocity (completed story points over time)
  async getProjectVelocity(projectKey: string, sprintCount: number = 5): Promise<Array<{
    sprintName: string
    completedStoryPoints: number
    sprintEndDate: string
  }>> {
    try {
      // Get completed sprints
      const boardsResponse = await this.makeRequest('GET', '/agile/1.0/board', {
        projectKeyOrId: projectKey
      })

      if (!boardsResponse.values.length) {
        return []
      }

      const boardId = boardsResponse.values[0].id
      
      const sprintsResponse = await this.makeRequest('GET', `/agile/1.0/board/${boardId}/sprint`, {
        state: 'closed',
        maxResults: sprintCount
      })

      const velocityData = []
      
      for (const sprint of sprintsResponse.values) {
        const sprintReport = await this.makeRequest('GET', `/agile/1.0/rapid/charts/velocity`, {
          rapidViewId: boardId,
          sprintId: sprint.id
        })

        velocityData.push({
          sprintName: sprint.name,
          completedStoryPoints: sprintReport.completedIssuesEstimateSum?.value || 0,
          sprintEndDate: sprint.endDate
        })
      }

      return velocityData
    } catch (error) {
      console.error('Error fetching project velocity:', error)
      return []
    }
  }

  // Get burndown data for current sprint
  async getCurrentSprintBurndown(projectKey: string): Promise<{
    sprintName: string
    totalStoryPoints: number
    remainingStoryPoints: number
    daysRemaining: number
    burndownData: Array<{
      date: string
      remaining: number
      ideal: number
    }>
  } | null> {
    try {
      const activeSprints = await this.getActiveSprints(projectKey)
      const currentSprint = activeSprints.find(s => s.state === 'active')
      
      if (!currentSprint) {
        return null
      }

      // This would require additional Jira API calls to get detailed burndown data
      // For now, return a basic structure
      return {
        sprintName: currentSprint.name,
        totalStoryPoints: 0,
        remainingStoryPoints: 0,
        daysRemaining: 0,
        burndownData: []
      }
    } catch (error) {
      console.error('Error fetching burndown data:', error)
      return null
    }
  }

  /**
   * WEBHOOKS & AUTOMATION
   */

  // Create webhook for Jira issue updates
  async createWebhook(
    name: string,
    url: string,
    events: string[] = ['jira:issue_created', 'jira:issue_updated', 'jira:issue_deleted']
  ): Promise<string> {
    try {
      const webhookData = {
        name,
        url,
        events,
        filters: {
          'issue-related-events-section': {}
        }
      }

      const response = await this.makeRequest('POST', '/webhook', webhookData)
      return response.self
    } catch (error) {
      console.error('Error creating Jira webhook:', error)
      throw new Error('Failed to create Jira webhook')
    }
  }

  /**
   * UTILITY METHODS
   */

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    let url = `${this.baseUrl}${endpoint}`
    const auth = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64')

    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data)
    }

    if (data && method === 'GET') {
      const params = new URLSearchParams(data)
      const separator = url.includes('?') ? '&' : '?'
      url += separator + params.toString()
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Jira API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  }

  private async getCurrentUserAccountId(): Promise<string> {
    try {
      const response = await this.makeRequest('GET', '/myself')
      return response.accountId
    } catch (error) {
      console.error('Error getting current user:', error)
      return ''
    }
  }

  private mapPriorityToJira(priority: 'High' | 'Medium' | 'Low'): string {
    const mapping = {
      'High': 'High',
      'Medium': 'Medium', 
      'Low': 'Low'
    }
    return mapping[priority] || 'Medium'
  }

  private mapJiraPriorityToTaskWork(jiraPriority: string): 'High' | 'Medium' | 'Low' {
    const priority = jiraPriority.toLowerCase()
    if (priority.includes('high') || priority.includes('critical') || priority.includes('blocker')) {
      return 'High'
    } else if (priority.includes('low') || priority.includes('minor')) {
      return 'Low'
    }
    return 'Medium'
  }

  private mapStatusToJiraTransition(status: string): string | null {
    // These would need to be configured based on the Jira workflow
    const mapping: Record<string, string> = {
      'pending': '11', // To Do
      'in_progress': '21', // In Progress
      'completed': '31' // Done
    }
    return mapping[status] || null
  }

  private mapJiraStatusToTaskWork(jiraStatus: string): 'pending' | 'in_progress' | 'completed' {
    const status = jiraStatus.toLowerCase()
    if (status.includes('progress') || status.includes('review')) {
      return 'in_progress'
    } else if (status.includes('done') || status.includes('closed') || status.includes('resolved')) {
      return 'completed'
    }
    return 'pending'
  }

  private extractDescriptionText(description: any): string | undefined {
    if (!description) return undefined
    
    // Handle Atlassian Document Format (ADF)
    if (description.type === 'doc' && description.content) {
      let text = ''
      const extractText = (content: any[]): string => {
        return content.map((item: any) => {
          if (item.type === 'text') {
            return item.text
          } else if (item.content) {
            return extractText(item.content)
          }
          return ''
        }).join('')
      }
      
      return extractText(description.content)
    }
    
    // Handle plain text
    return typeof description === 'string' ? description : undefined
  }

  // Get available issue types for a project
  async getIssueTypes(projectKey: string): Promise<Array<{
    id: string
    name: string
    description: string
  }>> {
    try {
      const response = await this.makeRequest('GET', `/project/${projectKey}`)
      
      return response.issueTypes.map((type: any) => ({
        id: type.id,
        name: type.name,
        description: type.description || ''
      }))
    } catch (error) {
      console.error('Error fetching issue types:', error)
      return []
    }
  }

  // Get project users
  async getProjectUsers(projectKey: string): Promise<Array<{
    accountId: string
    displayName: string
    emailAddress: string
  }>> {
    try {
      const response = await this.makeRequest('GET', '/user/assignable/multiProjectSearch', {
        projectKeys: projectKey,
        maxResults: 100
      })

      return response.map((user: any) => ({
        accountId: user.accountId,
        displayName: user.displayName,
        emailAddress: user.emailAddress
      }))
    } catch (error) {
      console.error('Error fetching project users:', error)
      return []
    }
  }
}

// Minimal wrapper used by API route; implement when Jira config is set up
export async function createJiraIssue(args: {
  projectKey: string
  summary: string
  description?: string
  issueType?: string
  priority?: string
  labels?: string[]
  dueDate?: string
}): Promise<{ key: string; self: string }> {
  // Placeholder implementation to satisfy build-time imports.
  // Replace with real call using JiraIntegration once credentials are configured.
  console.warn('createJiraIssue called without Jira configuration. Returning placeholder.');
  return { key: 'JIRA-000', self: 'https://example.atlassian.net/browse/JIRA-000' }
}

