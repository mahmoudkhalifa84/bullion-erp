"""Trading Simulation DocType controller."""

import frappe
from frappe.model.document import Document


class TradingSimulation(Document):
    """Captures simulated trading scenarios without affecting stock/ledger."""

    def validate(self):
        if self.initial_capital and self.initial_capital < 0:
            frappe.throw("Initial capital must be positive.")
