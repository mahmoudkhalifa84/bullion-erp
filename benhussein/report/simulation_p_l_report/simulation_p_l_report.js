frappe.query_reports["Simulation P&L Report"] = {
  filters: [
    {
      fieldname: "simulation",
      label: __("Simulation"),
      fieldtype: "Link",
      options: "Trading Simulation",
    },
  ],
};
