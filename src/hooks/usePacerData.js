
import { useEffect, useState } from "react";
import { getPacerData } from "../services/pacerApi";

const INITIAL_DATA = {
  pfas: [],
  sma: [],
  summary: {
    pfasFiled: 0,
    smaFiled: 0,
    smaEmailSummons: 0,
    totalPfasRecords: 0,
    totalSmaRecords: 0
  },
  lastUpdated: null
};

export default function usePacerData() {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let controller = null;

    async function loadData() {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      try {
        const result = await getPacerData(
          currentController.signal
        );

        if (active && !currentController.signal.aborted) {
          setData(result);
          setError("");
        }
      } catch (err) {
        if (active && !currentController.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (active && !currentController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    const interval = setInterval(
      loadData,
      30000
    );

    return () => {
      active = false;
      clearInterval(interval);
      controller?.abort();
    };
  }, []);

  return {
    data,
    loading,
    error
  };
}
