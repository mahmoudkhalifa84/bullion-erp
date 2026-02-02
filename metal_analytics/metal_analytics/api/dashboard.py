import frappe


# ============================================
# GOLD & SILVER DASHBOARD
# ============================================
@frappe.whitelist()
def get_dashboard_market_items(metal_type=None):

    if metal_type not in ("Gold", "Silver"):
        return []

    metal_group = "ذهب" if metal_type == "Gold" else "فضة"

    return frappe.db.sql("""

        SELECT
            item.item_name,
            item.item_group,

            snap.market_price,
            snap.calculated_price,

            IF(snap.calculated_price > 0,
                ((snap.market_price - snap.calculated_price)
                / snap.calculated_price) * 100,
                0
            ) AS price_gap_pct

        FROM `tabDaily Price Item` snap

        INNER JOIN `tabDaily Market Snapshot` parent
            ON parent.name = snap.parent

        INNER JOIN `tabItem` item
            ON item.name = snap.item

        WHERE parent.name = (
            SELECT name
            FROM `tabDaily Market Snapshot`
            ORDER BY posting_date DESC, posting_time DESC
            LIMIT 1
        )

        AND item.item_group LIKE %s

        ORDER BY item.item_group, item.item_name

    """, (f"%{metal_group}%",), as_dict=True)


    if metal_type not in ("Gold", "Silver"):
        return []

    metal_group = "ذهب" if metal_type == "Gold" else "فضة"

    return frappe.db.sql("""
        SELECT
            item.item_name,
            item.item_group,

            snap.market_price,
            snap.calculated_price,

            IF(snap.calculated_price > 0,
                ((snap.market_price - snap.calculated_price)
                / snap.calculated_price) * 100,
                0
            ) AS price_gap_pct

        FROM `tabDaily Price Item` snap

        INNER JOIN `tabDaily Market Snapshot` parent
            ON parent.name = snap.parent

        INNER JOIN `tabItem` item
            ON item.name = snap.item

        WHERE item.item_group LIKE %s

        ORDER BY item.item_group, item.item_name
    """, (f"%{metal_group}%",), as_dict=True)


# ===============================
# CURRENCY DASHBOARD
# ===============================
@frappe.whitelist()
def get_currency_dashboard():

    row = frappe.db.sql("""
        SELECT
            usd_rate_local,
            usd_rate_bank,
            eur_rate,
            gbp_rate
        FROM `tabDaily Market Snapshot`
        ORDER BY posting_date DESC, posting_time DESC
        LIMIT 1
    """, as_dict=True)

    if not row:
        return []

    row = row[0]

    def build(code, name, market, bank):
        diff = 0
        direction = "up"
        if bank and bank > 0:
            diff = market - bank
            direction = "up" if diff >= 0 else "down"

        return {
            "code": code,
            "name": name,
            "market": market,
            "bank": bank,
            "diff": diff,
            "direction": direction
        }

    result = []

    if row.usd_rate_local:
        result.append(
            build(
                "USD",
                "الدولار الأمريكي",
                row.usd_rate_local,
                row.usd_rate_bank or 0
            )
        )

    if row.eur_rate:
        result.append(
            build(
                "EUR",
                "اليورو",
                row.eur_rate,
                0
            )
        )

    if row.gbp_rate:
        result.append(
            build(
                "GBP",
                "الجنيه الإسترليني",
                row.gbp_rate,
                0
            )
        )

    return result


    data = frappe.db.sql("""
        SELECT
            usd_rate_local,
            usd_rate_bank,
            eur_rate,
            gbp_rate
        FROM `tabDaily Market Snapshot`
        ORDER BY posting_date DESC, posting_time DESC
        LIMIT 1
    """, as_dict=True)

    if not data:
        return []

    row = data[0]

    result = []

    def build(currency, market, bank):
        gap = 0
        if bank and bank > 0:
            gap = ((market - bank) / bank) * 100

        return {
            "currency": currency,
            "market_rate": market,
            "bank_rate": bank,
            "gap_pct": gap
        }

    if row.usd_rate_local:
        result.append(build("USD", row.usd_rate_local, row.usd_rate_bank or 0))

    if row.eur_rate:
        result.append(build("EUR", row.eur_rate, 0))

    if row.gbp_rate:
        result.append(build("GBP", row.gbp_rate, 0))

    return result


# ===============================
# GOLD SILVER RATIO
# ===============================
@frappe.whitelist()
def get_ratio_dashboard():

    # ===== آخر Snapshot =====
    snap = frappe.db.sql("""
        SELECT
            name,
            posting_date,
            posting_time,
            world_gold_oz,
            world_silver_oz
        FROM `tabDaily Market Snapshot`
        ORDER BY posting_date DESC, posting_time DESC
        LIMIT 1
    """, as_dict=True)

    if not snap:
        return {}

    s = snap[0]

    # ===== Global Ratio =====
    global_ratio = 0
    if s.world_silver_oz and s.world_silver_oz > 0:
        global_ratio = s.world_gold_oz / s.world_silver_oz

    # ===== Global Range (History 30 rows) =====
    ratios = frappe.db.sql("""
        SELECT
            world_gold_oz / world_silver_oz AS ratio
        FROM `tabDaily Market Snapshot`
        WHERE world_gold_oz IS NOT NULL
        AND world_silver_oz IS NOT NULL
        ORDER BY posting_date DESC, posting_time DESC
        LIMIT 30
    """, as_dict=True)

    ratio_values = [r.ratio for r in ratios if r.ratio]

    global_low = min(ratio_values) if ratio_values else global_ratio
    global_high = max(ratio_values) if ratio_values else global_ratio

    # ===== Local Prices =====
    items = frappe.db.sql("""
        SELECT
            item.item_group,
            dpi.market_price
        FROM `tabDaily Price Item` dpi
        JOIN `tabItem` item ON item.name = dpi.item
        WHERE dpi.parent = %s
    """, (s.name,), as_dict=True)

    local_gold = None
    local_silver = None

    for i in items:
        if "ذهب" in (i.item_group or ""):
            local_gold = i.market_price
        if "فضة" in (i.item_group or ""):
            local_silver = i.market_price

    # ===== Local Ratio =====
    local_ratio = 0
    if local_gold and local_silver and local_silver > 0:
        local_ratio = local_gold / local_silver

    # ===== Local Range =====
    local_low = local_ratio * 0.97 if local_ratio else 0
    local_high = local_ratio * 1.03 if local_ratio else 0

    # ===== Gap =====
    gap = local_ratio - global_ratio
    gap_pct = (gap / global_ratio * 100) if global_ratio else 0

    return {
        "posting_date": s.posting_date,
        "posting_time": s.posting_time,

        "global_ratio": global_ratio,
        "global_low": global_low,
        "global_high": global_high,

        "local_ratio": local_ratio,
        "local_low": local_low,
        "local_high": local_high,

        "gap": gap,
        "gap_pct": gap_pct
    }
