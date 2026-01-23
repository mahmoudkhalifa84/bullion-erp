"""Price Entry Page."""

import frappe


@frappe.whitelist()
def get_latest_prices():
    """Fetch latest prices for form defaults."""
    return []
