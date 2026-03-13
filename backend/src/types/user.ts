// DTOs for UserService (Settings)
// Maps to Figma Settings page fields.

export interface UserProfileDTO {
  fullName: string;
  email: string;
  organization: string;
}

export interface NotificationSettingsDTO {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  weeklyReports: boolean;
}

export interface SystemSettingsDTO {
  dataRetentionDays: number;
  autoBackup: boolean;
  debugMode: boolean;
}

