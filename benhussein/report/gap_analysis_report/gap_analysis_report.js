frappe.query_reports["GAP Analysis Report"] = {
  filters: [
    {
      fieldname: "from_date",
      label: __("From"),
      fieldtype: "Date",
    },
    {
      fieldname: "to_date",
      label: __("To"),
      fieldtype: "Date",
    },
  ],
};
