/* ================= PAGE LOAD ================= */
frappe.pages['benhussein-dashboard'].on_page_load = function(wrapper) {

    frappe.require([
        "/assets/metal_analytics/css/benhussein_dashboard.css",
        "https://code.jquery.com/ui/1.13.2/jquery-ui.min.js",
        "https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css"
    ], function() {

        const page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'BenHussein Market Dashboard',
            single_column: false
        });

        // زر Dark Mode
        const darkModeBtn = $('<button class="btn btn-secondary ml-2">Toggle Dark Mode</button>');
        darkModeBtn.click(toggle_dark_mode);
        $(page.page_actions).append(darkModeBtn);

        add_reset_grid_button(page);
        render_dashboard(page);
        load_all();

        // 🔥 Auto Refresh
        setInterval(load_all, 60000);
    });
};

/* ================= RESET GRID BUTTON ================= */
function add_reset_grid_button(page){
    const resetBtn = $('<button class="btn btn-primary ml-2">إعادة الوضع العادي</button>');
    resetBtn.click(() => {
        const grid = $('.gsaa-grid');

        const originalOrder = ['card-ratio', 'card-currency', 'card-silver', 'card-gold'];
        originalOrder.forEach(id => {
            const el = document.getElementById(id);
            if(el) grid.append(el);
        });

        grid.css('grid-template-columns', 'repeat(4, 1fr)');

        localStorage.removeItem('gsaa_grid_order');
    });

    $(page.page_actions).append(resetBtn);
}


/* ================= DARK MODE ================= */
function toggle_dark_mode() {
    const body = $('body');
    if(body.hasClass('dark-mode')) {
        body.removeClass('dark-mode');
        localStorage.setItem('dashboard_dark_mode', 'false');
    } else {
        body.addClass('dark-mode');
        localStorage.setItem('dashboard_dark_mode', 'true');
    }
}

// تطبيق الوضع المحفوظ عند التحميل
if(localStorage.getItem('dashboard_dark_mode') === 'true') {
    $('body').addClass('dark-mode');
}

/* ================= LOAD ALL ================= */
function load_all(){
    load_dashboard_items("Gold","gold-items-dashboard");
    load_dashboard_items("Silver","silver-items-dashboard");
    load_currency_dashboard();
    load_ratio();
}

function load_currency_dashboard(){
    const container = $("#currency-dashboard");

    frappe.call({
        method: "metal_analytics.metal_analytics.api.dashboard.get_currency_dashboard",
        callback(r){
            if(!r.message) return;

            let html = "";

            r.message.forEach(row => {
                const up = row.direction === "up";
                const arrow = up ? "▲" : "▼";
                const cls = up ? "up" : "down";
                const diffPercent = Math.min(Math.abs(row.diff) * 10, 100);

                html += `
                <div class="currency-card">
                    <div class="currency-title">${row.name}</div>
                    <div class="currency-price">${row.market.toFixed(2)} <span class="currency-unit">د.ل</span></div>
                    <div class="currency-bank">مصرف ليبيا (${row.bank.toFixed(2)} د.ل)</div>
                    <div class="currency-change ${cls}">${arrow} ${Math.abs(row.diff).toFixed(2)} د.ل</div>
                    <div class="currency-bar"><div class="currency-bar-fill ${cls}" style="width:${diffPercent}%"></div></div>
                    <div class="currency-range"><span>${row.low} د.ل</span><span>${row.high} د.ل</span></div>
                </div>`;
            });

            container.html(html);

            // تفعيل السحب الداخلي
            container.sortable({
                items: "> div",
                cursor: "grab",
                placeholder: "inner-card-placeholder",
                forcePlaceholderSize: true,
                opacity: 0.7,
                tolerance: "pointer",
                start: function(e, ui){ ui.placeholder.height(ui.item.height()); }
            });
        }
    });
}

function load_ratio(){
    const container = $("#ratio-dashboard");

    frappe.call({
        method:"metal_analytics.metal_analytics.api.dashboard.get_ratio_dashboard",
        callback(r){
            if(!r.message) return;

            const d = r.message;

            function percent(val,min,max){
                if(max-min===0) return 50;
                return ((val-min)/(max-min))*100;
            }

            let html = `
                <div class="ratio-block">
                    <div class="ratio-label">عالمية</div>
                    <div class="ratio-value">${d.global_ratio.toFixed(2)}</div>
                    <div class="ratio-bar"><div class="ratio-indicator" style="left:${percent(d.global_ratio,d.global_low,d.global_high)}%"></div></div>
                    <div class="ratio-range"><span>${d.global_low.toFixed(2)}</span><span>${d.global_high.toFixed(2)}</span></div>
                </div>
                <div class="ratio-block">
                    <div class="ratio-label">محلية</div>
                    <div class="ratio-value">${d.local_ratio.toFixed(2)}</div>
                    <div class="ratio-bar"><div class="ratio-indicator" style="left:${percent(d.local_ratio,d.local_low,d.local_high)}%"></div></div>
                    <div class="ratio-range"><span>${d.local_low.toFixed(2)}</span><span>${d.local_high.toFixed(2)}</span></div>
                </div>
            `;

            container.html(html);

            // تفعيل السحب الداخلي
            container.sortable({
                items: "> .ratio-block",
                cursor: "grab",
                placeholder: "inner-card-placeholder",
                forcePlaceholderSize: true,
                opacity: 0.7,
                tolerance: "pointer",
                start: function(e, ui){ ui.placeholder.height(ui.item.height()); }
            });
        }
    });
}

