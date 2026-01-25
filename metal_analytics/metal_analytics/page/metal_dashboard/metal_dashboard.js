frappe.pages['metal-dashboard'].on_page_load = function(wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'لوحة تحليلات المعادن الثمينة',
        single_column: true
    });

    // إضافة أزرار التنقل الرئيسية
    page.set_secondary_action('🔄 تحديث', () => {
        refreshData();
    }, 'fa fa-refresh');
    
    // زر إدخال الأسعار
    page.set_secondary_action('➕ إدخال أسعار', () => {
        frappe.set_route('price-entry');
    }, 'fa fa-plus', {right: true});
    
    // زر قائمة الأسعار
    page.set_secondary_action('📋 قائمة الأسعار', () => {
        frappe.set_route('price-entry', { show_list: true });
    }, 'fa fa-list', {right: true});

    // حالة التبويبات النشطة
    let activeTab = 'overview';

    // إنشاء الهيكل الرئيسي
    const dashboardHTML = `
<div class="metal-dashboard-container" dir="rtl">

    <!-- شريط التنقل العلوي -->
    <div class="dashboard-navbar">
        <div class="nav-tabs">
            <button class="nav-tab ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
                <i class="fa fa-chart-line"></i>
                <span>نظرة عامة</span>
            </button>
            <button class="nav-tab ${activeTab === 'quick_actions' ? 'active' : ''}" data-tab="quick_actions">
                <i class="fa fa-bolt"></i>
                <span>إجراءات سريعة</span>
            </button>
            <button class="nav-tab ${activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
                <i class="fa fa-chart-bar"></i>
                <span>التحليلات</span>
            </button>
        </div>
        
        <div class="navbar-actions">
            <button class="btn btn-outline-primary btn-sm" id="goto_price_entry">
                <i class="fa fa-plus-circle"></i> إدخال سعر جديد
            </button>
            <button class="btn btn-outline-success btn-sm" id="refresh_dashboard">
                <i class="fa fa-sync-alt"></i> تحديث
            </button>
        </div>
    </div>

    <!-- تبويب النظرة العامة -->
    <div class="tab-content ${activeTab === 'overview' ? 'active' : ''}" id="overview-tab">
        
        <!-- بطاقات الأسعار الرئيسية -->
        <div class="row g-4 mb-4">
            ${createMetalCard('silver', 'الفضة', '#64748b')}
            ${createMetalCard('gold', 'الذهب', '#f59e0b')}
        </div>

        <!-- المؤشرات والإحصائيات -->
        <div class="row g-4">
            ${createRatioCard()}
            ${createCurrencyCard()}
        </div>

        <!-- ملخص الإجراءات السريعة -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="gsaa-card">
                    <div class="gsaa-card-header neutral d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fa fa-rocket"></i>
                            <span>إجراءات سريعة</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" id="more_actions">
                            المزيد <i class="fa fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-3">
                                <a href="#" class="quick-action-card" data-action="price_entry">
                                    <div class="action-icon bg-primary">
                                        <i class="fa fa-plus"></i>
                                    </div>
                                    <div class="action-content">
                                        <h5>إدخال سعر جديد</h5>
                                        <p>إدخال أسعار الذهب والفضة</p>
                                    </div>
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="#" class="quick-action-card" data-action="price_list">
                                    <div class="action-icon bg-success">
                                        <i class="fa fa-list"></i>
                                    </div>
                                    <div class="action-content">
                                        <h5>قائمة الأسعار</h5>
                                        <p>عرض جميع الأسعار المحفوظة</p>
                                    </div>
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="#" class="quick-action-card" data-action="gold_prices">
                                    <div class="action-icon bg-warning">
                                        <i class="fa fa-diamond"></i>
                                    </div>
                                    <div class="action-content">
                                        <h5>أسعار الذهب</h5>
                                        <p>عرض تحليلات الذهب</p>
                                    </div>
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="#" class="quick-action-card" data-action="silver_prices">
                                    <div class="action-icon bg-secondary">
                                        <i class="fa fa-circle"></i>
                                    </div>
                                    <div class="action-content">
                                        <h5>أسعار الفضة</h5>
                                        <p>عرض تحليلات الفضة</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- جدول التغيرات التاريخية -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="gsaa-card">
                    <div class="gsaa-card-header neutral d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fa fa-history"></i>
                            <span>آخر التغيرات في الأسعار</span>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-info" id="view_all_history">
                                <i class="fa fa-external-link-alt"></i> عرض الكل
                            </button>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-container">
                            <table class="metal-table" id="price-history-table">
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>المعدن</th>
                                        <th>الصنف</th>
                                        <th>السعر العالمي</th>
                                        <th>السعر المحلي</th>
                                        <th>التغير</th>
                                        <th>الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody id="history-body">
                                    <tr><td colspan="7" class="text-center py-4">جاري تحميل البيانات...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- تبويب الإجراءات السريعة -->
    <div class="tab-content ${activeTab === 'quick_actions' ? 'active' : ''}" id="quick_actions-tab" style="display: none;">
        <div class="row">
            <div class="col-12">
                <div class="gsaa-card">
                    <div class="gsaa-card-header neutral">
                        <i class="fa fa-bolt"></i>
                        <span>إجراءات سريعة للأسعار</span>
                    </div>
                    <div class="card-body">
                        <div class="row g-4">
                            <!-- إدخال سعر جديد -->
                            <div class="col-md-4">
                                <div class="action-card primary">
                                    <div class="action-card-icon">
                                        <i class="fa fa-plus-circle"></i>
                                    </div>
                                    <div class="action-card-content">
                                        <h4>إدخال سعر جديد</h4>
                                        <p>إدخال أسعار تحليلية للذهب والفضة</p>
                                        <div class="action-links">
                                            <a href="#" class="action-link" data-action="gold_entry">
                                                <i class="fa fa-diamond"></i> إدخال سعر الذهب
                                            </a>
                                            <a href="#" class="action-link" data-action="silver_entry">
                                                <i class="fa fa-circle"></i> إدخال سعر الفضة
                                            </a>
                                        </div>
                                    </div>
                                    <div class="action-card-footer">
                                        <button class="btn btn-primary w-100" data-action="price_entry">
                                            <i class="fa fa-arrow-left"></i> الذهاب إلى الإدخال
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- قائمة الأسعار -->
                            <div class="col-md-4">
                                <div class="action-card success">
                                    <div class="action-card-icon">
                                        <i class="fa fa-list-alt"></i>
                                    </div>
                                    <div class="action-card-content">
                                        <h4>قائمة الأسعار</h4>
                                        <p>عرض وتعديل جميع الأسعار المحفوظة</p>
                                        <div class="stats-grid">
                                            <div class="stat-item">
                                                <span class="stat-value" id="total_prices">--</span>
                                                <span class="stat-label">إجمالي الأسعار</span>
                                            </div>
                                            <div class="stat-item">
                                                <span class="stat-value" id="today_prices">--</span>
                                                <span class="stat-label">اليوم</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="action-card-footer">
                                        <button class="btn btn-success w-100" data-action="price_list">
                                            <i class="fa fa-arrow-left"></i> عرض القائمة
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- التقارير والتحليلات -->
                            <div class="col-md-4">
                                <div class="action-card info">
                                    <div class="action-card-icon">
                                        <i class="fa fa-chart-pie"></i>
                                    </div>
                                    <div class="action-card-content">
                                        <h4>التقارير</h4>
                                        <p>تقارير وتحليلات متقدمة للأسعار</p>
                                        <div class="action-links">
                                            <a href="#" class="action-link" data-action="trend_report">
                                                <i class="fa fa-chart-line"></i> تقرير الاتجاهات
                                            </a>
                                            <a href="#" class="action-link" data-action="gap_report">
                                                <i class="fa fa-percentage"></i> تقرير الفروقات
                                            </a>
                                        </div>
                                    </div>
                                    <div class="action-card-footer">
                                        <button class="btn btn-info w-100" data-action="reports">
                                            <i class="fa fa-arrow-left"></i> عرض التقارير
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- تبويب التحليلات -->
    <div class="tab-content ${activeTab === 'analytics' ? 'active' : ''}" id="analytics-tab" style="display: none;">
        <div class="row">
            <div class="col-12">
                <div class="gsaa-card">
                    <div class="gsaa-card-header neutral">
                        <i class="fa fa-chart-bar"></i>
                        <span>تحليلات متقدمة</span>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="analytics-chart-placeholder">
                                    <h5 class="text-center mb-3">📈 اتجاهات أسعار الذهب والفضة</h5>
                                    <div class="chart-container" id="price_trend_chart">
                                        <div class="text-center py-5">
                                            <i class="fa fa-chart-line fa-3x text-muted"></i>
                                            <p class="mt-2">جاري تحميل الرسم البياني...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="analytics-stats">
                                    <h5 class="mb-4">📊 إحصائيات أساسية</h5>
                                    <div class="stat-box">
                                        <div class="stat-item">
                                            <span class="stat-label">متوسط سعر الذهب</span>
                                            <span class="stat-value" id="avg_gold_price">--</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">متوسط سعر الفضة</span>
                                            <span class="stat-value" id="avg_silver_price">--</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">النسبة المتوسطة</span>
                                            <span class="stat-value" id="avg_ratio">--</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">أعلى سعر ذهب</span>
                                            <span class="stat-value" id="max_gold_price">--</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">أقل سعر فضة</span>
                                            <span class="stat-value" id="min_silver_price">--</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>

<style>
${getDashboardStyles()}
</style>
    `;

    page.main.html(dashboardHTML);

    // تهيئة الأحداث والمستمعين
    initializeEventListeners(wrapper);
    
    // تحميل البيانات
    loadDashboardData();
    loadPriceHistory();
    loadAnalyticsData();

    // تحديث تلقائي كل 5 دقائق
    let refreshInterval = setInterval(() => {
        refreshData();
    }, 300000);

    // ============ دوال المساعدة ============

    function createMetalCard(type, title, color) {
        return `
        <div class="col-md-6 col-lg-3">
            <div class="gsaa-card clickable" data-route="price-entry" data-metal="${type}">
                <div class="gsaa-card-header" style="background: ${color}">
                    <span>${title}</span>
                    <i class="fa fa-gem"></i>
                </div>
                <div class="gsaa-card-body">
                    <div class="price-display">
                        <div class="global-price">
                            <small>السعر العالمي (أونصة)</small>
                            <div class="price">
                                $ <span id="${type}-usd">--</span>
                                <span class="price-change" id="${type}-change"></span>
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div class="local-prices">
                            <div class="price-row">
                                <span class="price-label">الشراء</span>
                                <span class="price-value buy" id="${type}-buy">--</span>
                            </div>
                            <div class="price-row">
                                <span class="price-label">البيع</span>
                                <span class="price-value sell" id="${type}-sell">--</span>
                            </div>
                            ${type === 'gold' ? `
                            <div class="price-row">
                                <span class="price-label">جرام 21</span>
                                <span class="price-value" id="gold-21">--</span>
                            </div>
                            <div class="price-row">
                                <span class="price-label">جرام 18</span>
                                <span class="price-value" id="gold-18">--</span>
                            </div>
                            ` : `
                            <div class="price-row">
                                <span class="price-label">الجزء</span>
                                <span class="price-value" id="silver-part">--</span>
                            </div>
                            `}
                        </div>
                    </div>
                </div>
                <div class="gsaa-card-footer">
                    <small class="last-update" id="${type}-update">آخر تحديث: --</small>
                </div>
            </div>
        </div>
        `;
    }

    function createRatioCard() {
        return `
        <div class="col-md-6 col-lg-4">
            <div class="gsaa-card">
                <div class="gsaa-card-header neutral">
                    <span>نسبة الذهب إلى الفضة</span>
                    <i class="fa fa-balance-scale"></i>
                </div>
                <div class="ratio-container">
                    <div class="ratio-display">
                        <div class="ratio-item">
                            <small>النسبة العالمية</small>
                            <strong id="ratio-global">--</strong>
                        </div>
                        <div class="ratio-item ${getRatioClass('global')}">
                            <small>المعدل التاريخي</small>
                            <span>~60</span>
                        </div>
                    </div>
                    <div class="ratio-bar">
                        <div class="bar-fill" id="ratio-bar"></div>
                    </div>
                    <div class="ratio-insight" id="ratio-insight">
                        <i class="fa fa-info-circle"></i>
                        <span>جاري التحليل...</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    function createCurrencyCard() {
        return `
        <div class="col-md-6 col-lg-5">
            <div class="gsaa-card">
                <div class="gsaa-card-header neutral">
                    <span>العملات والمؤشرات</span>
                    <i class="fa fa-chart-line"></i>
                </div>
                <div class="currency-container">
                    <div class="currency-grid">
                        <div class="currency-item primary">
                            <small>الدولار الأمريكي</small>
                            <div>
                                <strong id="usd-rate">-- د.ل</strong>
                                <span class="currency-change" id="usd-change"></span>
                            </div>
                        </div>
                        <div class="currency-item">
                            <small>مؤشر الدولار (DXY)</small>
                            <div>
                                <strong id="dxy">--</strong>
                                <span class="currency-change" id="dxy-change"></span>
                            </div>
                        </div>
                        <div class="currency-item">
                            <small>اليورو (EUR)</small>
                            <div>
                                <strong id="eur">--</strong>
                                <span class="currency-change" id="eur-change"></span>
                            </div>
                        </div>
                    </div>
                    <div class="market-status">
                        <span class="status-label">حالة السوق:</span>
                        <span class="status-value" id="market-status">غير معروف</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    function getDashboardStyles() {
        return `
.metal-dashboard-container {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    min-height: 100vh;
    padding: 20px;
}

/* شريط التنقل العلوي */
.dashboard-navbar {
    background: white;
    border-radius: 12px;
    padding: 15px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border: 1px solid #e3e6f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-tabs {
    display: flex;
    gap: 10px;
}

.nav-tab {
    background: none;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6c757d;
    font-weight: 500;
    transition: all 0.3s;
    cursor: pointer;
}

.nav-tab:hover {
    background: #f8f9fa;
    color: #4e73df;
}

.nav-tab.active {
    background: #4e73df;
    color: white;
}

.nav-tab i {
    font-size: 14px;
}

.navbar-actions {
    display: flex;
    gap: 10px;
}

/* تبويبات المحتوى */
.tab-content {
    display: none;
    animation: fadeIn 0.3s ease-out;
}

.tab-content.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* بطاقات الإجراءات السريعة */
.quick-action-card {
    display: block;
    background: white;
    border-radius: 12px;
    padding: 20px;
    border: 2px solid #e3e6f0;
    text-decoration: none !important;
    color: #5a5c69;
    transition: all 0.3s;
    height: 100%;
}

.quick-action-card:hover {
    border-color: #4e73df;
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    color: #5a5c69;
}

.action-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    color: white;
    font-size: 20px;
}

.bg-primary { background: linear-gradient(135deg, #4e73df 0%, #224abe 100%); }
.bg-success { background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%); }
.bg-warning { background: linear-gradient(135deg, #f6c23e 0%, #dda20a 100%); }
.bg-secondary { background: linear-gradient(135deg, #858796 0%, #60616f 100%); }

.action-content h5 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
    color: #5a5c69;
}

.action-content p {
    font-size: 13px;
    color: #858796;
    margin: 0;
}

/* بطاقات الإجراءات المتقدمة */
.action-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    border: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.action-card.primary {
    border-top: 5px solid #4e73df;
}

.action-card.success {
    border-top: 5px solid #1cc88a;
}

.action-card.info {
    border-top: 5px solid #36b9cc;
}

.action-card-icon {
    background: linear-gradient(135deg, rgba(78, 115, 223, 0.1), rgba(34, 74, 190, 0.1));
    padding: 25px;
    text-align: center;
    font-size: 48px;
    color: #4e73df;
}

.action-card.success .action-card-icon {
    background: linear-gradient(135deg, rgba(28, 200, 138, 0.1), rgba(19, 133, 92, 0.1));
    color: #1cc88a;
}

.action-card.info .action-card-icon {
    background: linear-gradient(135deg, rgba(54, 185, 204, 0.1), rgba(28, 152, 169, 0.1));
    color: #36b9cc;
}

.action-card-content {
    padding: 20px;
    flex: 1;
}

.action-card-content h4 {
    color: #5a5c69;
    font-weight: 700;
    margin-bottom: 10px;
}

.action-card-content p {
    color: #858796;
    font-size: 14px;
    margin-bottom: 20px;
}

.action-links {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.action-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4e73df;
    text-decoration: none;
    font-size: 14px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f3f4;
}

.action-link:hover {
    color: #224abe;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 20px;
}

.stat-item {
    text-align: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
}

.stat-value {
    display: block;
    font-size: 24px;
    font-weight: 800;
    color: #4e73df;
}

.action-card.success .stat-value {
    color: #1cc88a;
}

.stat-label {
    display: block;
    font-size: 12px;
    color: #858796;
    margin-top: 5px;
}

.action-card-footer {
    padding: 15px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e3e6f0;
}

/* مخطط التحليلات */
.analytics-chart-placeholder {
    background: white;
    border-radius: 12px;
    padding: 20px;
    height: 100%;
    border: 1px solid #e3e6f0;
}

.chart-container {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 8px;
}

.analytics-stats {
    background: white;
    border-radius: 12px;
    padding: 20px;
    height: 100%;
    border: 1px solid #e3e6f0;
}

.stat-box {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.stat-box .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #4e73df;
}

.stat-box .stat-item:nth-child(2) {
    border-left-color: #1cc88a;
}

.stat-box .stat-item:nth-child(3) {
    border-left-color: #f6c23e;
}

.stat-box .stat-item:nth-child(4) {
    border-left-color: #e74a3b;
}

.stat-box .stat-item:nth-child(5) {
    border-left-color: #36b9cc;
}

/* تحسينات للجدول */
.table-container {
    overflow-x: auto;
    max-height: 400px;
}

.metal-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.metal-table th {
    background: #4e73df;
    padding: 12px 15px;
    text-align: right;
    font-weight: 600;
    color: white;
    position: sticky;
    top: 0;
    z-index: 10;
}

.metal-table td {
    padding: 10px 15px;
    border-bottom: 1px solid #e3e6f0;
    vertical-align: middle;
}

.metal-table tr:hover {
    background-color: #f8f9fa;
}

.metal-table .btn-sm {
    padding: 3px 8px;
    font-size: 12px;
}

/* بطاقات الأسعار الرئيسية */
.gsaa-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.gsaa-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.gsaa-card-header {
    padding: 16px 20px;
    font-weight: 700;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    color: white;
}

.gsaa-card-header.neutral {
    background: #475569;
    color: white;
}

.gsaa-card-body {
    padding: 20px;
    flex: 1;
}

.gsaa-card-footer {
    padding: 12px 20px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    font-size: 0.85rem;
    color: #64748b;
}

.price-display .global-price {
    margin-bottom: 15px;
}

.price {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
}

.price-change {
    font-size: 0.9rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
}

.price-change.positive {
    background: #dcfce7;
    color: #16a34a;
}

.price-change.negative {
    background: #fee2e2;
    color: #dc2626;
}

.divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    margin: 20px 0;
}

.local-prices {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
}

.price-label {
    color: #64748b;
    font-size: 0.95rem;
}

.price-value {
    font-weight: 700;
    font-size: 1.1rem;
}

.buy { color: #16a34a; }
.sell { color: #dc2626; }

.ratio-container {
    padding: 20px;
}

.ratio-display {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.ratio-item {
    text-align: center;
    padding: 15px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.ratio-item strong {
    font-size: 1.8rem;
    color: #1e293b;
    display: block;
    margin-top: 5px;
}

.ratio-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    margin: 20px 0;
}

.bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
    width: 50%;
    transition: width 0.5s ease;
}

.ratio-insight {
    padding: 12px;
    background: #f0f9ff;
    border-radius: 8px;
    border: 1px solid #bae6fd;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    color: #0369a1;
}

.currency-container {
    padding: 20px;
}

.currency-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.currency-item {
    padding: 15px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.currency-item.primary {
    background: #eff6ff;
    border-color: #bfdbfe;
}

.currency-item small {
    display: block;
    color: #64748b;
    margin-bottom: 5px;
}

.currency-item strong {
    font-size: 1.3rem;
    color: #1e293b;
}

.currency-change {
    font-size: 0.85rem;
    margin-left: 8px;
    padding: 2px 6px;
    border-radius: 8px;
}

.market-status {
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;
}

/* أنيميشن التحميل */
.loading-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* تصميم متجاوب */
@media (max-width: 768px) {
    .metal-dashboard-container {
        padding: 10px;
    }
    
    .dashboard-navbar {
        flex-direction: column;
        gap: 15px;
    }
    
    .nav-tabs {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 10px;
    }
    
    .navbar-actions {
        width: 100%;
    }
    
    .navbar-actions .btn {
        flex: 1;
    }
    
    .price {
        font-size: 1.5rem;
    }
    
    .currency-grid {
        grid-template-columns: 1fr;
    }
    
    .ratio-display {
        grid-template-columns: 1fr;
    }
    
    .quick-action-card {
        margin-bottom: 15px;
    }
    
    .action-card {
        margin-bottom: 20px;
    }
}
        `;
    }

    function getRatioClass(value) {
        const num = parseFloat(value) || 0;
        if (num < 50) return 'low-ratio';
        if (num > 80) return 'high-ratio';
        return 'normal-ratio';
    }

    function initializeEventListeners(wrapper) {
        // تبديل التبويبات
        $('.nav-tab').on('click', function() {
            const tab = $(this).data('tab');
            switchTab(tab);
        });

        // التنقل إلى صفحة إدخال الأسعار
        $(wrapper).on('click', '.gsaa-card.clickable', function() {
            const metalType = $(this).data('metal');
            frappe.set_route('price-entry', { metal_type: metalType });
        });

        // تحديث عند النقر على البطاقات
        $(wrapper).on('dblclick', '.gsaa-card', function() {
            refreshData();
        });

        // زر الذهاب إلى إدخال الأسعار
        $('#goto_price_entry').on('click', function() {
            frappe.set_route('price-entry');
        });

        // زر تحديث اللوحة
        $('#refresh_dashboard').on('click', function() {
            refreshData();
        });

        // الإجراءات السريعة
        $('.quick-action-card').on('click', function(e) {
            e.preventDefault();
            const action = $(this).data('action');
            handleQuickAction(action);
        });

        // أزرار الإجراءات في بطاقات الإجراءات
        $('[data-action]').on('click', function() {
            const action = $(this).data('action');
            handleQuickAction(action);
        });

        // زر عرض كل التاريخ
        $('#view_all_history').on('click', function() {
            frappe.set_route('price-entry', { show_list: true });
        });

        // زر المزيد من الإجراءات
        $('#more_actions').on('click', function() {
            switchTab('quick_actions');
        });
    }

    function switchTab(tab) {
        // تحديث التبويبات النشطة
        activeTab = tab;
        $('.nav-tab').removeClass('active');
        $(`.nav-tab[data-tab="${tab}"]`).addClass('active');
        
        // إظهار المحتوى المناسب
        $('.tab-content').removeClass('active').hide();
        $(`#${tab}-tab`).addClass('active').show();
        
        // تحميل بيانات إضافية إذا لزم الأمر
        if (tab === 'analytics') {
            loadAnalyticsData();
        } else if (tab === 'quick_actions') {
            loadQuickActionsStats();
        }
    }

    function handleQuickAction(action) {
        switch(action) {
            case 'price_entry':
            case 'gold_entry':
            case 'silver_entry':
                frappe.set_route('price-entry');
                break;
                
            case 'price_list':
                frappe.set_route('price-entry', { show_list: true });
                break;
                
            case 'gold_prices':
                frappe.set_route('price-entry', { metal_type: 'gold', show_list: true });
                break;
                
            case 'silver_prices':
                frappe.set_route('price-entry', { metal_type: 'silver', show_list: true });
                break;
                
            case 'reports':
            case 'trend_report':
            case 'gap_report':
                showReports();
                break;
        }
    }

    function showReports() {
        frappe.msgprint({
            title: '📊 التقارير',
            message: `
                <div class="alert alert-info">
                    <h5>تقارير متقدمة للأسعار</h5>
                    <p>سيتم تطوير هذه الميزة قريباً</p>
                    <div class="mt-3">
                        <button class="btn btn-primary" onclick="frappe.set_route('price-entry', { show_list: true })">
                            <i class="fa fa-list"></i> الانتقال إلى قائمة الأسعار
                        </button>
                    </div>
                </div>
            `,
            indicator: 'blue'
        });
    }

    async function loadDashboardData() {
        try {
            showLoadingState(true);
            
            const [prices, currencies] = await Promise.all([
                fetchMetalPrices(),
                fetchCurrencyRates()
            ]);

            updateMetalPrices(prices);
            updateCurrencyRates(currencies);
            updateGoldSilverRatio(prices);
            
            showLoadingState(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showErrorState();
        }
    }

    async function loadAnalyticsData() {
        try {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Daily Metal Price",
                    fields: ["metal_type", "global_price", "local_price", "date"],
                    order_by: "date desc",
                    limit_page_length: 100
                },
                callback: function(r) {
                    if (r.message && r.message.length > 0) {
                        updateAnalyticsStats(r.message);
                    }
                }
            });
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    function updateAnalyticsStats(prices) {
        const goldPrices = prices.filter(p => p.metal_type === "Gold");
        const silverPrices = prices.filter(p => p.metal_type === "Silver");
        
        if (goldPrices.length > 0) {
            const sumGold = goldPrices.reduce((sum, p) => sum + p.global_price, 0);
            const avgGold = sumGold / goldPrices.length;
            const maxGold = Math.max(...goldPrices.map(p => p.global_price));
            
            $('#avg_gold_price').text('$' + avgGold.toFixed(2));
            $('#max_gold_price').text('$' + maxGold.toFixed(2));
        }
        
        if (silverPrices.length > 0) {
            const sumSilver = silverPrices.reduce((sum, p) => sum + p.global_price, 0);
            const avgSilver = sumSilver / silverPrices.length;
            const minSilver = Math.min(...silverPrices.map(p => p.global_price));
            
            $('#avg_silver_price').text('$' + avgSilver.toFixed(2));
            $('#min_silver_price').text('$' + minSilver.toFixed(2));
        }
        
        if (goldPrices.length > 0 && silverPrices.length > 0) {
            const latestGold = goldPrices[0].global_price;
            const latestSilver = silverPrices[0].global_price;
            const ratio = latestGold / latestSilver;
            
            $('#avg_ratio').text(ratio.toFixed(2));
        }
    }

    async function loadQuickActionsStats() {
        frappe.call({
            method: "frappe.client.get_count",
            args: {
                doctype: "Daily Metal Price"
            },
            callback: function(r) {
                $('#total_prices').text(r.message || '0');
            }
        });
        
        const today = frappe.datetime.get_today();
        frappe.call({
            method: "frappe.client.get_count",
            args: {
                doctype: "Daily Metal Price",
                filters: { date: today }
            },
            callback: function(r) {
                $('#today_prices').text(r.message || '0');
            }
        });
    }

    async function fetchMetalPrices() {
        return new Promise((resolve, reject) => {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Daily Metal Price",
                    fields: ["metal_type", "global_price", "local_price", "date"],
                    order_by: "date desc",
                    limit_page_length: 10
                },
                callback: function(r) {
                    if (r.message) {
                        const prices = r.message;
                        const processedPrices = processPricesWithChange(prices);
                        resolve(processedPrices);
                    } else {
                        reject(new Error('No data received'));
                    }
                },
                error: reject
            });
        });
    }

    function processPricesWithChange(prices) {
        const goldPrices = prices.filter(p => p.metal_type === "Gold");
        const silverPrices = prices.filter(p => p.metal_type === "Silver");
        
        const result = [];
        
        if (goldPrices.length > 0) {
            const latestGold = { ...goldPrices[0] };
            if (goldPrices.length > 1) {
                latestGold.previous_price = goldPrices[1].global_price;
            }
            result.push(latestGold);
        }
        
        if (silverPrices.length > 0) {
            const latestSilver = { ...silverPrices[0] };
            if (silverPrices.length > 1) {
                latestSilver.previous_price = silverPrices[1].global_price;
            }
            result.push(latestSilver);
        }
        
        return result;
    }

    async function fetchCurrencyRates() {
        return {
            usd: 8.82,
            dxy: 90.15,
            eur: 0.92,
            last_updated: new Date().toISOString()
        };
    }

    function updateMetalPrices(prices) {
        const gold = prices.find(d => d.metal_type === "Gold");
        const silver = prices.find(d => d.metal_type === "Silver");

        if (gold) {
            updatePriceCard('gold', gold);
        }

        if (silver) {
            updatePriceCard('silver', silver);
        }
    }

    function updatePriceCard(type, data) {
        const { global_price, local_price, previous_price, date } = data;
        
        $(`#${type}-usd`).text(global_price.toFixed(2));
        
        if (previous_price) {
            const change = ((global_price - previous_price) / previous_price * 100).toFixed(2);
            const changeElement = $(`#${type}-change`);
            changeElement.text(`${change > 0 ? '+' : ''}${change}%`);
            changeElement.removeClass('positive negative').addClass(change >= 0 ? 'positive' : 'negative');
        }
        
        if (type === 'gold') {
            const ounceToGram = 31.1035;
            const gold24 = global_price / ounceToGram;
            
            $('#gold-18').text((gold24 * 0.75).toFixed(2));
            $('#gold-21').text((gold24 * 0.875).toFixed(2));
            $('#gold-buy').text((local_price * 0.98).toFixed(2));
            $('#gold-sell').text((local_price * 1.02).toFixed(2));
        } else {
            $('#silver-part').text((global_price / 31.1035).toFixed(3));
            $('#silver-buy').text((local_price * 0.98).toFixed(2));
            $('#silver-sell').text((local_price * 1.02).toFixed(2));
        }
        
        $(`#${type}-update`).text(`آخر تحديث: ${formatDate(date)}`);
    }

    function updateCurrencyRates(rates) {
        $('#usd-rate').text(`${rates.usd.toFixed(2)} د.ل`);
        $('#dxy').text(rates.dxy.toFixed(2));
        $('#eur').text(rates.eur.toFixed(3));
        updateMarketStatus(rates);
    }

    function updateGoldSilverRatio(prices) {
        const gold = prices.find(d => d.metal_type === "Gold");
        const silver = prices.find(d => d.metal_type === "Silver");
        
        if (gold && silver) {
            const ratio = gold.global_price / silver.global_price;
            const historicalAvg = 60;
            const percentage = ((ratio - historicalAvg) / historicalAvg * 100).toFixed(1);
            
            $('#ratio-global').text(ratio.toFixed(2));
            
            const barWidth = Math.min(Math.max(ratio / 100 * 100, 0), 100);
            $('#ratio-bar').css('width', `${barWidth}%`);
            updateRatioInsight(ratio, percentage);
        }
    }

    function updateRatioInsight(ratio, percentage) {
        const insight = $('#ratio-insight span');
        let message = '';
        
        if (ratio < 50) {
            message = 'الذهب رخيص نسبياً مقارنة بالفضة - فرصة شراء';
        } else if (ratio > 80) {
            message = 'الذهب غالٍ نسبياً - قد تكون الفضة فرصة أفضل';
        } else {
            message = 'النسبة قريبة من المتوسط التاريخي';
        }
        
        insight.text(`${message} (${percentage}%)`);
    }

    function updateMarketStatus(rates) {
        let status = 'مستقر';
        let statusClass = 'stable';
        
        if (rates.dxy > 92) {
            status = 'قوي (ضغط على المعادن)';
            statusClass = 'strong';
        } else if (rates.dxy < 88) {
            status = 'ضعيف (دعم للمعادن)';
            statusClass = 'weak';
        }
        
        $('#market-status')
            .text(status)
            .removeClass('stable strong weak')
            .addClass(statusClass);
    }

    function loadPriceHistory() {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Daily Metal Price",
                fields: ["date", "metal_type", "global_price", "local_price", "item"],
                order_by: "date desc",
                limit_page_length: 10
            },
            callback: function(r) {
                if (r.message && r.message.length > 0) {
                    const tbody = $('#history-body');
                    tbody.empty();
                    
                    const pricesWithChanges = calculatePriceChanges(r.message);
                    
                    pricesWithChanges.forEach((price, index) => {
                        const change = price.change || 0;
                        const changeClass = change >= 0 ? 'positive' : 'negative';
                        const changeIcon = change >= 0 ? '↑' : '↓';
                        const metalArabic = price.metal_type === 'Gold' ? 'ذهب' : 'فضة';
                        
                        tbody.append(`
                            <tr>
                                <td>${formatDate(price.date)}</td>
                                <td>
                                    <span class="badge ${price.metal_type === 'Gold' ? 'bg-warning' : 'bg-secondary'}">
                                        ${metalArabic}
                                    </span>
                                </td>
                                <td>${price.item || '--'}</td>
                                <td>$${price.global_price.toFixed(2)}</td>
                                <td>${price.local_price.toFixed(2)} د.ل</td>
                                <td class="${changeClass}">
                                    ${changeIcon} ${Math.abs(change).toFixed(2)}%
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary view-history-item" data-item="${price.item}">
                                        <i class="fa fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `);
                    });
                    
                    $('.view-history-item').on('click', function() {
                        const item = $(this).data('item');
                        frappe.set_route('Form', 'Daily Metal Price', item);
                    });
                }
            }
        });
    }

    function calculatePriceChanges(prices) {
        const goldPrices = prices.filter(p => p.metal_type === "Gold");
        const silverPrices = prices.filter(p => p.metal_type === "Silver");
        
        const result = [];
        
        if (goldPrices.length > 0) {
            goldPrices.forEach((price, index) => {
                const priceWithChange = { ...price };
                if (goldPrices.length > 1 && index < goldPrices.length - 1) {
                    const nextPrice = goldPrices[index + 1];
                    priceWithChange.change = ((price.global_price - nextPrice.global_price) / nextPrice.global_price * 100);
                } else {
                    priceWithChange.change = 0;
                }
                result.push(priceWithChange);
            });
        }
        
        if (silverPrices.length > 0) {
            silverPrices.forEach((price, index) => {
                const priceWithChange = { ...price };
                if (silverPrices.length > 1 && index < silverPrices.length - 1) {
                    const nextPrice = silverPrices[index + 1];
                    priceWithChange.change = ((price.global_price - nextPrice.global_price) / nextPrice.global_price * 100);
                } else {
                    priceWithChange.change = 0;
                }
                result.push(priceWithChange);
            });
        }
        
        return result.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
    }

    function refreshData() {
        frappe.show_progress('جاري تحديث البيانات', 0, 100);
        
        Promise.all([
            loadDashboardData(),
            loadPriceHistory()
        ]).then(() => {
            frappe.hide_progress();
            
            frappe.show_alert({
                message: '✅ تم تحديث البيانات بنجاح',
                indicator: 'green'
            }, 3);
            
            // تحديث إحصائيات الإجراءات السريعة إذا كان التبويب نشطاً
            if (activeTab === 'quick_actions') {
                loadQuickActionsStats();
            }
            
            // تحديث التحليلات إذا كان التبويب نشطاً
            if (activeTab === 'analytics') {
                loadAnalyticsData();
            }
        }).catch(error => {
            frappe.hide_progress();
            frappe.msgprint({
                title: 'خطأ في التحديث',
                message: 'فشل تحديث البيانات. الرجاء المحاولة مرة أخرى.'
            });
        });
    }

    function showLoadingState(show) {
        if (show) {
            $('.price, .ratio-item strong, .currency-item strong').addClass('loading-shimmer');
            $('.price').text('--');
        } else {
            $('.loading-shimmer').removeClass('loading-shimmer');
        }
    }

    function showErrorState() {
        frappe.msgprint({
            title: 'خطأ في التحميل',
            message: 'تعذر تحميل بيانات الأسعار. الرجاء التحقق من الاتصال بالإنترنت.'
        });
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};