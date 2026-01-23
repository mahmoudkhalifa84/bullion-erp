"""Trading Transactions DocType controller."""

import frappe
from frappe.model.document import Document


class TradingTransactions(Document):
    """Logs analytic trading transactions without posting to ledgers."""

    def validate(self):
        if self.quantity and self.quantity <= 0:
            frappe.throw("Quantity must be greater than zero.")
