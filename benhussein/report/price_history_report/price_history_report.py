"""Price History Report."""

import frappe


def execute(filters=None):
    columns = [
        {"fieldname": "price_date", "label": "Date", "fieldtype": "Date", "width": 100},
        {"fieldname": "metal", "label": "Metal", "fieldtype": "Data", "width": 100},
        {"fieldname": "purity", "label": "Purity", "fieldtype": "Data", "width": 80},
        {"fieldname": "price_usd", "label": "USD", "fieldtype": "Currency", "width": 120},
        {"fieldname": "price_local", "label": "Local", "fieldtype": "Currency", "width": 120},
    ]
    data = []
    return columns, data
