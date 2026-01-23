frappe.query_reports["Price History Report"] = {
  filters: [
    {
      fieldname: "metal",
      label: __("Metal"),
      fieldtype: "Select",
      options: ["", "Gold", "Silver", "Platinum", "Palladium"],
    },
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
