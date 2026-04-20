import { useState, useEffect, useCallback } from "react";
import { searchResources } from "../services/resourceService";

export const useResources = (initialFilters = {}) => {
  const [resources, setResources] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    minCapacity: "",
    location: "",
    keyword: "",
    page: 0,
    size: 12,
    sortBy: "name",
    sortDir: "asc",
    ...initialFilters,
  });

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchResources(filters);
      setResources(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
  };

  const setPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return {
    resources,
    totalPages,
    totalElements,
    loading,
    error,
    filters,
    updateFilters,
    setPage,
    refetch: fetchResources,
  };
};
