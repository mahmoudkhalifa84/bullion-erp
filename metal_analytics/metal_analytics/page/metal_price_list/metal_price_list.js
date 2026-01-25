frappe.pages['metal-price-list'].on_page_load = function (wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'أسعار المعادن اليومية',
        single_column: true
    });

    page.main.html(`
        <div class="metal-lite">

            <!-- Filters -->
            <div class="filters">
                <div>
                    <label>التاريخ</label>
                    <input type="date" id="f-date" value="${frappe.datetime.get_today()}">
                </div>

                <div>
                    <label>المعدن</label>
                    <select id="f-metal">
                        <option value="">الكل</option>
                        <option value="Gold">ذهب</option>
                        <option value="Silver">فضة</option>
                    </select>
                </div>

                <div>
                    <label>فئة الصنف</label>
                    <select id="f-group">
                        <option value="">الكل</option>
                    </select>
                </div>

                <div>
                    <label>الجهة</label>
                    <select id="f-source">
                        <option value="">الكل</option>
                    </select>
                </div>

                <div class="btns">
                    <button class="btn btn-primary" id="apply">عرض</button>
                    <button class="btn btn-default" id="reset">مسح</button>
                </div>
            </div>

            <!-- Table -->
            <table class="price-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>الصنف</th>
                        <th>المعدن</th>
                        <th>الفئة</th>
                        <th>العيار</th>
                        <th>السعر العالمي (USD)</th>
                        <th>السعر داخل ليبيا</th>
                        <th>فرق السعر %</th>
                        <th>الجهة</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody id="price-body">
                    <tr><td colspan="10" class="loading">جاري التحميل...</td></tr>
                </tbody>
            </table>
        </div>

        <style>
            .metal-lite { padding: 20px; background: #f8f9fa }
            .filters {
                display: grid;
                grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
                gap: 15px;
                background: #fff;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .filters label { font-weight: 600; font-size: 13px }
            .filters input, .filters select {
                width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 6px;
            }
            .btns { display: flex; gap: 10px; align-items: end }
            .price-table {
                width: 100%;
                background: #fff;
                border-collapse: collapse;
                border-radius: 8px;
                overflow: hidden;
            }
            .price-table th {
                background: #4e73df;
                color: #fff;
                padding: 10px;
                font-size: 13px;
            }
            .price-table td {
                padding: 9px;
                border-bottom: 1px solid #eee;
                font-size: 13px;
            }
            .price-table tr:hover { background: #f1f3f5 }
            .loading { text-align: center; color: #888 }
        </style>
    `);

    /* تحميل الفلاتر */
    frappe.call({
        method: "frappe.client.get_list",
        args: { doctype: "Item Group", fields: ["name"], filters: { is_group: 0 } },
        callback: r => {
            r.message.forEach(g =>
                $('#f-group').append(`<option value="${g.name}">${g.name}</option>`)
            );
        }
    });

    frappe.call({
        method: "frappe.client.get_list",
        args: { doctype: "Metal Price Source", fields: ["name"], filters: { disabled: 0 } },
        callback: r => {
            r.message.forEach(s =>
                $('#f-source').append(`<option value="${s.name}">${s.name}</option>`)
            );
        }
    });

    function loadData() {
        $('#price-body').html(`<tr><td colspan="10" class="loading">جاري التحميل...</td></tr>`);

        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Daily Metal Price",
                fields: [
                    "name", "item", "metal_type", "item_group",
                    "purity_or_karat", "global_price", "local_price",
                     "source", "date"
                ],
                filters: {
                    date: $('#f-date').val(),
                    metal_type: $('#f-metal').val(),
                    item_group: $('#f-group').val(),
                    source: $('#f-source').val()
                },
                order_by: "date desc"
            },
            callback: r => {
                if (!r.message.length) {
                    $('#price-body').html(`<tr><td colspan="10" class="loading">لا توجد بيانات</td></tr>`);
                    return;
                }

                let rows = '';
                r.message.forEach((p, i) => {
                    rows += `
                        <tr data-name="${p.name}">
                            <td>${i + 1}</td>
                            <td><b>${ p.item}</b></td>
                            <td>${p.metal_type === 'Gold' ? 'ذهب' : 'فضة'}</td>
                            <td>${p.item_group || '-'}</td>
                            <td>${p.purity_or_karat || 24}K</td>
                            <td>$${Number(p.global_price || 0).toFixed(2)}</td>
                            <td>${Number(p.local_price || 0).toFixed(2)} د.ل</td>
                            <td>${p.gap_percentage ? p.gap_percentage.toFixed(2) + '%' : '-'}</td>
                            <td>${p.source || '-'}</td>
                            <td>${frappe.datetime.str_to_user(p.date)}</td>
                        </tr>
                    `;
                });

                $('#price-body').html(rows);

                $('tr[data-name]').click(function () {
                    frappe.set_route('Form', 'Daily Metal Price', $(this).data('name'));
                });
            }
        });
    }

    $('#apply').on('click', loadData);
    $('#reset').on('click', () => {
        $('#f-metal,#f-group,#f-source').val('');
        $('#f-date').val(frappe.datetime.get_today());
        loadData();
    });

    loadData();
};
