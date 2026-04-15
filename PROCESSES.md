# Flare UI — End-to-End Process Documentation

This document maps every frontend component to the backend API calls it makes.

---

## Architecture Overview

| Layer | Technology | Role |
|---|---|---|
| HTTP client | Axios (`src/shared/api/client.ts`) | Centralized request/response handling |
| Server state | React Query | Caching, loading, error states for API data |
| Auth state | Zustand (`authStore`) | Current user, session, login/logout |
| Validation | Zod | Schema validation on all forms before submission |
| Auth transport | Cookie-based sessions (`withCredentials: true`) | No manual token headers needed |

**Base URL**: `window.ENV.API_BASE_URL` → falls back to `http://localhost:5000/api`

**Global interceptors** (in `client.ts`):
- `401` response → clears auth state + redirects to `/login`
- `403` response → logs permission error (no redirect)

---

## Routes Map

| URL | Page Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Unauthenticated entry point |
| `/projects` | `ProjectsPage` | List all projects |
| `/projects/:projectId` | `ProjectDetailPage` | Project overview + feature flags |
| `/projects/:projectId/settings` | `ProjectSettingsPage` | Edit project metadata, manage API key |
| `/projects/:projectId/scopes` | `ScopesPage` | Manage scopes (environments) |
| `/projects/:projectId/flags/:flagId/edit` | `FlagEditPage` | Edit flag metadata, toggle values, manage targeting rules |
| `/projects/:projectId/users` | `UsersPage` | Project team management |
| `/projects/:projectId/segments` | `SegmentsPage` | List segments |
| `/projects/:projectId/segments/:segmentId` | `SegmentDetailPage` | Edit segment + manage members |
| `/admin/users` | `GlobalUsersPage` | System-wide user management (Admin only) |

---

## 1. Authentication

### 1.1 Login

**Page**: `src/pages/login/LoginPage.tsx`

**Flow**:
1. User fills username + password (validated via Zod: min 3/8 chars)
2. Submits form → calls `useAuthStore.login()`
3. On success → navigate to `/projects`
4. On failure → displays error message or lock status

```
LoginPage (form submit)
  → authStore.login({ username, password })
    → authApi.login()
      → POST /api/v1/auth/login
        { username, password }
      ← AuthResultDto { userId, username, fullName, globalRole, mustChangePassword }
```

**Lock UI states**:
- Temporary lock → shows remaining minutes countdown (from `lockDetails.remainingMinutes`)
- Permanent lock → shows "contact administrator" message; submit button disabled

---

### 1.2 Session Restore

**Trigger**: App startup via `ProtectedRoute`

```
ProtectedRoute (mount)
  → authStore.getCurrentUser()
    → authApi.getCurrentUser()
      → GET /api/v1/auth/me
      ← AuthResultDto
```

If `401` → interceptor redirects to `/login`.

---

### 1.3 Logout

**Component**: `AppHeader` (`src/widgets/header/AppHeader.tsx`)

```
AppHeader (logout click)
  → authStore.logout()
    → authApi.logout()
      → POST /api/v1/auth/logout
      ← 200 OK
  → navigate to /login
```

---

### 1.4 Change Password

**Component**: `src/features/auth/ui/ChangePasswordDialog.tsx`

```
ChangePasswordDialog (form submit)
  → authApi.changePassword({ currentPassword, newPassword })
    → POST /api/v1/auth/change-password
      { currentPassword, newPassword }
    ← 200 OK
```

Password validation: min 8 chars, must contain uppercase, lowercase, and digit.

---

## 2. Projects

### 2.1 List Projects

**Page**: `src/pages/projects/ProjectsPage.tsx`

```
ProjectsPage (mount)
  → useProjects()
    → getProjects()
      → GET /api/v1/projects
      ← ProjectResponseDto[]
```

Renders a table with active/archived tab filter (client-side filtering on `isArchived`).

---

### 2.2 Create Project

**Component**: `src/features/project/ui/CreateProjectDialog.tsx`

