# Benhussein App (Analytic Only)

This module provides analytic dashboards, reports, and simulation tools for metal trading **without** touching Accounting or Stock ledgers. It is designed to be extensible for APIs, live prices, and mobile clients.

## Architecture Principles
- **Read-only integration**: no overrides on ERPNext Accounting/Stock doctypes.
- **Dedicated DocTypes**: pricing, simulation, and analytics data live in separate tables.
- **Future API readiness**: endpoints will be added under a dedicated namespace.
- **UI separation**: dashboard pages load their own JS assets.

## App Structure
- **DocTypes (Analytic Only)**
  - Daily Metal Prices
  - Trading Simulation
  - Trading Transactions
- **Pages**
  - Metal Trading Dashboard
  - Price Entry Page
- **Reports**
  - GAP Analysis Report
  - Price History Report
  - Simulation P&L Report
- **JS (UI / Charts)**
  - charts.js
  - dashboard.js
- **Hooks**
  - hooks.py (no ledger hooks)
  - hooks/sales_invoice.py (read-only copy)
