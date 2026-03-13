// HistoryService: historical and aggregate data access

export async function getHistoryReadings(query: unknown) {
  // Should return raw readings filtered by time range.
  return null;
}

export async function getHistoryAggregate(query: unknown) {
  // Should return HistoryPointDTO[] for charts.
  return null;
}

export async function getDeviceAggregate(id: string, query: unknown) {
  // Should return device-level aggregates.
  return null;
}

export async function exportHistory(query: unknown) {
  // Should generate export or return export job metadata.
  return null;
}