**Triggered from**: `ProjectsPage` ("New Project" button)

```
CreateProjectDialog (form submit)
  → useCreateProject().mutateAsync({ name, alias, description })
    → createProject()
      → POST /api/v1/projects
        { name, alias, description }
      ← ProjectDetailResponseDto
  → React Query invalidates projects list
```

---

### 2.3 View Project Detail

**Page**: `src/pages/project-detail/ProjectDetailPage.tsx`

```
ProjectDetailPage (mount)
  → useProject(projectId)
    → getProjectById(projectId)
      → GET /api/v1/projects/:projectId
      ← ProjectDetailResponseDto

  → usePermissions(projectId)  [parallel]
    → getMyPermissions(projectId)
      → GET /api/v1/projects/:projectId/my-permissions
      ← MyPermissionsResponseDto
```

Permissions gate controls visibility of "New Feature", "Archive", "Delete" actions.

---

### 2.4 Archive / Unarchive Project

**Triggered from**: `ProjectDetailPage` Settings dropdown

```
Settings dropdown → "Archive Project"
  → useArchiveProject().mutateAsync(projectId)
    → archiveProject(projectId)
      → POST /api/v1/projects/:projectId/archive
      ← 204 No Content

Settings dropdown → "Unarchive Project"
  → useUnarchiveProject().mutateAsync(projectId)
    → unarchiveProject(projectId)
      → POST /api/v1/projects/:projectId/unarchive
      ← 204 No Content
```

---

### 2.5 Delete Project

**Component**: `src/features/project/ui/DeleteProjectDialog.tsx`

**Triggered from**: `ProjectDetailPage` Settings dropdown (only visible when archived)

```
DeleteProjectDialog (confirm click)
  → useDeleteProject().mutateAsync(projectId)
    → deleteProject(projectId)
      → DELETE /api/v1/projects/:projectId
      ← 204 No Content
  → navigate to /projects
```

---

### 2.6 Update Project Settings

**Page**: `src/pages/project-settings/ProjectSettingsPage.tsx`

```
ProjectSettingsPage (mount)
  → useProject(projectId)   → GET /api/v1/projects/:projectId
  → usePermissions(projectId) → GET /api/v1/projects/:projectId/my-permissions
  → useProjectApiKey(projectId) [if canViewApiKey]
      → getProjectApiKey(projectId)
        → GET /api/v1/projects/:projectId/api-key
        ← { apiKey }

ProjectSettingsPage (form submit)
  → useUpdateProject().mutateAsync({ id, data })
    → updateProject(id, data)
      → PUT /api/v1/projects/:projectId
        { name, alias, description }
      ← ProjectDetailResponseDto
```

Note: alias field is read-only in the UI after creation.

---

### 2.7 Regenerate API Key

**Page**: `src/pages/project-settings/ProjectSettingsPage.tsx`

```
"Regenerate API Key" button → opens confirmation dialog
Confirmation dialog → confirm
  → useRegenerateApiKey().mutateAsync(projectId)
    → regenerateApiKey(projectId)
      → POST /api/v1/projects/:projectId/regenerate-api-key
      ← { apiKey, regeneratedAt }
  → React Query updates apiKey cache
  → Auto-reveals new key (showApiKey = true)
```

---

## 3. Feature Flags

### 3.1 List Feature Flags

**Widget**: `src/widgets/flags/FeatureFlagsTable.tsx`

**Used in**: `ProjectDetailPage`

```
FeatureFlagsTable (mount)
  → useFeatureFlags(projectId)
    → getFeatureFlags(projectId)
      → GET /api/v1/projects/:projectId/feature-flags
      ← FeatureFlagResponseDto[]  (includes values[] per flag)
```

Each flag row shows values grouped by scope with enabled/disabled indicator.

---

### 3.2 Create Feature Flag

**Component**: `src/features/flag/ui/CreateFeatureFlagDialog.tsx`

**Triggered from**: `ProjectDetailPage` ("New Feature" button, gated by `ManageFeatureFlags` permission)

