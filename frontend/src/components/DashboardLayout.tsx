import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
  User,
  Server,
} from "lucide-react";
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
  { path: "/alerts", label: "Alerts", icon: Bell, disabled: true },
  { path: "/historical-data", label: "Historical Data", icon: BarChart3 },
  { path: "/rules-engine", label: "Rules Engine", icon: AlertTriangle },
  { path: "/data-sanity", label: "Data Sanity", icon: Database, disabled: true },
  { path: "/bulk-sync", label: "Bulk Sync", icon: Wifi, disabled: true },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/public-api", label: "Public API", icon: Server, disabled: true },
  { path: "/settings", label: "Settings", icon: SettingsIcon, disabled: true },
];

export function DashboardLayout() {
  const location = useLocation();
  const [devNotice, setDevNotice] = useState<string | null>(null);
  const noticeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!devNotice) return;
      if (noticeRef.current && noticeRef.current.contains(event.target as Node)) return;
      setDevNotice(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [devNotice]);
  
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Left Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-emerald-400">AUTOMATED</h1>
          <h2 className="text-sm text-zinc-400">Environmental Gateway</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isDisabled = item.disabled;

            if (isDisabled) {
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => setDevNotice("Development in progress")}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 cursor-pointer blur-[0.6px] opacity-70 hover:bg-zinc-800/40"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            }

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
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-50">
          <div className="flex-1" />
          
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
        {devNotice && (
          <div
            ref={noticeRef}
            className="fixed right-6 top-20 z-50 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 shadow-lg"
          >
            {devNotice}
          </div>
        )}
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