/* ================= COLLAPSIBLE SECTIONS ================= */
function toggle_section(page_id, element) {
    const section = $(`#section-${page_id}`);
    const iframe = section.find('iframe');
    const arrow = $(element).find('.arrow');

    if (!section.hasClass('d-none')) {
        section.slideUp(300, function() { section.addClass('d-none'); });
        arrow.css("transform", "rotate(0deg)");
    } else {
        if (!iframe.attr('src')) {
            iframe.attr('src', iframe.attr('data-src'));
            iframe.on('load', function() {
                $(this).contents().find('.navbar, .page-head, .header-main').hide();
            });
        }
        section.removeClass('d-none').hide().slideDown(300);
        arrow.css("transform", "rotate(180deg)");
        $('html, body').animate({ scrollTop: $(element).offset().top - 20 }, 500);
    }
}

/* ================= DASHBOARD LAYOUT ================= */
function render_dashboard(page){
    // استرجاع ترتيب الكروت الكبيرة إذا موجود
    let order = localStorage.getItem('gsaa_grid_order');
    order = order ? JSON.parse(order) : [];

    $(page.body).html(`
<div class="gsaa-dashboard">
    <div class="gsaa-grid">
        <div class="market-card ratio" id="card-ratio">
            <div class="card-header">نسبة الذهب / الفضة</div>
            <div id="ratio-dashboard"></div>
        </div>
        <div class="market-card currency" id="card-currency">
            <div class="card-header">العملات</div>
            <div id="currency-dashboard"></div>
        </div>
        <div class="market-card silver" id="card-silver">
            <div class="card-header">الفضة</div>
            <div id="silver-items-dashboard"></div>
        </div>
        <div class="market-card gold" id="card-gold">
            <div class="card-header">الذهب</div>
            <div id="gold-items-dashboard"></div>
        </div>
    </div>

    <!-- إعادة ترتيب الكروت حسب localStorage -->
    <script>
        if(order.length > 0){
            const grid = document.querySelector('.gsaa-grid');
            order.forEach(id => {
                const el = document.getElementById(id);
                if(el) grid.appendChild(el);
            });
        }
    </script>

    <div class="extra-sections mt-4">
        <div class="collapsible-wrapper mb-3">
            <div class="extra-header" onclick="toggle_section('daily-market-snapshot', this)">
                📊 سجل قائمة الاسعار <span class="arrow">▼</span>
            </div>
            <div id="section-daily-market-snapshot" class="iframe-collapse-content d-none">
                <iframe data-src="/app/daily-market-snapshot?header=0" class="dashboard-iframe"></iframe>
            </div>
        </div>

        <div class="collapsible-wrapper mb-3">
            <div class="extra-header" onclick="toggle_section('price-entry', this)">
                💰 لوحة الادخال <span class="arrow">▼</span>
            </div>
            <div id="section-price-entry" class="iframe-collapse-content d-none">
                <iframe data-src="/app/price-entry?header=0" class="dashboard-iframe"></iframe>
            </div>
        </div>
    </div>
</div>
`);
    // تفعيل السحب بعد إنشاء الصفحة
    make_cards_sortable();
}

/* ================= DRAG & DROP CARDS ================= */
function make_cards_sortable() {
    // 1. ترتيب الكروت الكبيرة
    $(".gsaa-grid").sortable({
        items: ".market-card",
        handle: ".card-header",
        cursor: "move",
        placeholder: "market-card-placeholder",
        forcePlaceholderSize: true,
        update: function(event, ui) {
            const order = $(this).sortable('toArray', { attribute: 'id' });
            localStorage.setItem('gsaa_grid_order', JSON.stringify(order));
        }
    });

    // 2. ترتيب العناصر الداخلية بعد تحميلها
    const innerContainers = [
        "#gold-items-dashboard", 
        "#silver-items-dashboard", 
        "#currency-dashboard"
    ];

    innerContainers.forEach(selector => {
        $(selector).sortable({
            items: "> div",
            cursor: "grab",
            placeholder: "inner-card-placeholder",
            forcePlaceholderSize: true,
            opacity: 0.7,
            tolerance: "pointer",
            start: function(e, ui){ ui.placeholder.height(ui.item.height()); }
        });
    });
}

/* ================= LOAD ITEMS ================= */
function load_dashboard_items(metal_type, container_id){
    const container = $("#" + container_id);
    frappe.call({
        method: "metal_analytics.metal_analytics.api.dashboard.get_dashboard_market_items",
        args: { metal_type },
        callback(r) {
            if(!r.message) return;

            let html = "";
            r.message.forEach(row=>{
                const up = row.price_gap_pct >= 0;
                const arrow = up ? "▲" : "▼";
                const arrowClass = up ? "arrow-up" : "arrow-down";
                const cls = up ? "up" : "down";

                html += `
                <div class="item-card ${cls}">
                    <div class="item-title">${row.item_name}</div>
                    <div class="item-prices">
                        <span>${format_currency(row.market_price)}</span>
                        <span class="calc">${format_currency(row.calculated_price)}</span>
                    </div>
                    <div class="gap ${cls}">
                        <span class="${arrowClass}">${arrow}</span>
                        ${Math.abs(row.price_gap_pct).toFixed(2)}%
                    </div>
                    <div class="mini-bar">
                        <div style="width:${Math.min(Math.abs(row.price_gap_pct)*4,100)}%"></div>
                    </div>
                </div>`;
            });

            container.html(html);
            // تفعيل السحب الداخلي فقط لهذا العنصر
            container.sortable({
                items: "> div",
                cursor: "grab",
                placeholder: "inner-card-placeholder",
                forcePlaceholderSize: true,
                opacity: 0.7,
                tolerance: "pointer",
                start: function(e, ui){ ui.placeholder.height(ui.item.height()); }
            });
        }
    });
}

/* ================= FORMAT ================= */
function format_currency(val){
    if(!val) return "0";
    return new Intl.NumberFormat().format(val);
}