```
CreateFeatureFlagDialog (form submit)
  → useCreateFeatureFlag().mutateAsync({ projectId, data })
    → createFeatureFlag(projectId, { name, key, description })
      → POST /api/v1/projects/:projectId/feature-flags
        { name, key, description }
      ← FeatureFlagResponseDto
  → React Query invalidates flags list
```

---

### 3.3 Edit Feature Flag Metadata

**Page**: `src/pages/flag-edit/FlagEditPage.tsx`

**Navigated to**: clicking Edit in `FeatureFlagsTable`

```
FlagEditPage (mount)
  → useFeatureFlagById(projectId, flagId)
    (derives from flags list query cache → GET /api/v1/projects/:projectId/feature-flags)
  → usePermissions(projectId)
    → GET /api/v1/projects/:projectId/my-permissions

FlagEditPage (form submit - "Save Changes")
  → useUpdateFeatureFlag().mutateAsync({ flagId, data })
    → updateFeatureFlag(flagId, { name, key, description })
      → PUT /api/v1/feature-flags/:flagId
        { name, key, description }
      ← FeatureFlagResponseDto
```

---

### 3.4 Toggle Flag Default Value per Scope

**Page**: `src/pages/flag-edit/FlagEditPage.tsx` — Switch component per scope tab

```
Switch toggle (per scope)
  → useUpdateFeatureFlagValue().mutateAsync({ flagId, data })
    → updateFeatureFlagValue(flagId, { scopeId, isEnabled })
      → PUT /api/v1/feature-flags/:flagId/values
        { scopeId, isEnabled }
      ← FeatureFlagValueDto
```

Gated by both `ManageTargetingRules` (project) AND `UpdateFeatureFlags` (scope).

---

### 3.5 Delete Feature Flag

**Component**: `src/features/flag/ui/DeleteFeatureFlagDialog.tsx`

**Triggered from**: `FlagEditPage` ("Delete" button) or `ProjectDetailPage` (table action)

```
DeleteFeatureFlagDialog (confirm click)
  → useDeleteFeatureFlag().mutateAsync(flagId)
    → deleteFeatureFlag(flagId)
      → DELETE /api/v1/feature-flags/:flagId
      ← 204 No Content
  → navigate back to /projects/:projectId
```

---

## 4. Targeting Rules

All targeting rule operations happen inside `FlagEditPage` within the `TargetingRulesSection` component (`src/features/flag/ui/TargetingRulesSection.tsx`), scoped per flag value (scope tab).

### 4.1 Load Targeting Rules

```
TargetingRulesSection (mount, per flagValueId)
  → useTargetingRules(flagValueId)
    → getTargetingRules(flagValueId)
      → GET /api/v1/feature-flag-values/:flagValueId/targeting-rules
      ← TargetingRuleDto[]
```

---

### 4.2 Create Targeting Rule

**Component**: `src/features/flag/ui/RuleModal.tsx`

```
"Add Rule" button → RuleModal
RuleModal (form submit)
  → useCreateTargetingRule().mutateAsync({ flagValueId, data })
    → createTargetingRule(flagValueId, { serveValue, conditions[] })
      → POST /api/v1/feature-flag-values/:flagValueId/targeting-rules
        { serveValue: boolean, conditions: [{ attributeKey, operator, value }] }
      ← TargetingRuleDto
```

---

### 4.3 Update Targeting Rule

**Component**: `src/features/flag/ui/TargetingRuleCard.tsx`

```
TargetingRuleCard (serve value change)
  → useUpdateTargetingRule().mutateAsync({ ruleId, data })
    → updateTargetingRule(ruleId, { serveValue, priority })
      → PUT /api/v1/targeting-rules/:ruleId
        { serveValue, priority }
      ← TargetingRuleDto
```

---

### 4.4 Reorder Targeting Rules

**Component**: `src/features/flag/ui/TargetingRulesSection.tsx`

