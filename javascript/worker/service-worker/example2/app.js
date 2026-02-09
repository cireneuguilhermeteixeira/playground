async function registerSW() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not support in this browser.");
  }
  const reg = await navigator.serviceWorker.register("sw.js");
  await navigator.serviceWorker.ready;
  return reg;
}

function setProgress(pct, text) {
  document.getElementById("bar").style.width = `${pct}%`;
  document.getElementById("status").textContent = text;
}

function waitForMessage(type) {
  return new Promise((resolve) => {
    const handler = (e) => {
      if (e.data?.type === type) {
        navigator.serviceWorker.removeEventListener("message", handler);
        resolve(e.data);
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
  });
}

async function preloadAndOpen() {
  const btn = document.getElementById("btn");
  btn.disabled = true;

  setProgress(5, "Registering Service Worker…");
  await registerSW();

  if (!navigator.serviceWorker.controller) {
    setProgress(15, "Activating Service Worker… reloading page");
    location.reload();
    return;
  }

  navigator.serviceWorker.addEventListener("message", (e) => {
    if (e.data?.type === "PRECACHE_PROGRESS") {
      setProgress(e.data.pct, e.data.text);
    }
  });

  setProgress(20, "Init pre-cache…");
  navigator.serviceWorker.controller.postMessage({ type: "PRECACHE_HEAVY" });

  const done = await waitForMessage("PRECACHE_DONE");
  setProgress(100, `Cache ready (${done.cachedCount} items). Opening heavy.html…`);

  setTimeout(() => (location.href = "heavy.html"), 250);
}

document.getElementById("btn").addEventListener("click", preloadAndOpen);
setProgress(0, "Click in “Preloading and open.");
