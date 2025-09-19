/**
 * Permission utilities for checking user roles and feature access
 */

import { UserRole, PlanType } from '@/lib/types/database'

// Role hierarchy (higher numbers have more permissions)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
}

// Plan hierarchy (higher numbers have more features)
const PLAN_HIERARCHY: Record<PlanType, number> = {
  free: 1,
  pro: 2,
  enterprise: 3,
}

// Permission types
export type Permission = 
  | 'view_dashboard'
  | 'view_analytics'
  | 'manage_projects'
  | 'manage_tasks'
  | 'manage_contacts'
  | 'manage_companies'
  | 'manage_notes'
  | 'manage_team'
  | 'manage_billing'
  | 'manage_settings'
  | 'manage_integrations'
  | 'manage_api_tokens'
  | 'manage_webhooks'
  | 'view_audit_logs'
  | 'export_data'
  | 'delete_data'
  | 'invite_members'
  | 'remove_members'
  | 'change_member_roles'
  | 'access_advanced_features'
  | 'use_custom_fields'
  | 'use_advanced_reporting'
  | 'use_sso'
  | 'priority_support'

// Role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  member: [
    'view_dashboard',
    'view_analytics',
    'manage_projects',
    'manage_tasks',
    'manage_contacts',
    'manage_companies',
    'manage_notes',
    'export_data',
  ],
  admin: [
    'view_dashboard',
    'view_analytics',
    'manage_projects',
    'manage_tasks',
    'manage_contacts',
    'manage_companies',
    'manage_notes',
    'manage_team',
    'manage_settings',
    'manage_integrations',
    'export_data',
    'delete_data',
    'invite_members',
    'remove_members',
    'change_member_roles',
  ],
  owner: [
    'view_dashboard',
    'view_analytics',
    'manage_projects',
    'manage_tasks',
    'manage_contacts',
    'manage_companies',
    'manage_notes',
    'manage_team',
    'manage_billing',
    'manage_settings',
    'manage_integrations',
    'manage_api_tokens',
    'manage_webhooks',
    'view_audit_logs',
    'export_data',
    'delete_data',
    'invite_members',
    'remove_members',
    'change_member_roles',
  ],
}

// Plan-based permissions
const PLAN_PERMISSIONS: Record<PlanType, Permission[]> = {
  free: [
    'view_dashboard',
    'view_analytics',
    'manage_projects',
    'manage_tasks',
    'manage_contacts',
    'manage_companies',
    'manage_notes',
    'export_data',
  ],
  pro: [
    'view_dashboard',
    'view_analytics',
    'manage_projects',
    'manage_tasks',
    'manage_contacts',
    'manage_companies',
    'manage_notes',
    'manage_team',
    'manage_settings',
    'manage_integrations',
    'manage_api_tokens',
    'export_data',
    'delete_data',
    'invite_members',
    'remove_members',
    'change_member_roles',
    'access_advanced_features',
    'use_custom_fields',
    'use_advanced_reporting',
    'priority_support',
  ],
  enterprise: [
    'view_dashboard',
    'view_analytics',
    'manage_projects',
    'manage_tasks',
    'manage_contacts',
    'manage_companies',
    'manage_notes',
    'manage_team',
    'manage_billing',
    'manage_settings',
    'manage_integrations',
    'manage_api_tokens',
    'manage_webhooks',
    'view_audit_logs',
    'export_data',
    'delete_data',
    'invite_members',
    'remove_members',
    'change_member_roles',
    'access_advanced_features',
    'use_custom_fields',
    'use_advanced_reporting',
    'use_sso',
    'priority_support',
  ],
}

// Check if a role has a specific permission
export function hasRolePermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Check if a plan has a specific permission
export function hasPlanPermission(plan: PlanType, permission: Permission): boolean {
  return PLAN_PERMISSIONS[plan]?.includes(permission) ?? false
}

// Check if user has permission (both role and plan must allow it)
export function hasPermission(
  role: UserRole, 
  plan: PlanType, 
  permission: Permission
): boolean {
  return hasRolePermission(role, permission) && hasPlanPermission(plan, permission)
}

