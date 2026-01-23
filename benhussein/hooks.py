"""App hooks for the Benhussein analytic-only module.

This app is intentionally isolated from Accounting/Stock doctypes to keep
transactional ledgers unaffected. Only custom DocTypes, Pages, and Reports
are registered here.
"""

app_name = "benhussein"
app_title = "Benhussein"
app_publisher = "Benhussein"
app_description = "Analytic-only metal trading dashboards and reports."
app_icon = "octicon octicon-graph"
app_color = "#C9A227"
app_email = "support@example.com"
app_license = "MIT"

# Keep hooks minimal to avoid side effects in Accounting/Stock.

# Document Events
# doc_events = {}

# Scheduled Tasks (future live pricing integrations).
# scheduler_events = {}

# Fixtures (optional: use for dashboards or reports only).
# fixtures = []
