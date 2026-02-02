import frappe
from frappe.utils import nowtime


# =====================================================
# SAVE DAILY MARKET SNAPSHOT
# =====================================================
@frappe.whitelist()
def save_market_snapshot(data):
    """
    Save Daily Market Snapshot from JS Page
    """

    # -------- Parse JSON --------
    if isinstance(data, str):
        data = frappe.parse_json(data)

    if not data:
        frappe.throw("لا توجد بيانات لحفظها")

    if not data.get("posting_date"):
        frappe.throw("Posting Date مطلوب")

    if not data.get("usd_rate_local"):
        frappe.throw("سعر الدولار المحلي مطلوب")

    if not data.get("items"):
        frappe.throw("يجب إدخال سعر صنف واحد على الأقل")

    # -------- Create Parent Doc --------
    doc = frappe.get_doc({
        "doctype": "Daily Market Snapshot",

        # Date & Time
        "posting_date": data.get("posting_date"),
        "posting_time": nowtime(),

        # Global Prices
        "world_gold_oz": data.get("world_gold_oz"),
        "world_silver_oz": data.get("world_silver_oz"),

        # Exchange Rates
        "usd_rate_local": data.get("usd_rate_local"),
        "usd_rate_bank": data.get("usd_rate_bank"),
        "eur_rate": data.get("eur_rate"),
        "gbp_rate": data.get("gbp_rate"),

        # Indexes
        "dxy_index": data.get("dxy_index"),
        "eurx_index": data.get("eurx_index"),

        # Child Table
        "items_table": []
    })

    # -------- Items --------
    for row in data.get("items"):
        if not row.get("market_price"):
            continue

        doc.append("items_table", {
            "item": row.get("item"),
            "market_price": row.get("market_price")
        })

    # -------- Save --------
    try:
        doc.insert(ignore_permissions=True)
        frappe.db.commit()

        return {
            "status": "success",
            "name": doc.name,
            "posting_time": doc.posting_time
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Save Market Snapshot Error")
        frappe.throw(str(e))


# =====================================================
# GET MARKET ITEMS (GOLD / SILVER)
# =====================================================
@frappe.whitelist()
def get_market_items(metal_type):
    """
    جلب الأصناف حسب شجرة Item Group (ذهب / فضة)
    """

    if metal_type not in ("Gold", "Silver"):
        return []

    # اسم مجموعة المعدن في Item Group
    metal_group = "ذهب" if metal_type == "Gold" else "فضة"

    return frappe.get_all(
        "Item",
        filters={
            "disabled": 0,
            "item_group": ["like", f"%{metal_group}%"]
        },
        fields=[
            "name",
            "item_name",
            "item_group"
        ],
        order_by="item_group asc, item_name asc"
    )
