import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { format } from "date-fns";
import { fetchHistoryAggregate } from "../services/historyService";
import { fetchSensors } from "../services/sensorService";
import type { SensorDTO, SensorType } from "../types/sensor";
import { useAppState } from "../utils/AppState";
import { EmptyState } from "../components/EmptyState";

type MetricType = "aqi" | "temperature" | "humidity" | "waterLevel";
type AppStateDateRange = "24hours" | "7days" | "30days" | "custom";

export function HistoricalData() {
  const { filters, setFilters } = useAppState();
  const [dateRange, setDateRange] = useState(filters.dateRange);
  const [metric, setMetric] = useState<MetricType>(filters.metric);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(filters.location || []);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [customTo, setCustomTo] = useState<Date | undefined>(new Date());
  const [apiChartData, setApiChartData] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<SensorDTO[]>([]);
  const [sensorsLoading, setSensorsLoading] = useState(true);

  const daysMap: Record<string, number> = {
    "24hours": 1,
    "7days": 7,
    "30days": 30,
  };

  const chartData = apiChartData;

  const metricToSensorType: Record<MetricType, SensorType> = {
    aqi: "AQI",
    temperature: "Temperature",
    humidity: "Humidity",
    waterLevel: "Water Level",
  };

  const sensorTypeForMetric = metricToSensorType[metric];
  const availableSensors = useMemo(
    () =>
      sensors.filter((sensor) => (sensor.sensorType || "AQI") === sensorTypeForMetric),
    [sensors, sensorTypeForMetric]
  );

  const locationOptions = useMemo(() => {
    const locations = Array.from(new Set(availableSensors.map((sensor) => sensor.location))).sort();
    return locations;
  }, [availableSensors]);

  const didInitLocations = useRef(false);
  useEffect(() => {
    if (!didInitLocations.current && locationOptions.length > 0) {
      setSelectedLocations(locationOptions);
      didInitLocations.current = true;
      return;
    }
    if (selectedLocations.length > 0 && locationOptions.length > 0) {
      const next = selectedLocations.filter((loc) => locationOptions.includes(loc));
      if (next.length !== selectedLocations.length) {
        setSelectedLocations(next);
      }
    }
    if (selectedLocations.length === 0 && locationOptions.length > 0 && didInitLocations.current) {
      setSelectedLocations(locationOptions);
    }
  }, [locationOptions, selectedLocations]);

  const dateRangeOptions = [
    { value: "24hours", label: "Last 24 Hours" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  const metricOptions = [
    { value: "aqi", label: "Air Quality Index (AQI)" },
    { value: "temperature", label: "Temperature" },
    { value: "humidity", label: "Humidity" },
    { value: "waterLevel", label: "Water Level" },
  ];

  // Load sensors so we can keep a single source of truth for locations + types.
  useEffect(() => {
    fetchSensors(true)
      .then((res) => setSensors(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setSensorsLoading(false));
  }, []);

  // Connect to backend: load aggregated chart data for historical trends.
  useEffect(() => {
    if (selectedLocations.length === 0 || availableSensors.length === 0) {
      setApiChartData([]);
      setLoading(false);
      return;
    }
    const days = daysMap[dateRange] || 7;
    const isCustom = dateRange === "custom";
    if (isCustom && (!customFrom || !customTo)) {
      setApiChartData([]);
      setLoading(false);
      return;
    }
    const fromDate = isCustom && customFrom && customTo
      ? (customFrom > customTo ? customTo : customFrom)
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const toDate = isCustom && customFrom && customTo
      ? (customFrom > customTo ? customFrom : customTo)
      : new Date();
    const from = fromDate.toISOString();
    const to = toDate.toISOString();
    const isAll = selectedLocations.length === locationOptions.length;
    const locationParam = !isAll && selectedLocations.length === 1 ? selectedLocations[0] : undefined;
    setLoading(true);
    fetchHistoryAggregate(metric, from, to, "1h", locationParam)
      .then((res) => setApiChartData(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, [dateRange, metric, selectedLocations, locationOptions.length, customFrom, customTo, availableSensors.length]);

  // Sync local filters to global app state for cross-page consistency.
  useEffect(() => {
    setFilters({ dateRange, metric, location: selectedLocations });
  }, [dateRange, metric, selectedLocations]);

  const locationKeys = useMemo(() => {
    if (selectedLocations.length === 0) return [];
    return selectedLocations;
  }, [selectedLocations]);

  const filteredChartData = useMemo(() => {
    if (selectedLocations.length === 0) return [];
    if (selectedLocations.length === locationOptions.length) return chartData;
    return chartData.map((row) => {
      const next: Record<string, any> = { date: row.date };
      selectedLocations.forEach((key) => {
        if (row[key] !== undefined) next[key] = row[key];
      });
      return next;
    });
  }, [chartData, selectedLocations, locationOptions.length]);

  // Calculate stats
  const allValues = filteredChartData.length > 0 && locationKeys.length > 0
    ? filteredChartData
        .flatMap((d) => locationKeys.map((key) => Number(d[key])))
        .filter((value) => Number.isFinite(value))
    : [];

  const avgValue = allValues.length
    ? (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(1)
    : "—";
  const maxValue = allValues.length ? Math.max(...allValues).toFixed(1) : "—";
  const minValue = allValues.length ? Math.min(...allValues).toFixed(1) : "—";

  const metricLabels: Record<MetricType, { label: string; unit: string }> = {
    aqi: { label: "AQI", unit: "" },
    temperature: { label: "Temperature", unit: "°C" },
    humidity: { label: "Humidity", unit: "%" },
    waterLevel: { label: "Water Level", unit: "m" },
  };
  const trendDescriptions: Record<MetricType, string> = {
    aqi: "Air Quality Index shows how polluted the air is; higher means worse air quality.",
    temperature: "Temperature trends show how hot or cold it has been over time.",
    humidity: "Humidity trends show how much moisture is in the air over time.",
    waterLevel: "Water Level trends show changes in water height over time.",
  };

  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, "dd MMM, HH:mm");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {(loading || sensorsLoading) && <p className="text-xs text-zinc-400">Loading historical data...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load history: {apiError}</p>}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Historical Data Analytics</h1>
        <p className="text-zinc-400 mt-1">Analyze environmental trends and patterns over time</p>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className={dateRange === "custom" ? "grid grid-cols-5 gap-4" : "grid grid-cols-4 gap-4"}>
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Date Range</label>
            <SingleSelectDropdown
              id="historical-date-range"
              options={dateRangeOptions}
              value={dateRange}
              onChange={(value) => setDateRange(value as AppStateDateRange)}
              placeholder="Select range"
            />
          </div>

          {dateRange === "custom" && (
            <>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={customFrom ? format(customFrom, "yyyy-MM-dd") : ""}
                  onChange={(e) => setCustomFrom(e.target.value ? new Date(e.target.value) : undefined)}
                  className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={customTo ? format(customTo, "yyyy-MM-dd") : ""}
                  onChange={(e) => setCustomTo(e.target.value ? new Date(e.target.value) : undefined)}
                  className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Metric Type</label>
            <SingleSelectDropdown
              id="historical-metric"
              options={metricOptions}
              value={metric}
              onChange={(value) => setMetric(value as MetricType)}
              placeholder="Select metric"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Sensor Location</label>
            <MultiSelectDropdown
              id="historical-location-filter"
              placeholder="All Locations"
              allLabel="All Locations"
              emptyLabel="No locations"
              multipleLabel="Multiple locations"
              options={locationOptions}
              selected={selectedLocations}
              onChange={setSelectedLocations}
            />
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {!loading && !sensorsLoading && !apiError && availableSensors.length === 0 && (
        <EmptyState
          title="No sensors for this metric"
          description="Add sensors of this type or choose a different metric."
        />
      )}
      {!loading && !sensorsLoading && !apiError && availableSensors.length > 0 && filteredChartData.length === 0 && (
        <EmptyState title="No historical data available" description="Try a different date range or location." />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-zinc-400">
              Average {metricLabels[metric].label}
            </p>
          </div>
          <p className="text-2xl font-bold text-zinc-100">
            {avgValue}
            <span className="text-sm text-zinc-400 ml-1">{metricLabels[metric].unit}</span>
          </p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <p className="text-xs text-zinc-400">
              Highest {metricLabels[metric].label}
            </p>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {maxValue}
            <span className="text-sm text-zinc-400 ml-1">{metricLabels[metric].unit}</span>
          </p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-zinc-400">
              Lowest {metricLabels[metric].label}
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {minValue}
            <span className="text-sm text-zinc-400 ml-1">{metricLabels[metric].unit}</span>
          </p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <span>Alerts Triggered</span>
              <details className="relative group" onBlur={(e) => e.currentTarget.removeAttribute("open")}>
                <summary className="list-none cursor-pointer">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-600 text-[10px] text-zinc-300">
                    i
                  </span>
                </summary>
                <div className="absolute z-10 mt-2 w-56 rounded-md border border-zinc-700 bg-zinc-900 p-2 text-[11px] text-zinc-200 shadow-lg">
                  Number of alerts generated for this metric in the selected time range.
                </div>
              </details>
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-400">12</p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            {metricLabels[metric].label} Trends
            <details className="relative group" onBlur={(e) => e.currentTarget.removeAttribute("open")}>
              <summary className="list-none cursor-pointer">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-600 text-[10px] text-zinc-300">
                  i
                </span>
              </summary>
              <div className="absolute z-10 mt-2 w-72 rounded-md border border-zinc-700 bg-zinc-900 p-2 text-[11px] text-zinc-200 shadow-lg">
                {trendDescriptions[metric]}
              </div>
            </details>
          </h2>
        </div>
        <div className="p-6">
          {filteredChartData.length === 0 ? (
            <EmptyState
              title="No chart data"
              description="Try a different date range or select another location."
            />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tickFormatter={formatTimestamp} />
                <YAxis stroke="#71717a" unit={metricLabels[metric].unit || undefined} />
                <Tooltip
                  labelFormatter={(label) => formatTimestamp(String(label))}
                  formatter={(value: any) => {
                    const num = typeof value === "number" ? value : Number(value);
                    const display = Number.isFinite(num) ? num.toFixed(1) : value;
                    return [`${display}${metricLabels[metric].unit ? " " + metricLabels[metric].unit : ""}`, ""];
                  }}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                />
                <Legend />
                {locationKeys.map((key, index) => {
                  const palette = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#22c55e"];
                  const color = palette[index % palette.length];
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, r: 4 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Data Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Recent Readings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
                {locationKeys.map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredChartData.slice(0, 10).map((row, index) => (
                <tr key={index} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {formatTimestamp(String(row.date))}
                  </td>
                  {locationKeys.map((key) => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
                      {Number(row[key] ?? 0).toFixed(1)} {metricLabels[metric].unit}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

type MultiSelectProps = {
  id: string;
  placeholder: string;
  allLabel: string;
  emptyLabel: string;
  multipleLabel: string;
  options: string[];
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
    if (selected.length === 1) return selected[0];
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

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options);
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
              key={option}
              className="flex items-center gap-2 px-2 py-1 text-sm text-zinc-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
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
                  onChange={() => onChange(option.value)}
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
