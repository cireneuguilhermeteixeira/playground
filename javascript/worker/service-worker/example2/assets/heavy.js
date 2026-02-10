(async () => {
  const out = document.getElementById("out");

  const t0 = performance.now();
  let sum = 0;
  for (let i = 0; i < 50_000_00; i++) sum += i % 97;
  const t1 = performance.now();

  const res = await fetch("assets/big-data.json", { cache: "no-store" }); 
  const json = await res.json();

  out.textContent =
    `CPU fake: ${(t1 - t0).toFixed(0)}ms\n` +
    `big-data.json keys: ${Object.keys(json).length}\n` +
    `sum: ${sum}\n` +
    `Dica: DevTools → Application → Cache Storage.`;
})();
