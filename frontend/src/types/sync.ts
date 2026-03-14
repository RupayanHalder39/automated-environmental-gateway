export interface SyncBatchDTO {
  id: string;
  deviceId: string;
  packets: number;
  received: number;
  rejected: number;
  duration: string;
  timestamp: string;
  status: string;
}

