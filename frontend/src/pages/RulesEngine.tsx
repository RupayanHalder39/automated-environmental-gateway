import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, Trash2, Edit, AlertTriangle, Bell, Power } from "lucide-react";
import { createRule, deleteRule, fetchRules, toggleRule, updateRule } from "../services/ruleService";
import { EmptyState } from "../components/EmptyState";
import { fetchLocations } from "../services/locationService";
import type { LocationDTO } from "../types/location";
import { z } from "zod";

interface Rule {
  id: string;
  name: string;
  conditions: {
    metric: string;
    operator: string;
    threshold: number;
  }[];
  locationIds: string[];
  actionIds: string[];
  status: "active" | "disabled";
  lastTriggered: string;
}

type RuleCondition = {
  id: string;
  metric: string;
  operator: string;
  threshold: string;
};

const metricOptions = [
  { value: "AQI", label: "AQI" },
  { value: "TEMPERATURE", label: "Temperature" },
  { value: "HUMIDITY", label: "Humidity" },
  { value: "WATER_LEVEL", label: "Water Level" },
];

const operatorOptions = [
  { value: ">", label: "Greater than (>)" },
  { value: "<", label: "Less than (<)" },
  { value: ">=", label: "Greater or equal (>=)" },
  { value: "<=", label: "Less or equal (<=)" },
  { value: "==", label: "Equal (==)" },
];

const actionOptions = [
  { value: "notification", label: "Send Notification" },
  { value: "warning", label: "Trigger Warning" },
  { value: "log", label: "Create Alert Log" },
];

const ruleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  conditions: z.array(
    z.object({
      metric: z.string().min(1, "Metric is required"),
      operator: z.string().min(1, "Operator is required"),
      threshold: z
        .string()
        .min(1, "Threshold is required")
        .refine((val) => !Number.isNaN(Number(val)), {
          message: "Threshold must be a number",
        }),
    })
  ).min(1, "Add at least one condition"),
  locationIds: z.array(z.string().min(1)).min(1, "Select at least one location"),
  actionIds: z.array(z.string().min(1)).min(1, "Select at least one action"),
});

