import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { FileText, Download, CalendarIcon, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { createReport, fetchReports } from "../services/reportService";
import { EmptyState } from "../components/EmptyState";

export function Reports() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [selectedZone, setSelectedZone] = useState("all");
  const [apiReports, setApiReports] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Connect to backend: load reports for Reports UI.
  useEffect(() => {
    fetchReports()
      .then((res) => {
        setApiReports((res.data as any) || []);
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const generatedReports = apiReports;
  const now = new Date();
  const thisMonthCount = generatedReports.filter((report) => {
    const date = new Date(report.generated);
    return !Number.isNaN(date.getTime()) &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  }).length;
  const scheduledCount = 0;
  const totalDownloads = 0;
  const zoneLabelMap: Record<string, string> = {
    all: "All Zones",
    saltlake: "Salt Lake",
    newtown: "New Town",
    sectorv: "Sector V",
    rajarhat: "Rajarhat",
    parkstreet: "Park Street",
  };

  const handleGenerateReport = async () => {
    setCreating(true);
    setApiError(null);
    try {
      const fromLabel = dateFrom ? format(dateFrom, "PP") : "N/A";
      const toLabel = dateTo ? format(dateTo, "PP") : "N/A";
      const zoneLabel = zoneLabelMap[selectedZone] || "All Zones";
      const payload = {
        name: `${zoneLabel} Report`,
        type: "Custom Range",
        zone: zoneLabel,
        dateRange: `${fromLabel} - ${toLabel}`,
      };
      const res = await createReport(payload);
      const created = (res.data as any) || payload;
      setApiReports((prev) => [created, ...prev]);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Loading / Error Banner */}
      {loading && <p className="text-xs text-zinc-400">Loading reports...</p>}
      {apiError && <p className="text-xs text-red-400">Failed to load reports: {apiError}</p>}

      {/* Empty State */}
      {!loading && !apiError && generatedReports.length === 0 && (
        <EmptyState title="No reports generated" description="Create a report to see it listed here." />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Automated Report Generation</h1>
        <p className="text-zinc-400 mt-1">Generate comprehensive environmental reports for city zones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Reports</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{generatedReports.length}</p>
            </div>
            <FileText className="w-8 h-8 text-zinc-600" />
          </div>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-400/80 uppercase tracking-wide">This Month</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{thisMonthCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Scheduled</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{scheduledCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Downloads</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{totalDownloads}</p>
            </div>
            <Download className="w-8 h-8 text-emerald-500/50" />
          </div>
        </Card>
      </div>

      {/* Generate Report */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Generate New Report</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">City Zone</label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="saltlake">Salt Lake</SelectItem>
                  <SelectItem value="newtown">New Town</SelectItem>
                  <SelectItem value="sectorv">Sector V</SelectItem>
                  <SelectItem value="rajarhat">Rajarhat</SelectItem>
                  <SelectItem value="parkstreet">Park Street</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-100"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="bg-zinc-800 text-zinc-100"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-100"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="bg-zinc-800 text-zinc-100"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={creating}
            onClick={handleGenerateReport}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </Card>

      {/* Generated Reports */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Generated Reports</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {generatedReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-zinc-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-zinc-100">{report.name}</h3>
                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {report.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-zinc-400 mb-3">
                    <span>ID: {report.id}</span>
                    <span>Zone: {report.zone}</span>
                    <span>Generated: {report.generated}</span>
                  </div>
                  <p className="text-sm text-zinc-400">Period: {report.dateRange}</p>
                </div>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-zinc-800 border-zinc-700 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-zinc-400">Average AQI</p>
                  </div>
                  <p className="text-xl font-bold text-yellow-400">{report.avgAqi}</p>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <p className="text-xs text-zinc-400">Highest Pollution</p>
                  </div>
                  <p className="text-sm font-bold text-red-400">{report.highestPollution}</p>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <p className="text-xs text-zinc-400">Water Alerts</p>
                  </div>
                  <p className="text-xl font-bold text-orange-400">{report.waterAlerts}</p>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
