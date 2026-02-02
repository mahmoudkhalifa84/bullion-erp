frappe.pages['price-entry'].on_page_load = function (wrapper) {
  frappe.require("/assets/metal_analytics/css/price_entry.css");

  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: 'إدخال أسعار السوق',
    single_column: true
  });

    // زر رجوع
  page.set_secondary_action(__('رجوع'), () => {
      window.history.back();
  }, 'octicon octicon-arrow-left');

    page.set_primary_action(__('قائمة الاسعار اليومية'), () => {
        frappe.set_route('List', 'Daily Market Snapshot');
        }, 'octicon octicon-list-unordered');


  let snapshot_state = {
    Gold: {},
    Silver: {}
  };

  let current_metal = "Gold";

  const html = `
  <div class="price-page">
    <div class="layout">

<!-- RIGHT : GLOBAL -->
<div class="card global-card">
  <div class="group-title inside">🌍 المؤشرات العالمية</div>

  <div class="field">
    <label>تاريخ التسجيل</label>
    <input type="date"
           id="posting_date"
           value="${frappe.datetime.nowdate()}">
  </div>

  <div class="grid-2">
    <div>
      <label>الذهب العالمي ($)</label>
      <input type="number" id="world_gold_oz">
    </div>
    <div>
      <label>الفضة العالمية ($)</label>
      <input type="number" id="world_silver_oz">
    </div>
  </div>

  <div class="grid-2">
    <div>
      <label>سعر الدولار (السوق)</label>
      <input type="number" id="usd_rate_local">
    </div>
    <div>
      <label>سعر الدولار البنكي</label>
      <input type="number" id="usd_rate_bank">
    </div>
  </div>

  <div class="grid-2">
    <div>
      <label>سعر اليورو</label>
      <input type="number" id="eur_rate">
    </div>
    <div>
      <label>سعر الجنيه الإسترليني</label>
      <input type="number" id="gbp_rate">
    </div>
  </div>

  <div class="grid-2">
    <div>
      <label>مؤشر DXY</label>
      <input type="number" id="dxy_index">
    </div>
    <div>
      <label>مؤشر EURX</label>
      <input type="number" id="eurx_index">
    </div>
  </div>
</div>

      <!-- LEFT : LOCAL -->
      <div class="card local-card">
        <div class="group-title inside">💰 الأسعار المحلية</div>

        <div class="metal-tabs">
          <div class="metal-tab active gold" data-metal="Gold">🟡 ذهب</div>
          <div class="metal-tab silver" data-metal="Silver">⚪ فضة</div>
        </div>

        <div id="items-container"></div>

        <button class="btn-save gold" id="save-snapshot">
          💾 حفظ Snapshot السوق
        </button>

        <div id="save-status" class="save-status"></div>
      </div>

    </div>
  </div>
  `;

  page.main.html(html);

  /* ================= THEME ================= */
  function set_theme(metal) {
    current_metal = metal;

    page.main.find('.metal-tab').removeClass('active gold silver');
    page.main.find('#save-snapshot').removeClass('gold silver');

    page.main
      .find('.metal-tab[data-metal="' + metal + '"]')
      .addClass('active ' + metal.toLowerCase());

    page.main.find('#save-snapshot').addClass(metal.toLowerCase());
  }