export function RulesEngine() {
  const [rulesList, setRulesList] = useState<Rule[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    name: "",
    conditions: [
      {
        id: `cond-${Date.now()}`,
        metric: "AQI",
        operator: ">",
        threshold: "",
      },
    ] as RuleCondition[],
    locationIds: [] as string[],
    actionIds: ["notification"],
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const triggeredToday = 0;
  const [locations, setLocations] = useState<LocationDTO[]>([]);

  // Connect to backend: load active rules for the Rules Engine UI.
  useEffect(() => {
    fetchRules()
      .then((res) => {
        setRulesList((res.data as any) || []);
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLocations()
      .then((res) => setLocations(res.data || []))
      .catch(() => setLocations([]));
  }, []);

  const locationOptions = useMemo(
    () =>
      locations.length > 0
        ? locations.map((loc) => ({ value: loc.id, label: loc.name }))
        : [
            { value: "salt-lake", label: "Salt Lake" },
            { value: "new-town", label: "New Town" },
            { value: "sector-v", label: "Sector V" },
            { value: "rajarhat", label: "Rajarhat" },
            { value: "park-street", label: "Park Street" },
          ],
    [locations]
  );

  useEffect(() => {
    if (isCreateDialogOpen && !editingRuleId && locationOptions.length > 0 && newRule.locationIds.length === 0) {
      setNewRule((prev) => ({ ...prev, locationIds: locationOptions.map((loc) => loc.value) }));
    }
  }, [isCreateDialogOpen, editingRuleId, locationOptions, newRule.locationIds.length]);

  const toggleRuleStatus = async (id: string, currentStatus: Rule["status"]) => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active";
    setActionBusyId(id);
    setApiError(null);
    // Optimistic update
    setRulesList((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, status: nextStatus } : rule))
    );
    try {
      const res = await toggleRule(id);
      const updated = res.data as Rule | null | undefined;
      if (updated) {
        setRulesList((prev) => prev.map((rule) => (rule.id === id ? updated : rule)));
      }
    } catch (err: any) {
      // Rollback on failure
      setRulesList((prev) =>
        prev.map((rule) => (rule.id === id ? { ...rule, status: currentStatus } : rule))
      );
      setApiError(err.message);
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDeleteRule = async (id: string) => {
    setActionBusyId(id);
    setApiError(null);
    try {
      await deleteRule(id);
      setRulesList((prev) => prev.filter((rule) => rule.id !== id));
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setActionBusyId(null);
    }
  };

  const handleCreateRule = async () => {
    setApiError(null);
    try {
      if (newRule.conditions.length === 0) {
        setApiError("Add at least one condition.");
        return;
      }
      if (newRule.locationIds.length === 0) {
        setApiError("Select at least one location.");
        return;
      }
      if (newRule.actionIds.length === 0) {
        setApiError("Select at least one action.");
        return;
      }
      const payload: Partial<Rule> = {
        name: newRule.name || "New Rule",
        conditions: newRule.conditions.map((condition) => ({
          metric: condition.metric,
          operator: condition.operator,
          threshold: Number(condition.threshold || 0),
        })),
        locationIds: newRule.locationIds,
        actionIds: newRule.actionIds,
        status: "active",
        lastTriggered: "Never",
      };
      if (editingRuleId) {
        const res = await updateRule(editingRuleId, payload);
        const updated = (res.data as Rule | undefined) || (payload as Rule);
        setRulesList((prev) => prev.map((rule) => (rule.id === editingRuleId ? updated : rule)));
      } else {
        const res = await createRule(payload);
        const created = (res.data as Rule | undefined) || (payload as Rule);
        setRulesList((prev) => [created, ...prev]);
      }
      setIsCreateDialogOpen(false);
      setEditingRuleId(null);
      resetNewRule();
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRuleId(rule.id);
    setNewRule({
      name: rule.name,
      conditions: rule.conditions.map((condition, index) => ({
        id: `cond-${rule.id}-${index}`,
        metric: condition.metric,
        operator: condition.operator,
        threshold: String(condition.threshold ?? ""),
      })),
      locationIds: rule.locationIds,
      actionIds: rule.actionIds,
    });
    setIsCreateDialogOpen(true);
  };

  const handleAddCondition = () => {
    setNewRule((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: `cond-${Date.now()}-${prev.conditions.length}`,
          metric: "AQI",
          operator: ">",
          threshold: "",
        },
      ],
    }));
  };

  const handleDeleteCondition = (id: string) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((condition) => condition.id !== id),
    }));
  };

  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition) =>
        condition.id === id ? { ...condition, ...updates } : condition
      ),
    }));
  };

  const locationLabel = (id: string) =>
    locationOptions.find((option) => option.value === id)?.label || id;
  const actionLabel = (id: string) =>
    actionOptions.find((option) => option.value === id)?.label || id;

  const resetNewRule = () => {
    setNewRule({
      name: "",
      conditions: [
        {
          id: `cond-${Date.now()}`,
          metric: "AQI",
          operator: ">",
          threshold: "",
        },
      ],
      locationIds: locationOptions.map((loc) => loc.value),
      actionIds: ["notification"],
    });
  };

  const parsedValidation = ruleSchema.safeParse({
    name: newRule.name,
    conditions: newRule.conditions.map((condition) => ({
      metric: condition.metric,
      operator: condition.operator,
      threshold: condition.threshold,
    })),
    locationIds: newRule.locationIds,
    actionIds: newRule.actionIds,
  });
  const validationErrors = parsedValidation.success ? null : parsedValidation.error.flatten().fieldErrors;
  const isFormValid = parsedValidation.success;
  const thresholdErrors = newRule.conditions.map((condition) => {
    if (!condition.threshold || condition.threshold.trim() === "") return "Threshold is required";
    if (Number.isNaN(Number(condition.threshold))) return "Threshold must be a number";
    return "";
  });

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
              <p className="text-2xl font-bold text-orange-400 mt-1">{triggeredToday}</p>
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
            <div
              key={rule.id}
              className={`p-6 hover:bg-zinc-800/50 transition-colors ${rule.status === "disabled" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-100">{rule.name}</h3>
                    {rule.status === "disabled" && (
                      <Badge className="bg-zinc-700 text-zinc-200 border border-zinc-600">
                        DISABLED
                      </Badge>
                    )}
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
                      <span className="text-zinc-200">
                        {rule.conditions
                          .map((condition) => `${condition.metric} ${condition.operator} ${condition.threshold}`)
                          .join(" OR ")}
                      </span>
                      <span className="text-zinc-400">AND</span>
                      <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Location = {rule.locationIds.map(locationLabel).join(", ")}
                      </Badge>
                      <span className="text-zinc-400">THEN</span>
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {rule.actionIds.map(actionLabel).join(", ")}
                      </Badge>
                    </div>
                  </Card>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={rule.status === "active" ? "Disable Rule" : "Enable Rule"}
                    aria-label={rule.status === "active" ? "Disable Rule" : "Enable Rule"}
                    disabled={actionBusyId === rule.id}
                    onClick={() => toggleRuleStatus(rule.id, rule.status)}
                    className={
                      rule.status === "active"
                        ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    }
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    onClick={() => handleEditRule(rule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRule(rule.id)}
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
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingRuleId(null);
            resetNewRule();
          }
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              {editingRuleId ? "Edit Rule" : "Create New Rule"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Rule Name</label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., High Water Level Alert"
                className="bg-white border-zinc-700 text-black placeholder:text-zinc-400"
              />
              {validationErrors?.name && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.name[0]}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-400">Conditions (OR)</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Condition
                </Button>
              </div>
              <div className="space-y-3">
                {newRule.conditions.map((condition, index) => (
                  <div key={condition.id} className="grid grid-cols-[1.1fr_1fr_1fr_auto] gap-3 items-end">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Metric</label>
                      <SingleSelectDropdown
                        id={`rules-metric-${index}`}
                        value={condition.metric}
                        placeholder="Select metric"
                        onChange={(value) => updateCondition(condition.id, { metric: value })}
                        options={metricOptions}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Operator</label>
                      <SingleSelectDropdown
                        id={`rules-operator-${index}`}
                        value={condition.operator}
                        placeholder="Select operator"
                        onChange={(value) => updateCondition(condition.id, { operator: value })}
                        options={operatorOptions}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 flex items-center justify-between">
                        <span>Threshold</span>
                        {thresholdErrors[index] && (
                          <span className="text-red-400 text-[10px]">{thresholdErrors[index]}</span>
                        )}
                      </label>
                      <Input
                        type="number"
                        value={condition.threshold}
                        onChange={(e) => updateCondition(condition.id, { threshold: e.target.value })}
                        placeholder="e.g., 150"
                        className="bg-white border-zinc-700 text-black placeholder:text-zinc-400"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCondition(condition.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mb-1"
                      aria-label="Delete condition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Location</label>
                <MultiSelectDropdown
                  id="rules-location"
                  placeholder="All Locations"
                  allLabel="All Locations"
                  emptyLabel="No locations"
                  multipleLabel="Multiple locations"
                  options={locationOptions}
                  selected={newRule.locationIds}
                  onChange={(value) => setNewRule({ ...newRule, locationIds: value })}
                />
                {validationErrors?.locationIds && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.locationIds[0]}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Alert Action</label>
                <MultiSelectDropdown
                  id="rules-action"
                  placeholder="Select actions"
                  allLabel="All Actions"
                  emptyLabel="No actions"
                  multipleLabel="Multiple actions"
                  options={actionOptions}
                  selected={newRule.actionIds}
                  onChange={(value) => setNewRule({ ...newRule, actionIds: value })}
                />
                {validationErrors?.actionIds && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.actionIds[0]}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreateRule}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!isFormValid}
              >
                {editingRuleId ? "Save Rule" : "Create Rule"}
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

type SingleSelectOption = {
  value: string;
  label: string;
};

type SingleSelectProps = {
  id: string;
  options: SingleSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function SingleSelectDropdown({ id, options, value, onChange, placeholder }: SingleSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);
  const label = selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2 text-left flex items-center justify-between"
      >
        <span className="text-sm">{label}</span>
        <span className="text-zinc-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-2 space-y-1">
          {options.map((option) => {
            const checked = option.value === value;
            return (
              <label
                key={option.value}
                className="flex items-center gap-2 px-2 py-1 text-sm text-zinc-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleSelect(option.value)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  id: string;
  placeholder: string;
  allLabel: string;
  emptyLabel: string;
  multipleLabel: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

function MultiSelectDropdown({
  id,
  placeholder,
  allLabel,
  emptyLabel,
  multipleLabel,
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const allSelected = options.length > 0 && selected.length === options.length;

  const label = (() => {
    if (options.length === 0) return emptyLabel;
    if (allSelected) return allLabel;
    if (selected.length === 0) return emptyLabel;
    if (selected.length === 1) return options.find((opt) => opt.value === selected[0])?.label || placeholder;
    return multipleLabel;
  })();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map((option) => option.value));
    }
  };

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2 text-left flex items-center justify-between"
      >
        <span className="text-sm">{label || placeholder}</span>
        <span className="text-zinc-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-2 space-y-1">
          <label className="flex items-center gap-2 px-2 py-1 text-sm text-zinc-200 cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            {allLabel}
          </label>
          <div className="border-t border-zinc-800 my-1" />
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 px-2 py-1 text-sm text-zinc-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
