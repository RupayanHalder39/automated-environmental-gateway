import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Radio, 
  Activity, 
  Bell, 
  BarChart3, 
  Settings as SettingsIcon,
  FileText,
  Wifi,
  AlertTriangle,
  Database,
  Search,
  User,
  Server
} from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sensors", label: "Sensors", icon: Radio },
  { path: "/device-health", label: "Device Health", icon: Activity },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/historical-data", label: "Historical Data", icon: BarChart3 },
  { path: "/rules-engine", label: "Rules Engine", icon: AlertTriangle },
  { path: "/data-sanity", label: "Data Sanity", icon: Database },
  { path: "/bulk-sync", label: "Bulk Sync", icon: Wifi },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/public-api", label: "Public API", icon: Server },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function DashboardLayout() {
  const location = useLocation();
  
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Left Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-emerald-400">AUTOMATED</h1>
          <h2 className="text-sm text-zinc-400">Environmental Gateway</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-zinc-400">System Status</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium">All Systems Operational</p>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="search"
              placeholder="Search sensors, locations, devices..."
              className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-zinc-400" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-xs text-emerald-400 font-medium">ONLINE</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                <DropdownMenuLabel className="text-zinc-300">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