// Check if user can perform action on resource
export function canManageResource(
  userRole: UserRole,
  resourceOwnerRole: UserRole,
  action: 'view' | 'edit' | 'delete'
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole]
  const resourceLevel = ROLE_HIERARCHY[resourceOwnerRole]

  switch (action) {
    case 'view':
      // Members can view resources from same level or below
      return userLevel >= resourceLevel || userLevel >= ROLE_HIERARCHY.member
    case 'edit':
      // Admins and owners can edit, members can edit their own resources
      return userLevel >= resourceLevel || userLevel >= ROLE_HIERARCHY.admin
    case 'delete':
      // Only owners can delete owner resources, admins can delete member resources
      return userLevel > resourceLevel || userLevel >= ROLE_HIERARCHY.owner
    default:
      return false
  }
}

// Check if user can invite/manage team members
export function canManageTeamMember(
  userRole: UserRole,
  targetRole: UserRole,
  action: 'invite' | 'edit' | 'remove'
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole]
  const targetLevel = ROLE_HIERARCHY[targetRole]

  switch (action) {
    case 'invite':
      // Admins and owners can invite, but can't invite roles higher than themselves
      return userLevel >= ROLE_HIERARCHY.admin && userLevel >= targetLevel
    case 'edit':
      // Users can only edit roles lower than themselves
      return userLevel > targetLevel
    case 'remove':
      // Users can only remove roles lower than themselves
      return userLevel > targetLevel
    default:
      return false
  }
}

// Check if user can access billing features
export function canAccessBilling(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'manage_billing')
}

// Check if user can manage integrations
export function canManageIntegrations(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'manage_integrations')
}

// Check if user can manage API tokens
export function canManageApiTokens(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'manage_api_tokens')
}

// Check if user can view analytics
export function canViewAnalytics(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'view_analytics')
}

// Check if user can use advanced features
export function canUseAdvancedFeatures(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'access_advanced_features')
}

// Check if user can use custom fields
export function canUseCustomFields(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'use_custom_fields')
}

// Check if user can use advanced reporting
export function canUseAdvancedReporting(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'use_advanced_reporting')
}

// Check if user can use SSO
export function canUseSSO(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'use_sso')
}

// Check if user has priority support
export function hasPrioritySupport(role: UserRole, plan: PlanType): boolean {
  return hasPermission(role, plan, 'priority_support')
}

// Get all permissions for a role and plan combination
export function getUserPermissions(role: UserRole, plan: PlanType): Permission[] {
  const rolePermissions = ROLE_PERMISSIONS[role] || []
  const planPermissions = PLAN_PERMISSIONS[plan] || []
  
  // Return intersection of role and plan permissions
  return rolePermissions.filter(permission => planPermissions.includes(permission))
}

// Check if user needs to upgrade plan for a permission
export function needsUpgradeForPermission(permission: Permission, currentPlan: PlanType): boolean {
  return !hasPlanPermission(currentPlan, permission)
}

// Get minimum plan required for a permission
export function getMinimumPlanForPermission(permission: Permission): PlanType | null {
  for (const [plan, permissions] of Object.entries(PLAN_PERMISSIONS)) {
    if (permissions.includes(permission)) {
      return plan as PlanType
    }
  }
  return null
}

// Check if user role is sufficient for permission
export function isRoleSufficientForPermission(permission: Permission, role: UserRole): boolean {
  return hasRolePermission(role, permission)
}

// Get minimum role required for a permission
export function getMinimumRoleForPermission(permission: Permission): UserRole | null {
  for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    if (permissions.includes(permission)) {
      return role as UserRole
    }
  }
  return null
}

// Utility functions for common permission checks
export const PermissionChecks = {
  canCreateProject: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'manage_projects'),
  canEditProject: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'manage_projects'),
  canDeleteProject: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'delete_data'),
  
  canCreateTask: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'manage_tasks'),
  canEditTask: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'manage_tasks'),
  canDeleteTask: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'delete_data'),
  
  canManageContacts: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'manage_contacts'),
  canManageCompanies: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'manage_companies'),
  canManageNotes: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'manage_notes'),
  
  canInviteMembers: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'invite_members'),
  canRemoveMembers: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'remove_members'),
  canChangeRoles: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'change_member_roles'),
  
  canExportData: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'export_data'),
  canViewAuditLogs: (role: UserRole, plan: PlanType) => hasPermission(role, plan, 'view_audit_logs'),
}
