frappe.pages["price-entry-page"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: __("Price Entry"),
    single_column: true,
  });

  page.main.html(`
    <section class="bh-panel">
      <header>
        <h4>${__("Daily Metal Prices")}</h4>
        <p class="bh-muted">${__("Enter daily reference prices by purity")}</p>
      </header>
      <div class="bh-entry-grid">
        <div class="bh-input">
          <label>${__("Date")}</label>
          <input type="date" class="form-control" />
        </div>
        <div class="bh-input">
          <label>${__("Metal")}</label>
          <select class="form-control">
            <option>${__("Gold")}</option>
            <option>${__("Silver")}</option>
            <option>${__("Platinum")}</option>
            <option>${__("Palladium")}</option>
          </select>
        </div>
        <div class="bh-input">
          <label>${__("Purity")}</label>
          <input type="text" class="form-control" placeholder="24K" />
        </div>
        <div class="bh-input">
          <label>${__("Price (USD)")}</label>
          <input type="number" class="form-control" />
        </div>
      </div>
    </section>
  `);
};
