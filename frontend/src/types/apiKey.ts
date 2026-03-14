export interface ApiKeyDTO {
  id: string;
  name: string;
  key?: string;
  created: string;
  lastUsed: string;
  requests: number;
}