```
Drag-and-drop reorder
  → useReorderTargetingRules().mutateAsync({ flagValueId, ruleIds })
    → reorderTargetingRules(flagValueId, { ruleIds: string[] })
      → PUT /api/v1/feature-flag-values/:flagValueId/targeting-rules/reorder
        { ruleIds: uuid[] }  (ordered array)
      ← TargetingRuleDto[]
```

---

### 4.5 Delete Targeting Rule

```
TargetingRuleCard ("Delete rule" button)
  → useDeleteTargetingRule().mutateAsync(ruleId)
    → deleteTargetingRule(ruleId)
      → DELETE /api/v1/targeting-rules/:ruleId
      ← 204 No Content
```

---

## 5. Targeting Conditions

Conditions are nested inside rules. All condition operations are available inside `TargetingRuleCard`.

### 5.1 Add Condition to Rule

```
"Add Condition" button (inside rule card)
  → useCreateTargetingCondition().mutateAsync({ ruleId, data })
    → createTargetingCondition(ruleId, { attributeKey, operator, value })
      → POST /api/v1/targeting-rules/:ruleId/conditions
        { attributeKey, operator (int), value }
      ← TargetingRuleDto (full updated rule)
```

**Operators** (`ComparisonOperator` enum — integer):

| Value | Meaning |
|---|---|
| 0 | Equals |
| 1 | Not Equals |
| 2 | Contains |
| 3 | Not Contains |
| 4 | Starts With |
| 5 | Ends With |

---

### 5.2 Update Condition

```
Condition field change (inline edit)
  → useUpdateTargetingCondition().mutateAsync({ conditionId, data })
    → updateTargetingCondition(conditionId, { attributeKey, operator, value })
      → PUT /api/v1/targeting-conditions/:conditionId
        { attributeKey, operator, value }
      ← TargetingRuleDto
```

---

### 5.3 Delete Condition

```
"Remove condition" button
  → useDeleteTargetingCondition().mutateAsync(conditionId)
    → deleteTargetingCondition(conditionId)
      → DELETE /api/v1/targeting-conditions/:conditionId
      ← 204 No Content
```

---

## 6. Scopes

Scopes are named environments (e.g., production, staging) within a project.

### 6.1 List Scopes

**Page**: `src/pages/scopes/ScopesPage.tsx`

**Widget**: `src/widgets/scopes/ScopesList.tsx`

```
ScopesPage (mount)
  → useScopes(projectId)
    → getScopes(projectId)
      → GET /api/v1/projects/:projectId/scopes
      ← ScopeResponseDto[]
```

---

### 6.2 Create Scope

**Component**: `src/features/scope/ui/CreateScopeDialog.tsx`

```
CreateScopeDialog (form submit)
  → useCreateScope().mutateAsync({ projectId, data })
    → createScope(projectId, { name, alias, description })
      → POST /api/v1/projects/:projectId/scopes
        { name, alias, description }
      ← ScopeResponseDto
  → React Query invalidates scopes list
```

---

### 6.3 Edit Scope

**Component**: `src/features/scope/ui/EditScopeDialog.tsx`

```
EditScopeDialog (form submit)
  → useUpdateScope().mutateAsync({ scopeId, data })
    → updateScope(scopeId, { name, alias, description })
      → PUT /api/v1/scopes/:scopeId
        { name, alias, description }
      ← ScopeResponseDto
```

---

### 6.4 Delete Scope

**Component**: `src/features/scope/ui/DeleteScopeDialog.tsx`

```
DeleteScopeDialog (confirm click)
  → useDeleteScope().mutateAsync(scopeId)
    → deleteScope(scopeId)
      → DELETE /api/v1/scopes/:scopeId
      ← 204 No Content
```

---

## 7. Segments

Segments are reusable groups of targeting keys (e.g., user IDs for beta users).

### 7.1 List Segments

**Page**: `src/pages/segments/SegmentsPage.tsx`

**Widget**: `src/widgets/segments/SegmentsList.tsx`

```
SegmentsPage (mount)
  → useSegments(projectId)
    → getSegments(projectId)
      → GET /api/v1/projects/:projectId/segments
      ← SegmentResponseDto[]  (includes memberCount)
```

