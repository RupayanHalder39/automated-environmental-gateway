import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Settings as SettingsIcon, User, Bell, Shield, Database } from "lucide-react";
import { fetchUsers } from "../services/userService";
import { EmptyState } from "../components/EmptyState";

export function Settings() {
  const [profile, setProfile] = useState({
    fullName: "Admin User",
    email: "admin@gateway.io",
    organization: "Kolkata Smart City Initiative",
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load user profile for Settings page.
  useEffect(() => {
    fetchUsers()
      .then((res) => {
        const first = res.data?.[0];
        if (first) {
          setProfile({
            fullName: first.full_name || first.fullName || profile.fullName,
            email: first.email || profile.email,
            organization: first.organization || profile.organization,
          });
        }
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading user settings...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load settings: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && !profile && (
        <EmptyState title="No user profile found" description="Create a user to manage settings." />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400 mt-1">Configure system preferences and user settings</p>
      </div>

      {/* User Profile */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <User className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">User Profile</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Full Name</label>
              <Input
                defaultValue={profile.fullName}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Email</label>
              <Input
                type="email"
                defaultValue={profile.email}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Organization</label>
            <Input
              defaultValue={profile.organization}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Save Profile
          </Button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">Notification Preferences</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-100">Email Notifications</p>
              <p className="text-xs text-zinc-400 mt-1">Receive alerts via email</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-100">Push Notifications</p>
              <p className="text-xs text-zinc-400 mt-1">Browser push notifications for critical alerts</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-100">SMS Alerts</p>
              <p className="text-xs text-zinc-400 mt-1">SMS notifications for critical events</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-100">Weekly Reports</p>
              <p className="text-xs text-zinc-400 mt-1">Automatic weekly summary reports</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">Security</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Current Password</label>
            <Input
              type="password"
              placeholder="Enter current password"
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Update Password
          </Button>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">System Configuration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-100">Data Retention Period</p>
              <p className="text-xs text-zinc-400 mt-1">Keep sensor data for specified days</p>
            </div>
            <Input
              type="number"
              defaultValue="90"
              className="w-24 bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-100">Auto Backup</p>
              <p className="text-xs text-zinc-400 mt-1">Automatic daily database backup</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-100">Debug Mode</p>
              <p className="text-xs text-zinc-400 mt-1">Enable detailed system logging</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>
    </div>
  );
}
