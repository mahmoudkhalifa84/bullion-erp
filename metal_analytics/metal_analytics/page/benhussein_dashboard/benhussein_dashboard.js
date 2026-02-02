frappe.pages['benhussein-dashboard'].on_page_load = function(wrapper) {

    frappe.require([
        "/assets/metal_analytics/css/benhussein_dashboard.css"
    ], function() {

        const page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'BenHussein Market Dashboard',
            single_column: true
        });

        page.set_secondary_action(__('الصفحة الرئيسية'), () => {
            frappe.set_route('/app/benhussein-dashboard');
        }, 'octicon octicon-home');

        page.set_primary_action('إدخال الأسعار', () => {
            frappe.set_route('/app/price-entry');
        });

        render_dashboard(page);

        load_all();

        // 🔥 Auto Refresh
        setInterval(load_all, 60000);

    });

};


function load_all(){
    load_dashboard_items("Gold","gold-items-dashboard");
    load_dashboard_items("Silver","silver-items-dashboard");
    load_currency_dashboard();
    load_ratio();
}


/* ================= DASHBOARD LAYOUT ================= */

function render_dashboard(page){

$(page.body).html(`

<div class="gsaa-dashboard">

    <div class="gsaa-grid">

        <div class="market-card ratio">
            <div class="card-header">نسبة الذهب / الفضة</div>
            <div id="ratio-dashboard"></div>
        </div>

        <div class="market-card currency">
            <div class="card-header">العملات</div>
            <div id="currency-dashboard"></div>
        </div>

        <div class="market-card silver">
            <div class="card-header">الفضة</div>
            <div id="silver-items-dashboard"></div>
        </div>

        <div class="market-card gold">
            <div class="card-header">الذهب</div>
            <div id="gold-items-dashboard"></div>
        </div>

    </div>

</div>
`);
}


/* ================= ITEMS ================= */

function load_dashboard_items(metal_type, container_id){

const container = $("#"+container_id);

frappe.call({
    method:"metal_analytics.metal_analytics.api.dashboard.get_dashboard_market_items",
    args:{ metal_type },

    callback(r){

        if(!r.message) return;

        let html="";

        r.message.forEach(row=>{

            const up = row.price_gap_pct >= 0;
			const arrow = up ? "▲" : "▼";
			const arrowClass = up ? "arrow-up" : "arrow-down";
            const cls = up ? "up" : "down";

            html+=`
            <div class="item-card ${cls}">

                <div class="item-title">${row.item_name}</div>

                <div class="item-prices">
                    <span>${format_currency(row.market_price)}</span>
                    <span class="calc">${format_currency(row.calculated_price)}</span>
                </div>

                <div class="gap ${cls}">
                <span class="${arrowClass}">${arrow}</span>${Math.abs(row.price_gap_pct).toFixed(2)}%
				</div>

                <div class="mini-bar">
                    <div style="width:${Math.min(Math.abs(row.price_gap_pct)*4,100)}%"></div>
                </div>

            </div>`;
        });

        container.html(html);
    }
});
}


/* ================= CURRENCY ================= */

function load_currency_dashboard(){

const container = $("#currency-dashboard");

frappe.call({
method:"metal_analytics.metal_analytics.api.dashboard.get_currency_dashboard",
callback(r){

if(!r.message) return;

let html="";

r.message.forEach(row=>{

const up = row.direction === "up";
const arrow = up ? "▲" : "▼";
const cls = up ? "up" : "down";

const diffPercent = Math.min(Math.abs(row.diff) * 10, 100);

html+=`
<div class="currency-card">

    <div class="currency-title">${row.name}</div>

    <div class="currency-price">
        ${row.market.toFixed(2)}
        <span class="currency-unit">د.ل</span>
    </div>

    <div class="currency-bank">
        مصرف ليبيا (${row.bank.toFixed(2)} د.ل)
    </div>

    <div class="currency-change ${cls}">
        ${arrow} ${Math.abs(row.diff).toFixed(2)} د.ل
    </div>

    <div class="currency-bar">
        <div class="currency-bar-fill ${cls}" style="width:${diffPercent}%"></div>
    </div>

	<div class="currency-range">
    <span>${row.low} د.ل</span>
    <span>${row.high} د.ل</span>
    </div>


</div>`;
});

container.html(html);
}
});
}



/* ================= RATIO ================= */

function load_ratio(){

const container=$("#ratio-dashboard");

frappe.call({
method:"metal_analytics.metal_analytics.api.dashboard.get_ratio_dashboard",
callback(r){

if(!r.message) return;

const d=r.message;

function percent(val,min,max){
if(max-min===0) return 50;
return ((val-min)/(max-min))*100;
}

container.html(`

	<div class="card-update">
		<div class="dot"></div>
		آخر تحديث
		<span class="time">
			${d.posting_date} ${d.posting_time}
		</span>
	</div>
<div class="ratio-block">

    <div class="ratio-label">عالمية</div>
    <div class="ratio-value">${d.global_ratio.toFixed(2)}</div>

    <div class="ratio-bar">
        <div class="ratio-indicator"
        style="left:${percent(d.global_ratio,d.global_low,d.global_high)}%">
        </div>
    </div>

    <div class="ratio-range">
        <span>${d.global_low.toFixed(2)}</span>
        <span>${d.global_high.toFixed(2)}</span>
    </div>

</div>


<div class="ratio-block">

    <div class="ratio-label">محلية</div>
    <div class="ratio-value">${d.local_ratio.toFixed(2)}</div>

    <div class="ratio-bar">
        <div class="ratio-indicator"
        style="left:${percent(d.local_ratio,d.local_low,d.local_high)}%">
        </div>
    </div>

    <div class="ratio-range">
        <span>${d.local_low.toFixed(2)}</span>
        <span>${d.local_high.toFixed(2)}</span>
    </div>

</div>


<div class="ratio-gap ${d.gap>=0?'up':'down'}">

    <div class="gap-value">
        ${d.gap>=0?'▲':'▼'} ${Math.abs(d.gap).toFixed(2)}
        (${Math.abs(d.gap_pct).toFixed(2)}%)
    </div>

</div>

`);
}
});
}


/* ================= FORMAT ================= */

function format_currency(val){
if(!val) return "0";
return new Intl.NumberFormat().format(val);
}
