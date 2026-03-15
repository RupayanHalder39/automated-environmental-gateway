import { apiGet } from "../utils/apiClient";
import type { ApiResponse } from "../types/response";
import type { LocationDTO } from "../types/location";

export function fetchLocations() {
  return apiGet<ApiResponse<LocationDTO[]>>("/locations");
}
