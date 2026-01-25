frappe.pages['price_detail'].on_page_load = function (wrapper) {

    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'تفاصيل السعر',
        single_column: true
    });

    const price_name = frappe.get_route()[1];

    if (!price_name) {
        page.main.html('<p>❌ لم يتم تحديد السجل</p>');
        return;
    }

    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "Daily Metal Price",
            name: price_name
        },
        callback(r) {
            const d = r.message;
            const gap = (d.local_price || 0) - (d.global_price || 0);

            page.main.html(`
                <div class="price-detail">

                    <h4>📌 ${d.item}</h4>

                    <table class="table table-bordered mt-3">
                        <tr><th>التاريخ</th><td>${d.date}</td></tr>
                        <tr><th>نوع المعدن</th><td>${d.metal_type}</td></tr>
                        <tr><th>المجموعة</th><td>${d.item_group}</td></tr>
                        <tr><th>العيار / النقاء</th><td>${d.purity_or_karat || '-'}</td></tr>
                        <tr><th>المصدر</th><td>${d.source}</td></tr>
                        <tr><th>السعر العالمي</th><td>${d.global_price}</td></tr>
                        <tr><th>السعر المحلي</th><td>${d.local_price}</td></tr>
                        <tr>
                            <th>GAP</th>
                            <td style="color:${gap >= 0 ? 'green' : 'red'}">
                                ${gap}
                            </td>
                        </tr>
                    </table>

                    <button class="btn btn-secondary" onclick="frappe.set_route('price-list')">
                        ⬅ رجوع للقائمة
                    </button>
                </div>
            `);
        }
    });
};
