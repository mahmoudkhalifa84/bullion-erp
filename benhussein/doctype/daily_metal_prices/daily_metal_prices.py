"""Daily Metal Prices DocType controller."""

import frappe
from frappe.model.document import Document


class DailyMetalPrices(Document):
    """Stores daily reference prices for metals and FX indices."""

    def validate(self):
        if self.price_usd and self.price_usd < 0:
            frappe.throw("Price must be a positive value.")
