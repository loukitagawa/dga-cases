import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_PACER_API_URL;

const REFRESH_INTERVAL = 15000;

export default function useTeamActivity() {
  const [activities, setActivities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    let mounted = true;
    let pending = false;
    let cleanupRequest = null;

    function loadActivities() {
      if (!mounted || pending) return;

      if (!API_URL) {
        setError("Missing PACER API URL.");
        setLoading(false);
        return;
      }

      let url;

      try {
        url = new URL(API_URL);
      } catch {
        setError("Invalid PACER API URL.");
        setLoading(false);
        return;
      }

      pending = true;

      const callbackName =
        "pacerActivity_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2);

      const script =
        document.createElement("script");

      url.searchParams.set(
        "action",
        "activities"
      );

      url.searchParams.set(
        "callback",
        callbackName
      );

      url.searchParams.set(
        "_",
        Date.now()
      );

      let timeout;

      function cleanup() {
        clearTimeout(timeout);

        script.remove();

        delete window[callbackName];

        pending = false;
        cleanupRequest = null;
      }

      cleanupRequest = cleanup;

      window[callbackName] = data => {
        if (mounted) {
          if (data?.success) {
            setActivities(
              Array.isArray(data.activities)
                ? data.activities
                : []
            );

            setError(null);

          } else {
            setError(
              data?.error ||
              "Unable to load activity."
            );
          }

          setLoading(false);
        }

        cleanup();
      };

      script.onerror = () => {
        if (mounted) {
          setError(
            "Failed to load activity."
          );

          setLoading(false);
        }

        cleanup();
      };

      timeout = setTimeout(() => {
        if (mounted) {
          setError(
            "Activity request timed out."
          );

          setLoading(false);
        }

        cleanup();
      }, 15000);

      script.src = url.toString();
      script.async = true;

      document.body.appendChild(script);
    }

    loadActivities();

    const interval = setInterval(
      loadActivities,
      REFRESH_INTERVAL
    );

    return () => {
      mounted = false;

      clearInterval(interval);

      if (cleanupRequest) {
        cleanupRequest();
      }
    };
  }, []);

  return {
    activities,
    loading,
    error
  };
}