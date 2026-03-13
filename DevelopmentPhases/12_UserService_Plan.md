# UserService Plan

**Module Name**
UserService

**Mapped UI Tab**
Settings (optional)

**Why this step exists (plain language)**
Settings allow admins to manage system users and preferences. This service is optional but supports governance and audits.

**How it maps to UI (plain language)**
The Settings tab exposes user profile, notifications, security, and system configuration. UserService provides those endpoints.

**Scalability and performance considerations (plain language)**
User data volume is small, but access control must be strict. Keep endpoints secure and audited.

## UI Field Mapping (Figma Alignment)
Figma `Settings.tsx` uses:
- Profile: Full Name, Email, Organization
- Notifications: Email Notifications, Push Notifications, SMS Alerts, Weekly Reports
- Security: Current Password, New Password, Confirm Password
- System Configuration: Data Retention Period, Auto Backup, Debug Mode

DB mapping:
- Users and preferences can live in `users` and `user_settings` tables (future extension)
- System configuration may belong in a `system_settings` table

## API Endpoints to Implement
- GET /users
- GET /users/:id
- POST /users
- PATCH /users/:id
- PATCH /users/:id/disable
- PATCH /settings/notifications
- PATCH /settings/system

## Data Flow / DB Queries
- Users and roles tables (future extension)
- Audit logs (future extension)

## Shared Utils Needed
- passwordHasher
- roleValidator
- paginationBuilder

## Frontend Consumption
- Settings list uses /users and /settings endpoints
- Edit flows use POST/PATCH

## Best Practices Built In
- Store hashes only
- Role-based access checks
- Audit trails for changes