---

### 7.2 Create Segment

**Component**: `src/features/segment/ui/CreateSegmentDialog.tsx`

```
CreateSegmentDialog (form submit)
  → useCreateSegment().mutateAsync({ projectId, data })
    → createSegment(projectId, { name, description })
      → POST /api/v1/projects/:projectId/segments
        { name, description }
      ← SegmentResponseDto
```

---

### 7.3 View / Edit Segment

**Page**: `src/pages/segment-detail/SegmentDetailPage.tsx`

```
SegmentDetailPage (mount)
  → useSegmentById(projectId, segmentId)
    (derives from segments list query cache)
  → usePermissions(projectId)
    → GET /api/v1/projects/:projectId/my-permissions

SegmentDetailPage (form submit - "Save Changes")
  → useUpdateSegment().mutateAsync({ projectId, segmentId, data })
    → updateSegment(projectId, segmentId, { name, description })
      → PUT /api/v1/projects/:projectId/segments/:segmentId
        { name, description }
      ← SegmentResponseDto
```

---

### 7.4 Delete Segment

**Component**: `src/features/segment/ui/DeleteSegmentDialog.tsx`

```
DeleteSegmentDialog (confirm click)
  → useDeleteSegment().mutateAsync({ projectId, segmentId })
    → deleteSegment(projectId, segmentId)
      → DELETE /api/v1/projects/:projectId/segments/:segmentId
      ← 204 No Content
  → navigate to /projects/:projectId/segments
```

---

## 8. Segment Members

### 8.1 Load Members

**Component**: `src/features/segment/ui/SegmentMembersSection.tsx`

```
SegmentMembersSection (mount)
  → useSegmentMembers(segmentId)
    → getSegmentMembers(segmentId)
      → GET /api/v1/segments/:segmentId/members
      ← SegmentMemberResponseDto[]  { id, segmentId, targetingKey }
```

---

### 8.2 Add Members

**Component**: `src/features/segment/ui/AddMembersModal.tsx`

```
AddMembersModal (submit)
  → useAddSegmentMembers().mutateAsync({ segmentId, targetingKeys })
    → addSegmentMembers(segmentId, targetingKeys: string[])
      → POST /api/v1/segments/:segmentId/members
        { targetingKeys: string[] }
      ← SegmentMemberResponseDto[]
```

Targeting keys are arbitrary strings (e.g., user IDs, device IDs).

---

### 8.3 Remove Member

```
Member row → "Remove" button
  → useRemoveSegmentMember().mutateAsync({ segmentId, memberKey })
    → removeSegmentMember(segmentId, memberKey)
      → DELETE /api/v1/segments/:segmentId/members/:memberKey
      ← 204 No Content
```

---

## 9. Project Team Management (Project Users)

### 9.1 List Project Users

**Page**: `src/pages/users/UsersPage.tsx`

**Widget**: `src/widgets/project-users/ProjectUsersTable.tsx`

```
UsersPage (mount)
  → useProjectUsers(projectId)
    → getProjectUsers(projectId)
      → GET /api/v1/projects/:projectId/users
      ← ProjectUserResponseDto[]
```

---

### 9.2 Invite User to Project

**Component**: `src/features/project-user/ui/InviteUserDialog.tsx`

```
InviteUserDialog (open)
  → getAvailableUsers(projectId)
    → GET /api/v1/projects/:projectId/users/available
    ← AvailableUserDto[]  (includes isAlreadyMember flag)

InviteUserDialog (submit)
  → useInviteUser().mutateAsync({ projectId, data })
    → inviteUser(projectId, { userId, projectPermissions[], scopePermissions{} })
      → POST /api/v1/projects/:projectId/users
        { userId, projectPermissions: int[], scopePermissions: { scopeId: int[] } }
      ← ProjectUserResponseDto
```

---

### 9.3 Update User Permissions

**Component**: `src/features/project-user/ui/EditUserPermissionsDialog.tsx`