/* ================= LOAD ITEMS (MODIFIED) ================= */
function load_items(metal_type) {
  const container = page.main.find('#items-container');
  container.html('⏳ تحميل الأصناف...');

  frappe.call({
    method: "metal_analytics.metal_analytics.api.market.get_market_items",
    args: { metal_type },
    callback(r) {
      if (!r.message || !r.message.length) {
        container.html('لا توجد أصناف');
        return;
      }

      const grouped = {};
      r.message.forEach(item => {
        const group = item.item_group || 'أخرى';
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(item);
      });

      let html = '';

      Object.keys(grouped).forEach(group_name => {
        html += `
          <div class="sub-group">
            <div class="group-title inside">${group_name}</div>
            <div class="items-grid">
        `;

        grouped[group_name].forEach(item => {
          html += `
            <div class="card item-card" data-item="${item.name}">
              <div class="item-row">
                <div class="item-title">${item.item_name}</div>
                <input class="market-price"
                       type="number"
                       placeholder="السعر المحلي">
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      });

      // 🔽 هذا السطر يرسم العناصر
      container.html(html);

      // 🔁 هذا السطر يعيد تعبئة القيم المحفوظة
      if (snapshot_state[metal_type]) {
        Object.entries(snapshot_state[metal_type]).forEach(([item, price]) => {
          container
            .find(`.item-card[data-item="${item}"] .market-price`)
            .val(price);
        });
      }
    }
  });
}



  /* ================= SAVE SNAPSHOT ================= */
 page.main.on('click', '#save-snapshot', function () {
    
    // تحديث الـ state بالقيم الظاهرة حالياً على الشاشة قبل الحفظ النهائي
    page.main.find('.item-card').each(function() {
        const item = $(this).data('item');
        const price = $(this).find('.market-price').val();
        if (item) snapshot_state[current_metal][item] = price;
    });

    const items = [];
    
    // دمج الذهب والفضة من الـ state
    ["Gold", "Silver"].forEach(m => {
        Object.entries(snapshot_state[m]).forEach(([item, price]) => {
            if (price) { // التأكد أن السعر ليس فارغاً
                items.push({
                    item: item,
                    market_price: price
                });
            }
        });
    });

    if (!items.length) {
      frappe.msgprint("⚠️ الرجاء إدخال سعر واحد على الأقل (ذهب أو فضة)");
      return;
    }
  const payload = {
  posting_date: page.main.find('#posting_date').val(),

  world_gold_oz: page.main.find('#world_gold_oz').val(),
  world_silver_oz: page.main.find('#world_silver_oz').val(),

  usd_rate_local: page.main.find('#usd_rate_local').val(),
  usd_rate_bank: page.main.find('#usd_rate_bank').val(),
  eur_rate: page.main.find('#eur_rate').val(),
  gbp_rate: page.main.find('#gbp_rate').val(),

  dxy_index: page.main.find('#dxy_index').val(),
  eurx_index: page.main.find('#eurx_index').val(),

  items: items
};


    frappe.call({
      method: "metal_analytics.metal_analytics.api.market.save_market_snapshot",
      args: { data: payload },
      freeze: true,
      freeze_message: "💾 جارٍ حفظ Snapshot...",
      callback(r) {
        if (r.message && r.message.status === "success") {
          page.main.find('#save-status').html(`
            <div class="success-row">
              ✅ تم إدخال الأسعار بنجاح
              <br>
              🕒 ${frappe.datetime.now_time()} — ${current_metal}
            </div>
          `);
        }
      }
    });
  });

    /* ================= SAVE INPUT STATE ================= */
 page.main.on('input', '.market-price', function () {
  const card = $(this).closest('.item-card');
  const item = card.data('item');
  const price = $(this).val();

  if (!item) return;

  if (!snapshot_state[current_metal]) {
    snapshot_state[current_metal] = {};
  }

  if (price === "") {
    delete snapshot_state[current_metal][item];
  } else {
    snapshot_state[current_metal][item] = price;
  }
});


   /* ================= EVENTS ================= */
  page.main.on('click', '.metal-tab', function () {
    const next_metal = $(this).data('metal');
    
    // 1. حفظ القيم الحالية في الـ state قبل التبديل
    page.main.find('.item-card').each(function() {
        const item = $(this).data('item');
        const price = $(this).find('.market-price').val();
        if (item && price) {
            snapshot_state[current_metal][item] = price;
        }
    });

    // 2. التبديل للمعدن الجديد
    set_theme(next_metal);
    load_items(next_metal);
  });
}
