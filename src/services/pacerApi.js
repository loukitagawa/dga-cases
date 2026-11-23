
const API_URL = import.meta.env.VITE_PACER_API_URL;

export function getPacerData(signal) {
  return new Promise((resolve, reject) => {
    if (!API_URL) {
      reject(new Error("Google Apps Script URL is missing."));
      return;
    }

    if (signal?.aborted) {
      reject(new Error("Request cancelled"));
      return;
    }

    const callbackName =
      "pacerCallback_" +
      Math.random().toString(36).slice(2);

    const script = document.createElement("script");

    let finished = false;
    let timeoutId;

    function cleanup() {
      clearTimeout(timeoutId);
      script.remove();
      window[callbackName] = () => {};

      signal?.removeEventListener("abort", onAbort);
    }

    function finish(error, data) {
      if (finished) return;

      finished = true;
      cleanup();

      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    }

    function onAbort() {
      finish(new Error("Request cancelled"));
    }

    window[callbackName] = (data) => {
      if (!data?.success) {
        finish(
          new Error(
            data?.error || "Google Apps Script error"
          )
        );
        return;
      }

      finish(null, data);
    };

    script.onerror = () => {
      finish(
        new Error(
          "Unable to load Google Apps Script. Check deployment access and URL."
        )
      );
    };

    timeoutId = setTimeout(() => {
      finish(
        new Error(
          "Google Apps Script request timed out."
        )
      );
    }, 20000);

    signal?.addEventListener(
      "abort",
      onAbort,
      { once: true }
    );

    const separator = API_URL.includes("?")
      ? "&"
      : "?";

    script.src =
      `${API_URL}${separator}action=all` +
      `&callback=${callbackName}` +
      `&_=${Date.now()}`;

    document.body.appendChild(script);
  });
}
