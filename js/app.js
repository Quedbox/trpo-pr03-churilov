const metricsElement = document.getElementById("metrics");
const rowsElement = document.getElementById("activityRows");
const loadErrorElement = document.getElementById("loadError");

function statusBadge(status) {
  const colors = { "Готово": "text-bg-success", "В работе": "text-bg-primary", "Новая": "text-bg-secondary" };
  return `<span class="badge ${colors[status] || "text-bg-secondary"}">${status}</span>`;
}

async function loadDashboard() {
  try {
    const response = await fetch("data/dashboard.json");
    if (!response.ok) throw new Error("Не удалось прочитать JSON");
    const dashboard = await response.json();

    metricsElement.innerHTML = dashboard.metrics.map((metric) => `
      <div class="col"><article class="card h-100"><div class="card-body">
        <h2 class="h6 text-body-secondary">${metric.title}</h2>
        <p class="fs-3 fw-semibold mb-0">${metric.value}</p>
      </div></article></div>
    `).join("");

    rowsElement.innerHTML = dashboard.rows.map((row) => `
      <tr><th scope="row">${row.id}</th><td>${row.action}</td><td>${statusBadge(row.status)}</td></tr>
    `).join("");
  } catch (error) {
    loadErrorElement.classList.remove("d-none");
  }
}

loadDashboard();
