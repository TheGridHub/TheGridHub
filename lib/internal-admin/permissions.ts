export type InternalAction =
  | 'user.delete'
  | 'project.delete'
  | 'team_membership.delete'
  | 'tasks.bulk_delete'
  | 'goals.bulk_delete'
  | 'notifications.bulk_delete'
  | 'notifications.bulk_update'
  | 'integrations.slack.test'
  | 'integrations.google.test'
  | 'integrations.microsoft.test'
  | 'integrations.jira.test'

export function canPerform(role: 'owner'|'operator', action: InternalAction) {
  const destructive: InternalAction[] = [
    'user.delete',
    'project.delete',
    'team_membership.delete',
    'tasks.bulk_delete',
    'goals.bulk_delete',
    'notifications.bulk_delete',
  ]
  const nonDestructive: InternalAction[] = [
    'notifications.bulk_update',
    'integrations.slack.test',
    'integrations.google.test',
    'integrations.microsoft.test',
    'integrations.jira.test',
  ]
  if (role === 'owner') return true
  // operator can only do non-destructive
  return nonDestructive.includes(action)
}

