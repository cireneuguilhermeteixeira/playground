const app = document.getElementById("app");
if (app) app.textContent = "host running — loading remotelly modules...";

async function run() {
  const { add } = await import("remote1/math");
  const result = add(40, 2);

  const out = document.createElement("pre");
  out.textContent = `Result of add(40, 2) from remote: ${result}`;
  document.body.appendChild(out);
}

run().catch((err) => {
  console.error("Error loading remote:", err);
});
