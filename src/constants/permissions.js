export const MANAGEMENT_ROLES = ['academy_coordinator', 'admin']
export const MANAGEMENT_OR_COUNTRY_ROLES = [
  'academy_coordinator',
  'country_manager',
  'admin',
]
export const PROFILE_ROLES = ['teacher', 'assistant']
export const IMAGE_VIEWER_ROLES = ['academy_coordinator', 'admin']

export const canManageCourses = (role) =>
  MANAGEMENT_OR_COUNTRY_ROLES.includes(role)

export const canImpersonateMentor = (role) => MANAGEMENT_ROLES.includes(role)

export const canSeeOwnProfile = (role) => PROFILE_ROLES.includes(role)

export const canViewCommentImages = (role) => IMAGE_VIEWER_ROLES.includes(role)