```
EditUserPermissionsDialog (submit)
  → useUpdateUserPermissions().mutateAsync({ projectId, userId, data })
    → updateUserPermissions(projectId, userId, { projectPermissions[], scopePermissions{} })
      → PUT /api/v1/projects/:projectId/users/:userId/permissions
        { projectPermissions: int[], scopePermissions: { scopeId: int[] } }
      ← ProjectUserResponseDto
```

---

### 9.4 Remove User from Project

**Component**: `src/features/project-user/ui/RemoveUserDialog.tsx`

```
RemoveUserDialog (confirm click)
  → useRemoveUser().mutateAsync({ projectId, userId })
    → removeUser(projectId, userId)
      → DELETE /api/v1/projects/:projectId/users/:userId
      ← 204 No Content
```

---

## 10. Global User Management (Admin Only)

**Page**: `src/pages/global-users/GlobalUsersPage.tsx`

Access guarded client-side: `GlobalRole.Admin` users only. Non-admins are redirected to `/projects`.

### 10.1 List Users

```
GlobalUsersPage (mount / filter change)
  → useUsers(isActive?)
    → getUsers(isActive?)
      → GET /api/v1/users?isActive={true|false}   (param omitted for "all")
      ← UserResponseDto[]
```

Filter tabs: All / Active / Inactive.

---

### 10.2 Create User

**Component**: `src/features/user/ui/CreateUserDialog.tsx`

```
CreateUserDialog (form submit)
  → useCreateUser().mutateAsync(data)
    → createUser({ username, fullName, temporaryPassword })
      → POST /api/v1/users
        { username, fullName, temporaryPassword }
      ← UserResponseDto
```

Created users must change their password on first login (`mustChangePassword: true`).

---

### 10.3 Edit User

**Component**: `src/features/user/ui/EditUserDialog.tsx`

```
EditUserDialog (form submit)
  → useUpdateUser().mutateAsync({ userId, data })
    → updateUser(userId, { fullName, globalRole })
      → PUT /api/v1/users/:userId
        { fullName, globalRole: int }
      ← UserResponseDto
```

**Global roles**: `0` = User, `1` = Admin

---

### 10.4 Delete User

**Component**: `src/features/user/ui/DeleteUserDialog.tsx`

```
DeleteUserDialog (confirm click)
  → useDeleteUser().mutateAsync(userId)
    → deleteUser(userId)
      → DELETE /api/v1/users/:userId
      ← 204 No Content
```

---

### 10.5 Activate User

**Component**: `src/features/user/ui/ActivateUserDialog.tsx`

```
ActivateUserDialog (confirm click)
  → useActivateUser().mutateAsync(userId)
    → activateUser(userId)
      → POST /api/v1/users/:userId/activate
      ← 204 No Content
```

---

### 10.6 Deactivate User

**Component**: `src/features/user/ui/DeactivateUserDialog.tsx`

```
DeactivateUserDialog (confirm click)
  → useDeactivateUser().mutateAsync(userId)
    → deactivateUser(userId)
      → POST /api/v1/users/:userId/deactivate
      ← 204 No Content
```

Deactivated users cannot log in.

---

### 10.7 Unlock User (Brute Force Lock)

**Component**: `src/features/user/ui/UnlockUserDialog.tsx`

**Triggered**: When `UserResponseDto.isBruteForceLocked === true`

```
UnlockUserDialog (confirm click)
  → useUnlockUser().mutateAsync(userId)
    → unlockUser(userId)
      → POST /api/v1/users/:userId/unlock
      ← 204 No Content
```

The `UserResponseDto` also exposes `failedLoginAttempts` and `lockedUntil` for display.

---

### 10.8 Reset User Password

**Component**: `src/features/user/ui/ResetPasswordDialog.tsx`

```
ResetPasswordDialog (form submit)
  → useResetUserPassword().mutateAsync({ userId, data })
    → resetUserPassword(userId, { temporaryPassword })
      → POST /api/v1/users/:userId/reset-password
        { temporaryPassword }
      ← 204 No Content
```

