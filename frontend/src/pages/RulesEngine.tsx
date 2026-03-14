import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, Trash2, Edit, AlertTriangle, Bell, FileText } from "lucide-react";
import { fetchRules } from "../services/ruleService";
import { EmptyState } from "../components/EmptyState";

interface Rule {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  location: string;
  action: string;
  status: "active" | "disabled";
  lastTriggered: string;
}

const mockRules: Rule[] = [
  {
    id: "RULE-001",
    name: "High Water Level Alert",
    metric: "Water Level",
    operator: ">",
    threshold: 5,
    location: "Sector V",
    action: "Send Notification",
    status: "active",
    lastTriggered: "2 hours ago",
  },
  {
    id: "RULE-002",
    name: "Dangerous AQI Warning",
    metric: "AQI",
    operator: ">",
    threshold: 150,
    location: "All Locations",
    action: "Trigger Warning",
    status: "active",
    lastTriggered: "Never",
  },
  {
    id: "RULE-003",
    name: "High Temperature Alert",
    metric: "Temperature",
    operator: ">",
    threshold: 35,
    location: "Park Street",
    action: "Create Alert Log",
    status: "active",
    lastTriggered: "1 day ago",
  },
  {
    id: "RULE-004",
    name: "Low Humidity Warning",
    metric: "Humidity",
    operator: "<",
    threshold: 30,
    location: "New Town",
    action: "Send Notification",
    status: "disabled",
    lastTriggered: "Never",
  },
];

export function RulesEngine() {
  const [rulesList, setRulesList] = useState<Rule[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    metric: "aqi",
    operator: ">",
    threshold: "",
    location: "all",
    action: "notification",
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect to backend: load active rules for the Rules Engine UI.
  useEffect(() => {
    fetchRules()
      .then((res) => {
        setRulesList((res.data as any) || []);
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleRuleStatus = (id: string) => {
    setRulesList((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? { ...rule, status: rule.status === "active" ? "disabled" : "active" }
          : rule
      )
    );
  };

  const deleteRule = (id: string) => {
    setRulesList((prev) => prev.filter((rule) => rule.id !== id));
  };

  const handleCreateRule = () => {
    // In a real app, this would send to backend
    const rule: Rule = {
      id: `RULE-${String(rulesList.length + 1).padStart(3, "0")}`,
      name: newRule.name,
      metric: newRule.metric,
      operator: newRule.operator,
      threshold: Number(newRule.threshold),
      location: newRule.location,
      action: newRule.action,
      status: "active",
      lastTriggered: "Never",
    };
    setRulesList([...rulesList, rule]);
    setIsCreateDialogOpen(false);
    setNewRule({
      name: "",
      metric: "aqi",
      operator: ">",
      threshold: "",
      location: "all",
      action: "notification",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading rules...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load rules: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && rulesList.length === 0 && (
        <EmptyState title="No rules configured" description="Create a rule to start automated alerting." />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Rules Engine</h1>
          <p className="text-zinc-400 mt-1">Configure automated alert rules and thresholds</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Create New Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Rules</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{rulesList.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-zinc-600" />
          </div>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Active Rules</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {rulesList.filter((r) => r.status === "active").length}
              </p>
            </div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Disabled Rules</p>
              <p className="text-2xl font-bold text-zinc-400 mt-1">
                {rulesList.filter((r) => r.status === "disabled").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-400/80 uppercase tracking-wide">Triggered Today</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">8</p>
            </div>
            <Bell className="w-8 h-8 text-orange-500/50" />
          </div>
        </Card>
      </div>

      {/* Rules List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Active Rules</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {rulesList.map((rule) => (
            <div key={rule.id} className="p-6 hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-100">{rule.name}</h3>
                    <Badge
                      className={
                        rule.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-700 text-zinc-400"
                      }
                    >
                      {rule.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-zinc-400 mb-3">
                    <span className="flex items-center gap-1">
                      <strong className="text-zinc-300">ID:</strong> {rule.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <strong className="text-zinc-300">Last Triggered:</strong> {rule.lastTriggered}
                    </span>
                  </div>

                  <Card className="bg-zinc-800 border-zinc-700 p-4 inline-block">
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-zinc-400">IF</span>
                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {rule.metric}
                      </Badge>
                      <span className="text-emerald-400 font-bold">{rule.operator}</span>
                      <span className="text-orange-400 font-bold">{rule.threshold}</span>
                      <span className="text-zinc-400">AND</span>
                      <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Location = {rule.location}
                      </Badge>
                      <span className="text-zinc-400">THEN</span>
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {rule.action}
                      </Badge>
                    </div>
                  </Card>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.status === "active"}
                    onCheckedChange={() => toggleRuleStatus(rule.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Rule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Create New Rule
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Rule Name</label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., High Water Level Alert"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Metric</label>
                <Select
                  value={newRule.metric}
                  onValueChange={(value) => setNewRule({ ...newRule, metric: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="aqi">AQI</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="humidity">Humidity</SelectItem>
                    <SelectItem value="waterLevel">Water Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Operator</label>
                <Select
                  value={newRule.operator}
                  onValueChange={(value) => setNewRule({ ...newRule, operator: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value=">">Greater than (&gt;)</SelectItem>
                    <SelectItem value="<">Less than (&lt;)</SelectItem>
                    <SelectItem value=">=">Greater or equal (&gt;=)</SelectItem>
                    <SelectItem value="<=">Less or equal (&lt;=)</SelectItem>
                    <SelectItem value="==">Equal (==)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Threshold Value</label>
                <Input
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })}
                  placeholder="e.g., 150"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Location</label>
                <Select
                  value={newRule.location}
                  onValueChange={(value) => setNewRule({ ...newRule, location: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="saltlake">Salt Lake</SelectItem>
                    <SelectItem value="newtown">New Town</SelectItem>
                    <SelectItem value="sectorv">Sector V</SelectItem>
                    <SelectItem value="rajarhat">Rajarhat</SelectItem>
                    <SelectItem value="parkstreet">Park Street</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Alert Action</label>
                <Select
                  value={newRule.action}
                  onValueChange={(value) => setNewRule({ ...newRule, action: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="notification">Send Notification</SelectItem>
                    <SelectItem value="warning">Trigger Warning</SelectItem>
                    <SelectItem value="log">Create Alert Log</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreateRule}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create Rule
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
