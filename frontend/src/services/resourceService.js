import { API_BASE_URL, getAuthHeaders } from "./api";

const RESOURCE_URL = `${API_BASE_URL}/resources`;

export const searchResources = async ({
  type = "", status = "", minCapacity = "", location = "",
  keyword = "", page = 0, size = 12, sortBy = "name", sortDir = "asc",
} = {}) => {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (status) params.append("status", status);
  if (minCapacity) params.append("minCapacity", minCapacity);
  if (location) params.append("location", location);
  if (keyword) params.append("keyword", keyword);
  params.append("page", page);
  params.append("size", size);
  params.append("sortBy", sortBy);
  params.append("sortDir", sortDir);
  const res = await fetch(`${RESOURCE_URL}?${params}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch resources");
  return res.json();
};

export const getResourceById = async (id) => {
  const res = await fetch(`${RESOURCE_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Resource not found");
  return res.json();
};

export const getResourceStats = async () => {
  const res = await fetch(`${RESOURCE_URL}/stats`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

// Feature 1 — Usage Analytics
export const getResourceAnalytics = async () => {
  const res = await fetch(`${RESOURCE_URL}/analytics`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
};

// Feature 3 — Day Availability
export const getDayAvailability = async (resourceId, date) => {
  // date should be a string like "2026-04-20"
  const res = await fetch(`${RESOURCE_URL}/${resourceId}/availability?date=${date}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch availability");
  return res.json();
};

export const createResource = async (data) => {
  const res = await fetch(RESOURCE_URL, {
    method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
};

export const updateResource = async (id, data) => {
  const res = await fetch(`${RESOURCE_URL}/${id}`, {
    method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
};

export const updateResourceStatus = async (id, status) => {
  const res = await fetch(`${RESOURCE_URL}/${id}/status?status=${status}`, {
    method: "PATCH", headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
};

export const deleteResource = async (id) => {
  const res = await fetch(`${RESOURCE_URL}/${id}`, {
    method: "DELETE", headers: getAuthHeaders(),
  });
  if (!res.ok) { const json = await res.json(); throw json; }
  return res.json();
};
