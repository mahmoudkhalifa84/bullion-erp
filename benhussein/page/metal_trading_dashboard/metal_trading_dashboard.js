frappe.pages["metal-trading-dashboard"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: __("Metal Trading Dashboard"),
    single_column: true,
  });

  page.main.html(`
    <div class="bh-dashboard">
      <section class="bh-card-grid">
        <div class="bh-card">
          <h3>${__("Gold")}</h3>
          <p class="bh-muted">${__("Live Price")}</p>
          <div class="bh-value">$0.00</div>
        </div>
        <div class="bh-card">
          <h3>${__("Silver")}</h3>
          <p class="bh-muted">${__("Live Price")}</p>
          <div class="bh-value">$0.00</div>
        </div>
        <div class="bh-card">
          <h3>${__("FX & Index")}</h3>
          <p class="bh-muted">${__("EUR / DXY")}</p>
          <div class="bh-value">--</div>
        </div>
      </section>

      <section class="bh-panel">
        <header>
          <h4>${__("Price History")}</h4>
          <p class="bh-muted">${__("Data from Daily Metal Prices DocType")}</p>
        </header>
        <div id="bh-price-chart" class="bh-chart"></div>
      </section>
    </div>
  `);

  frappe.require("/assets/benhussein/js/dashboard.js");
};
