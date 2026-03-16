import { useEffect, useRef, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { FileText, Download, CalendarIcon, TrendingUp, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { createReport, deleteReport, downloadReport, fetchReports } from "../services/reportService";
import { fetchSensors } from "../services/sensorService";
import type { SensorDTO } from "../types/sensor";
import { EmptyState } from "../components/EmptyState";

export function Reports() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [apiReports, setApiReports] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<SensorDTO[]>([]);
  const [sensorsLoading, setSensorsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const messageTimerRef = useRef<number | null>(null);
  const didInitZones = useRef(false);

  // Connect to backend: load reports for Reports UI.
  useEffect(() => {
    fetchReports()
      .then((res) => {
        setApiReports((res.data as any) || []);
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSensors(true)
      .then((res) => setSensors(res.data || []))
      .catch((err) => setApiError(err.message))
      .finally(() => setSensorsLoading(false));
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
  const totalDownloads = downloadCount;
  const zoneOptions = Array.from(new Set(sensors.map((sensor) => sensor.location))).sort();

  useEffect(() => {
    if (!didInitZones.current && selectedZones.length === 0 && zoneOptions.length > 0) {
      setSelectedZones(zoneOptions);
      didInitZones.current = true;
    }
  }, [selectedZones.length, zoneOptions.length]);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const handleGenerateReport = async () => {
    if (selectedZones.length === 0) {
      setApiError("Please select at least one city zone.");
      return;
    }
    setCreating(true);
    setApiError(null);
    try {
      const fromLabel = dateFrom ? format(dateFrom, "PP") : "N/A";
      const toLabel = dateTo ? format(dateTo, "PP") : "N/A";
      const zoneLabel =
        zoneOptions.length > 0 && selectedZones.length === zoneOptions.length
          ? "All Zones"
          : selectedZones.length === 1
            ? selectedZones[0]
            : "Multiple Zones";
      const payload = {
        name: `${zoneLabel} Report`,
        type: "Custom Range",
        zone: zoneLabel,
        dateRange: `${fromLabel} - ${toLabel}`,
      };
      const res = await createReport(payload);
      const created = (res.data as any) || payload;
      setApiReports((prev) => [created, ...prev]);
      setGenerateMessage("Report has been generated. You can download it from the Generated Reports list.");
      if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
      messageTimerRef.current = window.setTimeout(() => {
        setGenerateMessage(null);
      }, 5000);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    setDeletingId(id);
    setApiError(null);
    try {
      await deleteReport(id);
      setApiReports((prev) => prev.filter((report) => report.id !== id));
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadReport = async (report: any) => {
    if (!report?.id) return;
    setDownloadingId(report.id);
    setApiError(null);
    try {
      const { blob, filename } = await downloadReport(report.id);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename || `${report.name || "report"}-${report.id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setDownloadCount((prev) => prev + 1);
    } catch (err: any) {
      console.error("Report download failed:", err);
      setApiError(err.message || "Failed to download report.");
    } finally {
      setDownloadingId(null);
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
              <MultiSelectDropdown
                id="reports-zone"
                placeholder="All Zones"
                allLabel="All Zones"
                emptyLabel="No zones"
                multipleLabel="Multiple zones"
                options={zoneOptions}
                selected={selectedZones}
                onChange={setSelectedZones}
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">From Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={dateFrom ? format(dateFrom, "yyyy-MM-dd") : ""}
                  onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
                  className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">To Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={dateTo ? format(dateTo, "yyyy-MM-dd") : ""}
                  onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
                  className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
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
          {generateMessage && (
            <p className="text-xs text-emerald-400">{generateMessage}</p>
          )}
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
                    <span>
                      Generated:{" "}
                      {report.generated
                        ? format(new Date(report.generated), "PPpp")
                        : "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">Period: {report.dateRange}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteReport(report.id)}
                    disabled={deletingId === report.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleDownloadReport(report)}
                    disabled={downloadingId === report.id}
                  >
                    {downloadingId === report.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
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
