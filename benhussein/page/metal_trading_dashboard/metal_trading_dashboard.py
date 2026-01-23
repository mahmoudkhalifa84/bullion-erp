"""Metal Trading Dashboard page."""

import frappe


@frappe.whitelist()
def get_dashboard_metrics():
    """Return aggregated metrics for dashboard cards."""
    return {
        "prices": [],
        "inventory": [],
        "fx": [],
    }
