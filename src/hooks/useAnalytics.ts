import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/analytics/summary/");
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // refetch every 5 min
  });
}

export function useRegistrationsOverTime(days = 30) {
  return useQuery({
    queryKey: ["analytics", "registrations-over-time", days],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/v1/analytics/registrations-over-time/?days=${days}`,
      );
      return data.data;
    },
  });
}

export function useRevenueOverTime(months = 6) {
  return useQuery({
    queryKey: ["analytics", "revenue-over-time", months],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/v1/analytics/revenue-over-time/?months=${months}`,
      );
      return data.data;
    },
  });
}

export function useTopEvents(limit = 5) {
  return useQuery({
    queryKey: ["analytics", "top-events", limit],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/v1/analytics/top-events/?limit=${limit}`,
      );
      return data.data;
    },
  });
}
