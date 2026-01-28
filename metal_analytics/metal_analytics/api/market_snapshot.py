import frappe
from collections import defaultdict


def calculate_ohlc(values):
    """Helper: يحسب OHLC من قائمة مرتبة زمنياً"""
    if not values:
        return None

    return {
        "open": values[0],
        "low": min(values),
        "high": max(values),
        "close": values[-1]
    }


@frappe.whitelist()
def get_snapshots():
    snapshots = frappe.get_all(
        "Daily Market Snapshot",
        fields=[
            "name",
            "posting_date",
            "posting_time",
            "usd_rate_local",
            "eur_rate"
        ],
        order_by="posting_date desc, posting_time asc"
    )

    if not snapshots:
        return {"rows": []}

    by_date = defaultdict(list)
    for s in snapshots:
        by_date[s.posting_date].append(s)

    rows = []

    for date, day_snaps in by_date.items():
        usd_values = [s.usd_rate_local for s in day_snaps if s.usd_rate_local]
        eur_values = [s.eur_rate for s in day_snaps if s.eur_rate]

        usd_ohlc = calculate_ohlc(usd_values)
        eur_ohlc = calculate_ohlc(eur_values)

        item_values = defaultdict(list)

        for s in day_snaps:
            items = frappe.get_all(
                "Daily Price Item",
                filters={
                    "parent": s.name,
                    "parenttype": "Daily Market Snapshot"
                },
                fields=["item", "market_price"]
            )

            for i in items:
                item_values[i.item].append(i.market_price)

        items_ohlc = {
            item: calculate_ohlc(values)
            for item, values in item_values.items()
        }

        last = day_snaps[-1]

        rows.append({
            "name": last.name,
            "posting_date": date,
            "posting_time": last.posting_time,
            "usd_rate_local": last.usd_rate_local,
            "eur_rate": last.eur_rate,
            "items": {
                item: ohlc["close"] if ohlc else None
                for item, ohlc in items_ohlc.items()
            },
            "details": {
                "usd_rate": usd_ohlc,
                "eur_rate": eur_ohlc,
                "items": items_ohlc
            }
        })

    return {"rows": rows}


# ✅ دالة مستقلة
@frappe.whitelist()
def delete_by_date(posting_date):
    if not posting_date:
        frappe.throw("Posting Date is required")

    docs = frappe.get_all(
        "Daily Market Snapshot",
        filters={"posting_date": posting_date},
        pluck="name"
    )

    for name in docs:
        frappe.delete_doc("Daily Market Snapshot", name, force=1)

    frappe.db.commit()

    return {
        "deleted": len(docs)
    }
