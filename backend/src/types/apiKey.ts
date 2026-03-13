// DTOs for ApiKeyService (Public API)
// Maps to Figma PublicAPI apiKeys list.

export interface ApiKeyDTO {
  id: string;
  name: string;
  key?: string; // returned only on creation
  created: string;
  lastUsed: string;
  requests: number;
}

