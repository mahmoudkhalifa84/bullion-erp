"""Simulation P&L Report."""

import frappe


def execute(filters=None):
    columns = [
        {"fieldname": "simulation", "label": "Simulation", "fieldtype": "Data", "width": 160},
        {"fieldname": "pnl", "label": "P&L", "fieldtype": "Currency", "width": 120},
    ]
    data = []
    return columns, data
