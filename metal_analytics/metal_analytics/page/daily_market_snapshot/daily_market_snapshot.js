frappe.pages['daily-market-snapshot'].on_page_load = function (wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'سجل أسعار السوق',
        single_column: true
    });

    
    page.set_secondary_action(__('رجوع'), () => {
      window.history.back();
    }, 'octicon octicon-arrow-left');

    $('<div class="market-table-wrapper"></div>').appendTo(page.body);

    load_snapshots();
};

// ===============================
// LOAD DATA
// ===============================
function load_snapshots() {
    frappe.call({
        method: 'metal_analytics.metal_analytics.api.market_snapshot.get_snapshots',
        callback(r) {
            if (!r.message) return;
            render_table(r.message);
        }
    });
}

// ===============================
// RENDER TABLE (LIKE IMAGE)
// ===============================
function render_table(data) {
    const wrapper = $('.market-table-wrapper');
    const rows = data.rows || [];

    if (!rows.length) {
        wrapper.html('<p class="text-center text-muted">لا توجد بيانات</p>');
        return;
    }

    // ترتيب الأعمدة كما طلبت
    const columns = [
        { label: 'فضة عيار عالي', key: 'silver_scrap_high_karat' },
        { label: 'سبيكة 24', key: 'gold_bullion_24' },
        { label: 'سبيكة 18', key: 'gold_bullion_18' },
        { label: 'كسر ذهب 18', key: 'gold_scrap_18' }
    ];

    let html = `
    <table class="table table-bordered market-table">
        <thead>
            <tr>
                <th>إجراءات</th>
    `;

    columns.forEach(c => html += `<th>${c.label}</th>`);

    html += `
                <th>سعر اليورو</th>
                <th>سعر الدولار</th>
                <th>التاريخ والوقت</th>
                <th>تفاصيل</th>
            </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(row => {
        const detailsId = `details-${row.name}`;

        html += `
        <tr>
            <!-- إجراءات -->
            <td class="text-center">
                <button class="btn btn-xs btn-danger"
                    onclick="delete_by_date('${row.posting_date}')">🗑</button>
                <button class="btn btn-xs btn-primary"
                    onclick="open_snapshot('${row.name}')">📊</button>
            </td>
        `;

        // أسعار الذهب
        columns.forEach(c => {
            const val = row.items?.[c.key];
            html += `
            <td class="text-center">
                <b>د.ل ${val ?? '-'}</b>
                <div class="text-success small">▲ 0.00</div>
            </td>`;
        });

        // اليورو
        html += `
            <td class="text-center">
                <b>د.ل ${row.eur_rate}</b>
                <div class="text-danger small">▼ 0.00</div>
            </td>
        `;

        // الدولار
        html += `
            <td class="text-center">
                <b>د.ل ${row.usd_rate_local}</b>
                <div class="text-danger small">▼ 0.00</div>
            </td>
        `;

        // التاريخ والوقت
        html += `
            <td>
                ${row.posting_date}
                <div class="text-muted small">${row.posting_time || ''}</div>
            </td>
        `;

        // زر التفاصيل
        html += `
            <td class="text-center">
                <button class="btn btn-xs btn-default"
                    onclick="toggle_details('${detailsId}')">📋</button>
            </td>
        </tr>

        <!-- DETAILS BOX -->
        <tr id="${detailsId}" style="display:none">
            <td colspan="${columns.length + 5}">
                ${render_details(row)}
            </td>
        </tr>
        `;
    });

    html += '</tbody></table>';
    wrapper.html(html);
}

// ===============================
// DETAILS BOX (LIKE IMAGE)
// ===============================
function render_details(row) {
    const d = row.details;
    if (!d) return `<div class="text-muted">لا توجد تفاصيل</div>`;

    return `
    <table class="table table-sm table-bordered text-center" dir="rtl">
        <thead>
            <tr>
                <th>المؤشر</th>
                <th>افتتاح</th>
                <th>أدنى</th>
                <th>أعلى</th>
                <th>إغلاق</th>
            </tr>
        </thead>
        <tbody>

            <tr>
                <td><b>سعر الدولار</b></td>
                <td>${d.usd_rate?.open ?? '-'}</td>
                <td class="text-danger">${d.usd_rate?.low ?? '-'}</td>
                <td class="text-success">${d.usd_rate?.high ?? '-'}</td>
                <td>${d.usd_rate?.close ?? '-'}</td>
            </tr>

            <tr>
                <td><b>سعر اليورو</b></td>
                <td>${d.eur_rate?.open ?? '-'}</td>
                <td class="text-danger">${d.eur_rate?.low ?? '-'}</td>
                <td class="text-success">${d.eur_rate?.high ?? '-'}</td>
                <td>${d.eur_rate?.close ?? '-'}</td>
            </tr>

            <tr>
                <td><b>سبيكة 24</b></td>
                <td>${d.items?.gold_bullion_24?.open ?? '-'}</td>
                <td class="text-danger">${d.items?.gold_bullion_24?.low ?? '-'}</td>
                <td class="text-success">${d.items?.gold_bullion_24?.high ?? '-'}</td>
                <td>${d.items?.gold_bullion_24?.close ?? '-'}</td>
            </tr>

            <tr>
                <td><b>فضة عيار عالي</b></td>
                <td>${d.items?.silver_scrap_high_karat?.open ?? '-'}</td>
                <td class="text-danger">${d.items?.silver_scrap_high_karat?.low ?? '-'}</td>
                <td class="text-success">${d.items?.silver_scrap_high_karat?.high ?? '-'}</td>
                <td>${d.items?.silver_scrap_high_karat?.close ?? '-'}</td>
            </tr>

        </tbody>
    </table>
    `;
}


// ===============================
// TOGGLE DETAILS
// ===============================
function toggle_details(id) {
    $('#' + id).slideToggle(150);
}

// ===============================
// ACTIONS
// ===============================
function open_snapshot(name) {
    frappe.set_route('Form', 'Daily Market Snapshot', name);
}

function delete_by_date(date) {
       frappe.confirm(
        `هل أنت متأكد من حذف جميع إدخالات يوم ${date} ؟`,
        () => {
            frappe.call({
                method: 'metal_analytics.metal_analytics.api.market_snapshot.delete_by_date',
                args: {
                    posting_date: date
                },
                callback() {
                    frappe.show_alert('تم حذف سجل اليوم بالكامل');
                    load_snapshots();
                }
            });
        }
    );
}
