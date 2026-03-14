import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalendarIcon, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { format } from "date-fns";
import { fetchHistoryAggregate } from "../services/historyService";
import { useAppState } from "../utils/AppState";
import { EmptyState } from "../components/EmptyState";

// Mock data for charts
const generateMockData = (metric: string, days: number) => {
  const data = [];
  const baseValues: Record<string, number> = {
    aqi: 80,
    temperature: 28,
    humidity: 65,
    waterLevel: 2.5,
  };

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const baseValue = baseValues[metric] || 50;
    const variance = Math.random() * 20 - 10;

    data.push({
      date: format(date, "MMM dd"),
      "Salt Lake": Math.max(0, baseValue + variance + Math.random() * 10),
      "New Town": Math.max(0, baseValue + variance + Math.random() * 15),
      "Sector V": Math.max(0, baseValue + variance + Math.random() * 20),
    });
  }
  return data;
};

type MetricType = "aqi" | "temperature" | "humidity" | "waterLevel";

export function HistoricalData() {
  const { filters, setFilters } = useAppState();
  const [dateRange, setDateRange] = useState(filters.dateRange);
  const [metric, setMetric] = useState<MetricType>(filters.metric);
  const [location, setLocation] = useState(filters.location);
  const [customDate, setCustomDate] = useState<Date | undefined>(new Date());
  const [apiChartData, setApiChartData] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const daysMap: Record<string, number> = {
    "24hours": 1,
    "7days": 7,
    "30days": 30,
  };

  const chartData = apiChartData;

  // Connect to backend: load aggregated chart data for historical trends.
  useEffect(() => {
    const days = daysMap[dateRange] || 7;
    const to = new Date().toISOString();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    fetchHistoryAggregate(metric, from, to, "1h", location === "all" ? undefined : location)
      .then((res) => setApiChartData(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, [dateRange, metric, location]);

  // Sync local filters to global app state for cross-page consistency.
  useEffect(() => {
    setFilters({ dateRange, metric, location });
  }, [dateRange, metric, location]);

  // Calculate stats
  const allValues = chartData.length > 0
    ? chartData.flatMap((d) => [d["Salt Lake"], d["New Town"], d["Sector V"]])
    : [0];
  const avgValue = (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(1);
  const maxValue = Math.max(...allValues).toFixed(1);
  const minValue = Math.min(...allValues).toFixed(1);

  const metricLabels: Record<MetricType, { label: string; unit: string }> = {
    aqi: { label: "AQI", unit: "" },
    temperature: { label: "Temperature", unit: "°C" },
    humidity: { label: "Humidity", unit: "%" },
    waterLevel: { label: "Water Level", unit: "m" },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading historical data...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load history: {apiError}</p>}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Historical Data Analytics</h1>
        <p className="text-zinc-400 mt-1">Analyze environmental trends and patterns over time</p>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="24hours">Last 24 Hours</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === "custom" && (
            <div>
              <label className="text-xs text-zinc-400 mb-2 block">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-100"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                  <Calendar
                    mode="single"
                    selected={customDate}
                    onSelect={setCustomDate}
                    initialFocus
                    className="bg-zinc-800 text-zinc-100"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Metric Type</label>
            <Select value={metric} onValueChange={(value) => setMetric(value as MetricType)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="aqi">Air Quality Index (AQI)</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="humidity">Humidity</SelectItem>
                <SelectItem value="waterLevel">Water Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Sensor Location</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="saltlake">Salt Lake</SelectItem>
                <SelectItem value="newtown">New Town</SelectItem>
                <SelectItem value="sectorv">Sector V</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {!loading && !apiError && chartData.length === 0 && (
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
            <p className="text-xs text-zinc-400">Alerts Triggered</p>
          </div>
          <p className="text-2xl font-bold text-orange-400">12</p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">
            {metricLabels[metric].label} Trends
          </h2>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Salt Lake"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="New Town"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Sector V"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Salt Lake
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  New Town
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Sector V
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {chartData.slice(0, 10).map((row, index) => (
                <tr key={index} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
                    {row["Salt Lake"].toFixed(1)} {metricLabels[metric].unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
                    {row["New Town"].toFixed(1)} {metricLabels[metric].unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100">
                    {row["Sector V"].toFixed(1)} {metricLabels[metric].unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
