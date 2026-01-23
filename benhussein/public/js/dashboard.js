/* global frappe */

frappe.require(["/assets/benhussein/js/charts.js"], () => {
  if (window.bhCharts) {
    window.bhCharts.buildPlaceholder("bh-price-chart");
  }
});
