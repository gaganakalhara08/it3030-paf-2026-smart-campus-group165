import { API_BASE_URL, getAuthHeaders } from "./api";

const RESOURCE_URL = `${API_BASE_URL}/resources`;

// ── GET: search / filter catalogue
export const searchResources = async ({
  type = "",
  status = "",
  minCapacity = "",
  location = "",
  keyword = "",
  page = 0,
  size = 12,
  sortBy = "name",
  sortDir = "asc",
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

  const res = await fetch(`${RESOURCE_URL}?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch resources");
  return res.json();
};

// ── GET: single resource
export const getResourceById = async (id) => {
  const res = await fetch(`${RESOURCE_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Resource not found");
  return res.json();
};

// ── GET: catalogue stats (admin)
export const getResourceStats = async () => {
  const res = await fetch(`${RESOURCE_URL}/stats`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
};

// ── POST: create resource (admin)
export const createResource = async (data) => {
  const res = await fetch(RESOURCE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
};

// ── PUT: full update (admin)
export const updateResource = async (id, data) => {
  const res = await fetch(`${RESOURCE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
};

// ── PATCH: status update (admin)
export const updateResourceStatus = async (id, status) => {
  const res = await fetch(`${RESOURCE_URL}/${id}/status?status=${status}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
};

// ── DELETE: remove resource (admin)
export const deleteResource = async (id) => {
  const res = await fetch(`${RESOURCE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const json = await res.json();
    throw json;
  }
  return res.json();
};
