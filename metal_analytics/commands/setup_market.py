import frappe

def run():
    """
    نقطة التشغيل الرئيسية
    """
    create_daily_market_snapshot()
    frappe.db.commit()
    print("✔️ Market Doctypes created successfully (Stock-driven)")


# ---------------------------------------------------------
# Parent + Child Table
# Daily Market Snapshot + Daily Price Item
# ---------------------------------------------------------
def create_daily_market_snapshot():

    # ----------------------------
    # Child Table: Daily Price Item
    # ----------------------------
    if not frappe.db.exists("DocType", "Daily Price Item"):
        child = frappe.get_doc({
            "doctype": "DocType",
            "name": "Daily Price Item",
            "module": "metal analytics",
            "custom": 1,
            "istable": 1,
            "fields": [

                # 🔗 الربط المباشر مع Item
                {
                    "fieldname": "item",
                    "label": "Item",
                    "fieldtype": "Link",
                    "options": "Item",
                    "reqd": 1
                },

                # ---------------- Fetch From Item ----------------
                {
                    "fieldname": "item_group",
                    "label": "Item Group",
                    "fieldtype": "Link",
                    "options": "Item Group",
                    "fetch_from": "item.item_group",
                    "read_only": 1
                },
        

                # ---------------- Prices ----------------
                {
                    "fieldname": "market_price",
                    "label": "Local Market Price",
                    "fieldtype": "Currency"
                },
                {
                    "fieldname": "calculated_price",
                    "label": "Calculated Global Price",
                    "fieldtype": "Currency",
                    "read_only": 1
                },
                {
                    "fieldname": "price_gap_pct",
                    "label": "Price Gap %",
                    "fieldtype": "Float",
                    "read_only": 1
                }
            ]
        })
        child.insert(ignore_permissions=True)

        # ----------------------------
    # Parent Doctype
    # ----------------------------
    if frappe.db.exists("DocType", "Daily Market Snapshot"):
        return

    parent = frappe.get_doc({
        "doctype": "DocType",
        "name": "Daily Market Snapshot",
        "module": "metal analytics",
        "custom": 1,
        "fields": [

            # -------- Date & Time --------
            {
                "fieldname": "posting_date",
                "label": "Posting Date",
                "fieldtype": "Date",
                "reqd": 1
            },
            {
                "fieldname": "posting_time",
                "label": "Posting Time",
                "fieldtype": "Time",
                "default": "Now"
            },

            # -------- Global Prices --------
            {
                "fieldname": "section_global",
                "label": "Global Prices",
                "fieldtype": "Section Break"
            },
            {
                "fieldname": "world_gold_oz",
                "label": "Gold (oz) USD",
                "fieldtype": "Currency"
            },
            {
                "fieldname": "world_silver_oz",
                "label": "Silver (oz) USD",
                "fieldtype": "Currency"
            },

            # -------- Exchange Rates --------
            {
                "fieldname": "section_exchange",
                "label": "Exchange Rates",
                "fieldtype": "Section Break"
            },
            {
                "fieldname": "usd_rate_local",
                "label": "USD Rate (Market)",
                "fieldtype": "Currency",
                "reqd": 1
            },
            {
                "fieldname": "usd_rate_bank",
                "label": "USD Bank Rate",
                "fieldtype": "Currency"
            },
            {
                "fieldname": "eur_rate",
                "label": "EUR Rate",
                "fieldtype": "Currency"
            },
            {
                "fieldname": "gbp_rate",
                "label": "GBP Rate",
                "fieldtype": "Currency"
            },

            # -------- Global Indexes --------
            {
                "fieldname": "section_indexes",
                "label": "Market Indexes",
                "fieldtype": "Section Break"
            },
            {
                "fieldname": "dxy_index",
                "label": "DXY Index",
                "fieldtype": "Float"
            },
            {
                "fieldname": "eurx_index",
                "label": "EURX Index",
                "fieldtype": "Float"
            },

            # -------- Items --------
            {
                "fieldname": "section_items",
                "label": "Market Items",
                "fieldtype": "Section Break"
            },
            {
                "fieldname": "items_table",
                "label": "Items",
                "fieldtype": "Table",
                "options": "Daily Price Item"
            }
        ]
    })

    parent.insert(ignore_permissions=True)