Sets `mustChangePassword = true` on the user; they must change it on next login.

---

## 11. Permissions System

### How Permissions Work

```
usePermissions(projectId)
  → GET /api/v1/projects/:projectId/my-permissions
  ← {
      projectPermissions: ProjectPermission[],
      scopePermissions: { [scopeId]: ScopePermission[] }
    }
```

**Project Permissions** (`ProjectPermission` enum):

| Value | Constant | Controls |
|---|---|---|
| 0 | `ManageUsers` | Invite/remove/update team members |
| 1 | `ManageFeatureFlags` | Create/delete flags |
| 2 | `ManageScopes` | Create/edit/delete scopes |
| 3 | `ViewApiKey` | See the API key |
| 4 | `RegenerateApiKey` | Rotate the API key |
| 5 | `ManageProjectSettings` | Edit name/description, archive/delete project |
| 6 | `DeleteProject` | Delete project (used internally) |
| 7 | `ManageSegments` | Create/edit/delete segments and members |
| 8 | `ManageTargetingRules` | Create/edit/delete targeting rules and toggle flag values |

**Scope Permissions** (`ScopePermission` enum):

| Value | Constant | Controls |
|---|---|---|
| 0 | `ReadFeatureFlags` | View flag values for a scope |
| 1 | `UpdateFeatureFlags` | Toggle flag values and manage rules for a scope |

**Admins** (`GlobalRole.Admin`) bypass all project/scope permission checks.

### Permission Gates in UI

| Component | Required Permission |
|---|---|
| "New Feature" button | `ManageFeatureFlags` |
| Edit flag form | `ManageFeatureFlags` |
| Flag value toggle (scope tab) | `ManageTargetingRules` (project) + `UpdateFeatureFlags` (scope) |
| Targeting rule add/edit/delete | same as above |
| Archive/Unarchive project | `ManageProjectSettings` |
| Delete project | `ManageProjectSettings` (only when archived) |
| Project Settings page | `ManageProjectSettings` |
| View API Key | `ViewApiKey` |
| Regenerate API Key | `RegenerateApiKey` |
| Invite/remove/edit team members | `ManageUsers` |
| Create/edit/delete scopes | `ManageScopes` |
| Create/edit/delete segments | `ManageSegments` |
| `/admin/users` page | `GlobalRole.Admin` |

---

## 12. SDK Evaluation Endpoints

These endpoints are called by external applications (not the UI) using a project API key.

### Evaluate Single Flag

```
POST /sdk/v1/flags/evaluate
Authorization: API-Key header (not cookie)
{
  "flagKey": "my_feature",
  "context": {
    "scope": "production",
    "targetingKey": "user-123",
    "attributes": { "plan": "premium", "country": "US" }
  }
}
← {
    "flagKey": "my_feature",
    "value": true,
    "variant": null,
    "reason": "TARGETING_MATCH"
  }
```

### Evaluate All Flags

```
POST /sdk/v1/flags/evaluate-all
{
  "context": {
    "scope": "production",
    "targetingKey": "user-123",
    "attributes": { ... }
  }
}
← { "flags": [ FlagEvaluationResponseDto, ... ] }
```

---

## Data Flow Summary

```
Browser
  └── React App
        ├── Zustand (auth state)
        │     └── authStore: user, isAuthenticated, mustChangePassword
        │
        ├── React Query (server state cache)
        │     ├── projects list
        │     ├── project detail
        │     ├── my-permissions (per projectId)
        │     ├── feature flags (per projectId)
        │     ├── targeting rules (per flagValueId)
        │     ├── scopes (per projectId)
        │     ├── segments (per projectId)
        │     ├── segment members (per segmentId)
        │     ├── project users (per projectId)
        │     └── global users
        │
        └── Axios (HTTP)
              └── apiClient
                    ├── baseURL: window.ENV.API_BASE_URL || http://localhost:5000/api
                    ├── withCredentials: true  (cookie auth)
                    └── interceptors:
                          401 → clear auth + redirect /login
                          403 → log error
```
