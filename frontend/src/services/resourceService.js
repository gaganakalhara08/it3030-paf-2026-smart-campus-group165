import { API_BASE_URL, getAuthHeaders } from "./api";

export const searchResources = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 0,
      size: params.size || 12,
      status: params.status !== undefined ? params.status : "ACTIVE",
      type: params.type || "",
      minCapacity: params.minCapacity || "",
      location: params.location || "",
      keyword: params.keyword || "",
      sortBy: params.sortBy || "name",
      sortDir: params.sortDir || "asc",
    });

    // Remove empty params
    for (let [key, value] of queryParams.entries()) {
      if (!value) {
        queryParams.delete(key);
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/resources?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch resources");
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching resources:", error);
    throw error;
  }
};

export const getResourceById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch resource");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching resource:", error);
    throw error;
  }
};

export const getResourceAvailability = async (resourceId, date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/resources/${resourceId}/availability?date=${date}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch availability");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching availability:", error);
    throw error;
  }
};

// Alias for ResourceAvailabilityCalendar.jsx compatibility
export const getDayAvailability = async (resourceId, date) => {
  return getResourceAvailability(resourceId, date);
};

export const getResourceStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch resource stats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching resource stats:", error);
    throw error;
  }
};

export const getResourceAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/analytics`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch analytics");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
};

export const createResource = async (resourceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });

    if (!response.ok) {
      throw new Error("Failed to create resource");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error;
  }
};

export const updateResource = async (id, resourceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });

    if (!response.ok) {
      throw new Error("Failed to update resource");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
};

export const updateResourceStatus = async (id, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/resources/${id}/status?status=${status}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update resource status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating resource status:", error);
    throw error;
  }
};

export const deleteResource = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete resource");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
};