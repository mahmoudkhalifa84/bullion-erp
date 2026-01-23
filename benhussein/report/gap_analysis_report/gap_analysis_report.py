"""GAP Analysis Report."""

import frappe


def execute(filters=None):
    columns = [
        {"fieldname": "metal", "label": "Metal", "fieldtype": "Data", "width": 120},
        {"fieldname": "gap", "label": "Gap (%)", "fieldtype": "Percent", "width": 120},
    ]
    data = []
    return columns, data
