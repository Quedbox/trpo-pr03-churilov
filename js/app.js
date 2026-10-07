const metricsElement = document.getElementById("metrics");
const rowsElement = document.getElementById("activityRows");
const notificationsElement = document.getElementById("notificationList");
const loadErrorElement = document.getElementById("loadError");
const filterElement = document.getElementById("activityFilter");
const addForm = document.getElementById("addForm");
const actionName = document.getElementById("actionName");
const actionFeedback = document.getElementById("actionFeedback");
const unreadBadge = document.getElementById("unreadBadge");
const notificationState = document.getElementById("notificationState");
const toastElement = document.getElementById("actionToast");
const toastMessage = document.getElementById("toastMessage");

const addModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("addModal"));
const actionToast = bootstrap.Toast.getOrCreateInstance(toastElement);

let notificationData = [];
let nextId = 1;

function statusBadge(status) {
  const colors = {
    "Готово": "text-bg-success",
    "В работе": "text-bg-primary",
    "Новая": "text-bg-secondary"
  };
  return `<span class="badge ${colors[status] || "text-bg-secondary"}">${status}</span>`;
}

function renderDashboard(dashboard) {
  metricsElement.innerHTML = dashboard.metrics.map((metric) => `
    <div class="col">
      <article class="card h-100">
        <div class="card-body">
          <h2 class="h6 text-body-secondary">${metric.title}</h2>
          <p class="fs-3 fw-semibold mb-0">${metric.value}</p>
        </div>
      </article>
    </div>
  `).join("");

  rowsElement.innerHTML = dashboard.rows.map((row) => `
    <tr>
      <th scope="row">${row.id}</th>
      <td>${row.action}</td>
      <td>${statusBadge(row.status)}</td>
    </tr>
  `).join("");

  nextId = Math.max(...dashboard.rows.map((row) => row.id)) + 1;
}

const typeLabels = {
  success: "Успех",
  warning: "Предупреждение"
};

function renderNotifications(notifications) {
  notificationData = notifications;
  notificationsElement.innerHTML = notifications.map((notification) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      ${notification.text}
      <span class="badge text-bg-${notification.type === "success" ? "success" : "warning"}"> ${typeLabels[notification.type] ?? notification.type}</span>
    </li>
  `).join("");
  unreadBadge.textContent = notifications.length;
}

async function loadData() {
  try {
    const [dashboardResponse, notificationsResponse] = await Promise.all([
      fetch("data/dashboard.json"),
      fetch("data/notifications.json")
    ]);

    if (!dashboardResponse.ok || !notificationsResponse.ok) {
      throw new Error("Не удалось прочитать JSON-файлы");
    }

    const [dashboard, notifications] = await Promise.all([
      dashboardResponse.json(),
      notificationsResponse.json()
    ]);

    renderDashboard(dashboard);
    renderNotifications(notifications);
  } catch (error) {
    loadErrorElement.classList.remove("d-none");
  }
}

function filterRows() {
  const query = filterElement.value.trim().toLocaleLowerCase("ru");

  rowsElement.querySelectorAll("tr").forEach((row) => {
    row.classList.toggle("d-none", !row.textContent.toLocaleLowerCase("ru").includes(query));
  });
}

filterElement.addEventListener("input", filterRows);

document.getElementById("markReadButton").addEventListener("click", () => {
  unreadBadge.classList.add("d-none");
  notificationState.textContent = "Уведомления отмечены прочитанными.";
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = actionName.value.trim();
  const isValid = name.length >= 2;
  actionName.classList.toggle("is-invalid", !isValid);
  actionName.classList.toggle("is-valid", isValid);

  if (!isValid) {
    actionFeedback.textContent = notificationData.find((item) => item.type === "warning")?.text
      || "Введите не менее двух символов.";
    return;
  }

  const row = document.createElement("tr");
  row.innerHTML = `<th scope="row">${nextId++}</th><td></td><td>${statusBadge("Новая")}</td>`;
  row.cells[1].textContent = name;
  rowsElement.prepend(row);
  filterRows();

  toastMessage.textContent = notificationData.find((item) => item.type === "success")?.text
    || "Изменения сохранены.";
  addForm.reset();
  actionName.classList.remove("is-valid", "is-invalid");
  addModal.hide();
  actionToast.show();
});

loadData();
