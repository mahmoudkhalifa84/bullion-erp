/* global frappe */

window.bhCharts = {
  buildPlaceholder(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    container.innerHTML = `
      <div class="bh-chart-placeholder">
        <p>${__("Charts will render here once data is connected.")}</p>
      </div>
    `;
  },
};
