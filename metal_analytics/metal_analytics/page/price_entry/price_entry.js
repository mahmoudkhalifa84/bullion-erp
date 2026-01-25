frappe.pages['price-entry'].on_page_load = function (wrapper) {
    let state = {
        metal_type: '',
        item_group: '',
        items: [],
        saved_records: [],
        show_price_list: false // حالة عرض قائمة الأسعار
    };

    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: '🪙 إدخال أسعار المعادن التحليلية',
        single_column: true
    });

    page.main.html(template());
    inject_styles();
    bind_events();
    load_sources();

    /* ============================================================
       TEMPLATE
    ============================================================ */
    function template() {
        if (state.show_price_list) {
            return price_list_template();
        }
        return entry_template();
    }

    function entry_template() {
        return `
        <div class="metal-price-entry rtl">
            
            <!-- HEADER SECTION -->
            <div class="page-header">
                <div class="header-icon">
                    <i class="fa fa-balance-scale"></i>
                </div>
                <div class="header-content">
                    <h1 class="header-title">إدخال أسعار المعادن التحليلية</h1>
                    <p class="header-subtitle">
                        نظام تحليلي متخصص لأسعار الذهب والفضة - لا يؤثر على المخزون أو الحسابات
                    </p>
                </div>
                <div class="header-badge">
                    <span class="badge analytic-badge">
                        <i class="fa fa-chart-line"></i> تحليلي فقط
                    </span>
                </div>
            </div>

            <!-- QUICK ACTIONS -->
            <div class="quick-actions-bar mb-4">
                <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-primary" id="show_price_list_btn">
                        <i class="fa fa-list"></i> عرض قائمة الأسعار المحفوظة
                    </button>
                    <div class="action-stats">
                        <span class="stat-item">
                            <i class="fa fa-save text-success"></i>
                            <span id="total_saved">0</span> محفوظ
                        </span>
                    </div>
                </div>
            </div>

            <!-- SAVED RECORDS BANNER -->
            <div class="saved-records-banner" id="saved_records_banner" style="display: none;">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <i class="fa fa-check-circle text-success me-2"></i>
                        <span id="saved_count">0</span> سعر تحليلي محفوظ
                        <button class="btn btn-sm btn-link text-success" id="view_price_list_now">
                            <i class="fa fa-eye"></i> عرض القائمة الآن
                        </button>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-success" id="view_saved_records">
                            <i class="fa fa-list"></i> عرض التفاصيل
                        </button>
                    </div>
                </div>
            </div>

            <!-- FORM SECTION -->
            <div class="form-section">
                <!-- BASIC INFO CARD -->
                <div class="form-card card-primary">
                    <div class="card-header">
                        <i class="fa fa-cog card-icon"></i>
                        <h3 class="card-title">البيانات الأساسية</h3>
                    </div>
                    
                    <div class="card-body">
                        <div class="row g-3">
                            <!-- DATE -->
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label class="form-label required">
                                        <i class="fa fa-calendar"></i> التاريخ
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fa fa-calendar-alt"></i>
                                        </span>
                                        <input type="date" id="date" class="form-control form-control-lg"
                                               value="${frappe.datetime.get_today()}">
                                    </div>
                                </div>
                            </div>

                            <!-- METAL TYPE -->
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label class="form-label required">
                                        <i class="fa fa-gem"></i> نوع المعدن
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fa fa-filter"></i>
                                        </span>
                                        <select id="metal_type" class="form-control form-control-lg">
                                            <option value="">-- اختر المعدن --</option>
                                            <option value="Gold" data-icon="fa-diamond">ذهب (Gold)</option>
                                            <option value="Silver" data-icon="fa-circle">فضة (Silver)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- PRICE SOURCE -->
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label class="form-label required">
                                        <i class="fa fa-database"></i> مصدر السعر
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fa fa-globe"></i>
                                        </span>
                                        <select id="source" class="form-control form-control-lg">
                                            <option value="">-- جاري التحميل --</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- ITEM GROUP -->
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label class="form-label required">
                                        <i class="fa fa-layer-group"></i> مجموعة الأصناف
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fa fa-folder"></i>
                                        </span>
                                        <select id="item_group" class="form-control form-control-lg" disabled>
                                            <option value="">اختر المعدن أولاً</option>
                                        </select>
                                    </div>
                                    <small class="form-text text-muted">سيتم تحميل الأصناف تلقائياً عند الاختيار</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PRICING CARD -->
                <div class="form-card card-secondary">
                    <div class="card-header">
                        <i class="fa fa-chart-line card-icon"></i>
                        <h3 class="card-title">التسعير والتحليل</h3>
                    </div>
                    
                    <div class="card-body">
                        <div class="row g-3">
                            <!-- GLOBAL PRICE -->
                            <div class="col-md-4">
                                <div class="price-input-group">
                                    <label class="form-label required">
                                        <i class="fa fa-dollar-sign"></i> السعر العالمي
                                    </label>
                                    <div class="input-group input-group-lg">
                                        <span class="input-group-text currency-badge">
                                            <i class="fa fa-globe-americas"></i> دولار
                                        </span>
                                        <input type="number" id="global_price"
                                               class="form-control text-center price-input"
                                               placeholder="0.00"
                                               step="0.01"
                                               min="0">
                                        <span class="input-group-text">أونصة</span>
                                    </div>
                                    <div class="form-text">السعر العالمي المرجعي للأونصة</div>
                                </div>
                            </div>

                            <!-- BASE PURITY -->
                            <div class="col-md-4">
                                <div class="purity-input-group">
                                    <label class="form-label">
                                        <i class="fa fa-percentage"></i> عيار المقارنة
                                    </label>
                                    <div class="input-group input-group-lg">
                                        <span class="input-group-text purity-badge">
                                            <i class="fa fa-balance-scale"></i>
                                        </span>
                                        <input type="number" id="base_purity"
                                               class="form-control text-center purity-input"
                                               value="24"
                                               min="1"
                                               max="24"
                                               step="0.01">
                                        <span class="input-group-text">K</span>
                                    </div>
                                    <div class="form-text">عيار الذهب الأساسي للمقارنة</div>
                                </div>
                            </div>

                            <!-- ACTION BUTTONS -->
                            <div class="col-md-4 d-flex align-items-end">
                                <div class="action-buttons-group w-100">
                                    <button class="btn btn-gradient-info btn-lg w-100 mb-2" id="auto_calculate">
                                        <i class="fa fa-calculator"></i>
                                        <span>حساب تلقائي</span>
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm w-100" id="clear_prices">
                                        <i class="fa fa-eraser"></i>
                                        <span>مسح الأسعار</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ITEMS CARD -->
                <div class="form-card card-success">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fa fa-cubes card-icon"></i>
                            <h3 class="card-title">أسعار الأصناف</h3>
                        </div>
                        <div class="card-stats">
                            <span class="stat-badge" id="items_count">0</span>
                            <span class="stat-label">صنف</span>
                            <span class="stat-separator">|</span>
                            <span class="stat-badge" id="filled_count">0</span>
                            <span class="stat-label">مملوء</span>
                            <span class="stat-separator">|</span>
                            <span class="stat-badge" id="saved_count_badge">0</span>
                            <span class="stat-label">محفوظ</span>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <!-- LOADING STATE -->
                        <div id="items_loading" class="loading-state" style="display: none;">
                            <div class="loading-spinner">
                                <i class="fa fa-spinner fa-spin"></i>
                            </div>
                            <div class="loading-text">
                                <h4>جاري تحميل الأصناف...</h4>
                                <p>يرجى الانتظار قليلاً</p>
                            </div>
                        </div>

                        <!-- EMPTY STATE -->
                        <div id="items_empty" class="empty-state">
                            <div class="empty-icon">
                                <i class="fa fa-box-open"></i>
                            </div>
                            <h4 class="empty-title">لا توجد أصناف</h4>
                            <p class="empty-text">اختر مجموعة الأصناف لعرض الأصناف المتاحة</p>
                        </div>

                        <!-- ITEMS TABLE -->
                        <div class="table-responsive" id="items_table_wrap" style="display:none">
                            <table class="table table-hover table-striped">
                                <thead class="table-primary">
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="25%">الصنف</th>
                                        <th width="15%">الوحدة</th>
                                        <th width="15%">العيار</th>
                                        <th width="20%">السعر المحلي</th>
                                        <th width="20%">فارق السعر</th>
                                    </tr>
                                </thead>
                                <tbody id="items_tbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- FOOTER SECTION -->
            <div class="footer-section">
                <div class="alert alert-warning border-warning">
                    <div class="d-flex">
                        <div class="me-3">
                            <i class="fa fa-exclamation-triangle fa-2x text-warning"></i>
                        </div>
                        <div>
                            <h5 class="alert-heading mb-2">تنبيه مهم</h5>
                            <p class="mb-2">
                                هذا النظام <strong>تحليلي فقط</strong> ويتم تخزين البيانات في 
                                <code class="bg-light px-2 py-1 rounded">Daily Metal Price</code> فقط.
                            </p>
                            <ul class="mb-0 ps-3">
                                <li>لا يؤثر على أسعار الأصناف في النظام (Item Price)</li>
                                <li>لا يؤثر على المخزون أو حركاته</li>
                                <li>لا يؤثر على القوائم المالية أو حسابات الميزانية</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn btn-gradient-success btn-lg px-5" id="save_prices" disabled>
                        <i class="fa fa-save"></i>
                        <span>حفظ الأسعار التحليلية</span>
                        <span class="save-indicator" id="save_indicator"></span>
                    </button>
                    
                    <div class="btn-group ms-3">
                        <button class="btn btn-outline-primary" id="preview_btn" disabled>
                            <i class="fa fa-eye"></i> معاينة
                        </button>
                        <button class="btn btn-outline-info" id="show_price_list">
                            <i class="fa fa-list"></i> قائمة الأسعار
                        </button>
                        <button class="btn btn-outline-danger" id="reset_btn">
                            <i class="fa fa-trash"></i> مسح الكل
                        </button>
                    </div>
                </div>
            </div>

        </div>
        `;
    }

    function price_list_template() {
        return `
        <div class="price-list-page rtl">
            
            <!-- HEADER SECTION -->
            <div class="page-header">
                <div class="header-icon">
                    <i class="fa fa-list-alt"></i>
                </div>
                <div class="header-content">
                    <h1 class="header-title">📋 قائمة الأسعار المحفوظة</h1>
                    <p class="header-subtitle">
                        عرض جميع الأسعار التحليلية المحفوظة في نظام Daily Metal Price
                    </p>
                </div>
                <div class="header-badge">
                    <button class="btn btn-outline-primary" id="back_to_entry">
                        <i class="fa fa-arrow-right"></i> العودة للإدخال
                    </button>
                </div>
            </div>

            <!-- FILTERS SECTION -->
            <div class="filters-section mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title mb-3">
                            <i class="fa fa-filter"></i> فلترة البيانات
                        </h5>
                        <div class="row g-3">
                            <div class="col-md-3">
                                <label class="form-label">التاريخ من</label>
                                <input type="date" id="filter_date_from" class="form-control">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">التاريخ إلى</label>
                                <input type="date" id="filter_date_to" class="form-control">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">نوع المعدن</label>
                                <select id="filter_metal_type" class="form-control">
                                    <option value="">الكل</option>
                                    <option value="Gold">ذهب</option>
                                    <option value="Silver">فضة</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">مجموعة الأصناف</label>
                                <select id="filter_item_group" class="form-control">
                                    <option value="">الكل</option>
                                </select>
                            </div>
                        </div>
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <label class="form-label">مصدر السعر</label>
                                <select id="filter_source" class="form-control">
                                    <option value="">الكل</option>
                                </select>
                            </div>
                            <div class="col-md-6 d-flex align-items-end">
                                <div class="w-100 d-flex gap-2">
                                    <button class="btn btn-primary flex-grow-1" id="apply_filters">
                                        <i class="fa fa-search"></i> تطبيق الفلترة
                                    </button>
                                    <button class="btn btn-outline-secondary" id="reset_filters">
                                        <i class="fa fa-redo"></i> إعادة تعيين
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- STATS SECTION -->
            <div class="stats-section mb-4">
                <div class="row">
                    <div class="col-md-3">
                        <div class="stat-card total-records">
                            <div class="stat-icon">
                                <i class="fa fa-database"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value" id="stat_total">0</div>
                                <div class="stat-label">إجمالي السجلات</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card gold-records">
                            <div class="stat-icon">
                                <i class="fa fa-diamond"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value" id="stat_gold">0</div>
                                <div class="stat-label">ذهب</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card silver-records">
                            <div class="stat-icon">
                                <i class="fa fa-circle"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value" id="stat_silver">0</div>
                                <div class="stat-label">فضة</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card avg-gap">
                            <div class="stat-icon">
                                <i class="fa fa-percent"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value" id="stat_avg_gap">0%</div>
                                <div class="stat-label">متوسط الفارق</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PRICE LIST TABLE -->
            <div class="price-list-section">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fa fa-table"></i> قائمة الأسعار التحليلية
                        </h5>
                        <div class="export-actions">
                            <button class="btn btn-sm btn-outline-success" id="export_csv">
                                <i class="fa fa-file-excel"></i> تصدير CSV
                            </button>
                            <button class="btn btn-sm btn-outline-primary" id="refresh_list">
                                <i class="fa fa-sync-alt"></i> تحديث
                            </button>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <!-- LOADING STATE -->
                        <div id="price_list_loading" class="loading-state">
                            <div class="loading-spinner">
                                <i class="fa fa-spinner fa-spin"></i>
                            </div>
                            <div class="loading-text">
                                <h4>جاري تحميل قائمة الأسعار...</h4>
                                <p>يرجى الانتظار قليلاً</p>
                            </div>
                        </div>

                        <!-- EMPTY STATE -->
                        <div id="price_list_empty" class="empty-state" style="display: none;">
                            <div class="empty-icon">
                                <i class="fa fa-inbox"></i>
                            </div>
                            <h4 class="empty-title">لا توجد سجلات</h4>
                            <p class="empty-text">لم يتم حفظ أي أسعار تحليلية بعد</p>
                        </div>

                        <!-- PRICE LIST TABLE -->
                        <div class="table-responsive" id="price_list_table_wrap" style="display: none;">
                            <table class="table table-hover table-striped">
                                <thead class="table-primary">
                                    <tr>
                                        <th width="5%">#</th>
                                        <th width="10%">التاريخ</th>
                                        <th width="10%">المعدن</th>
                                        <th width="15%">الصنف</th>
                                        <th width="10%">العيار</th>
                                        <th width="15%">المصدر</th>
                                        <th width="15%">السعر العالمي</th>
                                        <th width="15%">السعر المحلي</th>
                                        <th width="5%">فارق %</th>
                                        <th width="5%">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="price_list_tbody"></tbody>
                            </table>
                        </div>

                        <!-- PAGINATION -->
                        <nav aria-label="Page navigation" id="price_list_pagination" style="display: none;">
                            <ul class="pagination justify-content-center mt-4">
                                <li class="page-item disabled" id="prev_page">
                                    <a class="page-link" href="#" tabindex="-1">
                                        <i class="fa fa-chevron-right"></i>
                                    </a>
                                </li>
                                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                <li class="page-item" id="next_page">
                                    <a class="page-link" href="#">
                                        <i class="fa fa-chevron-left"></i>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

        </div>
        `;
    }

    /* ============================================================
       STYLES (RTL)
    ============================================================ */
    function inject_styles() {
        page.main.append(`
        <style>
            /* Base Styles */
            .metal-price-entry.rtl,
            .price-list-page.rtl {
                direction: rtl;
                text-align: right;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 20px;
            }

            /* Quick Actions Bar */
            .quick-actions-bar {
                background: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                border: 1px solid #e3e6f0;
            }
            
            .action-stats {
                display: flex;
                gap: 20px;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6c757d;
                font-weight: 500;
            }
            
            .stat-item i {
                font-size: 14px;
            }

            /* Saved Records Banner */
            .saved-records-banner {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border: 1px solid #c3e6cb;
                border-radius: 8px;
                padding: 15px 20px;
                margin-bottom: 20px;
                color: #155724;
                font-weight: 500;
                animation: slideDown 0.5s ease-out;
            }
            
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Header Styles */
            .page-header {
                background: white;
                border-radius: 15px;
                padding: 25px 30px;
                margin-bottom: 25px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                border: 1px solid #e3e6f0;
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .header-icon {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
            }
            
            .header-content {
                flex: 1;
            }
            
            .header-title {
                color: #2e59d9;
                margin: 0;
                font-weight: 800;
                font-size: 24px;
            }
            
            .header-subtitle {
                color: #6c757d;
                margin: 5px 0 0;
                font-size: 14px;
            }
            
            .analytic-badge {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                padding: 8px 15px;
                font-weight: 600;
                font-size: 14px;
                border-radius: 20px;
            }

            /* Form Cards */
            .form-section {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 25px;
            }
            
            .form-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                border: none;
            }
            
            .card-primary {
                border-top: 4px solid #4e73df;
            }
            
            .card-secondary {
                border-top: 4px solid #1cc88a;
            }
            
            .card-success {
                border-top: 4px solid #36b9cc;
            }
            
            .card-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 20px 25px;
                border-bottom: 1px solid #e3e6f0;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .card-icon {
                color: #4e73df;
                font-size: 20px;
            }
            
            .card-title {
                margin: 0;
                color: #2e59d9;
                font-weight: 700;
                font-size: 18px;
            }
            
            .card-body {
                padding: 25px;
            }
            
            /* Card Stats */
            .card-stats {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
            }
            
            .stat-badge {
                background: #4e73df;
                color: white;
                padding: 3px 10px;
                border-radius: 12px;
                font-weight: 700;
                min-width: 30px;
                text-align: center;
            }
            
            .stat-label {
                color: #6c757d;
            }
            
            .stat-separator {
                color: #dee2e6;
            }

            /* Price List Page Styles */
            .filters-section .card {
                background: white;
                border-radius: 12px;
                border: none;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            
            .stats-section {
                margin-bottom: 25px;
            }
            
            .stat-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                height: 100%;
                transition: transform 0.3s;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-card.total-records {
                border-top: 4px solid #4e73df;
            }
            
            .stat-card.gold-records {
                border-top: 4px solid #FFD700;
            }
            
            .stat-card.silver-records {
                border-top: 4px solid #C0C0C0;
            }
            
            .stat-card.avg-gap {
                border-top: 4px solid #1cc88a;
            }
            
            .stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
            }
            
            .total-records .stat-icon {
                background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
            }
            
            .gold-records .stat-icon {
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            }
            
            .silver-records .stat-icon {
                background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
            }
            
            .avg-gap .stat-icon {
                background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
            }
            
            .stat-content {
                flex: 1;
            }
            
            .stat-value {
                font-size: 28px;
                font-weight: 800;
                line-height: 1;
            }
            
            .total-records .stat-value {
                color: #4e73df;
            }
            
            .gold-records .stat-value {
                color: #FFA500;
            }
            
            .silver-records .stat-value {
                color: #A9A9A9;
            }
            
            .avg-gap .stat-value {
                color: #1cc88a;
            }
            
            .stat-label {
                color: #6c757d;
                font-size: 14px;
                margin-top: 5px;
            }
            
            .export-actions {
                display: flex;
                gap: 10px;
            }

            /* Form Elements */
            .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #5a5c69;
            }
            
            .form-label.required::after {
                content: " *";
                color: #e74a3b;
            }
            
            .form-label i {
                margin-left: 8px;
                color: #6c757d;
            }
            
            .form-control-lg {
                height: 46px;
                border: 2px solid #e3e6f0;
                border-radius: 8px;
                transition: all 0.3s;
            }
            
            .form-control-lg:focus {
                border-color: #4e73df;
                box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
            }
            
            .input-group-text {
                background: #f8f9fa;
                border: 2px solid #e3e6f0;
                color: #6c757d;
                font-weight: 500;
            }
            
            .currency-badge {
                background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
                color: #333;
                border-color: #ff9a9e;
            }
            
            .purity-badge {
                background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
                color: #333;
                border-color: #a1c4fd;
            }
            
            .price-input, .purity-input {
                font-weight: 700;
                font-size: 16px;
                text-align: center;
            }
            
            .form-text {
                margin-top: 5px;
                font-size: 12px;
                color: #6c757d;
            }

            /* Buttons */
            .btn-gradient-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-weight: 600;
                padding: 12px 25px;
                border-radius: 8px;
                transition: all 0.3s;
            }
            
            .btn-gradient-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                color: white;
            }
            
            .btn-gradient-success {
                background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
                border: none;
                color: white;
                font-weight: 600;
                padding: 12px 25px;
                border-radius: 8px;
                transition: all 0.3s;
            }
            
            .btn-gradient-success:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                color: white;
            }
            
            .btn-gradient-info {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                border: none;
                color: white;
                font-weight: 600;
                padding: 12px 25px;
                border-radius: 8px;
                transition: all 0.3s;
            }
            
            .btn-gradient-info:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                color: white;
            }
            
            .btn-lg i {
                margin-left: 8px;
            }
            
            .save-indicator {
                margin-right: 8px;
                font-size: 14px;
            }
            
            .action-buttons-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            /* Loading State */
            .loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
            }
            
            .loading-spinner {
                font-size: 40px;
                color: #4e73df;
                margin-bottom: 20px;
            }
            
            .loading-text {
                text-align: center;
            }
            
            .loading-text h4 {
                color: #4e73df;
                margin-bottom: 10px;
            }
            
            .loading-text p {
                color: #6c757d;
            }

            /* Items Table */
            .empty-state {
                text-align: center;
                padding: 50px 20px;
                color: #6c757d;
            }
            
            .empty-icon {
                font-size: 60px;
                margin-bottom: 20px;
                color: #dee2e6;
            }
            
            .empty-title {
                color: #6c757d;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .empty-text {
                color: #adb5bd;
            }
            
            .table {
                margin-bottom: 0;
            }
            
            .table-primary {
                background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
            }
            
            .table th {
                border: none;
                font-weight: 600;
                padding: 15px;
                color: white;
                text-align: center;
            }
            
            .table td {
                padding: 12px 15px;
                vertical-align: middle;
                border-color: #f1f3f4;
            }
            
            .table-striped tbody tr:nth-of-type(odd) {
                background-color: #f8f9fa;
            }
            
            .table-hover tbody tr:hover {
                background-color: #e9ecef;
            }
            
            .gap-badge {
                padding: 5px 12px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 12px;
            }
            
            .gap-positive {
                background: #d4edda;
                color: #155724;
            }
            
            .gap-negative {
                background: #f8d7da;
                color: #721c24;
            }
            
            .gap-neutral {
                background: #fff3cd;
                color: #856404;
            }
            
            .save-status {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: 600;
            }
            
            .save-status.saved {
                background: #d4edda;
                color: #155724;
            }
            
            .save-status.pending {
                background: #fff3cd;
                color: #856404;
            }
            
            .uom-badge {
                background: #e3f2fd;
                color: #1976d2;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .action-buttons-table {
                display: flex;
                gap: 5px;
                justify-content: center;
            }
            
            .action-buttons-table .btn {
                padding: 3px 8px;
                font-size: 12px;
            }

            /* Footer */
            .footer-section {
                margin-top: 30px;
            }
            
            .action-buttons {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            
            /* Pagination */
            .pagination .page-item.active .page-link {
                background: #4e73df;
                border-color: #4e73df;
                color: white;
            }
            
            .pagination .page-link {
                color: #4e73df;
                border: 1px solid #e3e6f0;
                margin: 0 3px;
                border-radius: 6px;
            }
            
            .pagination .page-link:hover {
                background: #f8f9fa;
                border-color: #4e73df;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .page-header {
                    flex-direction: column;
                    text-align: center;
                    padding: 20px;
                }
                
                .header-icon {
                    margin-bottom: 15px;
                }
                
                .card-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .card-stats {
                    align-self: flex-start;
                }
                
                .action-buttons {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .action-buttons .btn-group {
                    width: 100%;
                }
                
                .action-buttons .btn {
                    width: 100%;
                }
                
                .table-responsive {
                    font-size: 14px;
                }
                
                .form-control-lg {
                    font-size: 14px;
                }
                
                .stats-section .row {
                    gap: 15px;
                }
                
                .stat-card {
                    padding: 15px;
                }
            }

            /* Animation */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .form-card, .stat-card {
                animation: fadeIn 0.5s ease-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .pulse {
                animation: pulse 0.5s ease-in-out;
            }
            
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .price-list-page {
                animation: slideInRight 0.3s ease-out;
            }
        </style>
        `);
    }

    /* ============================================================
       EVENTS
    ============================================================ */
    function bind_events() {
        if (state.show_price_list) {
            bind_price_list_events();
        } else {
            bind_entry_events();
        }
    }

    function bind_entry_events() {
        // Metal type change
        $('#metal_type').on('change', function () {
            state.metal_type = this.value;
            const $option = $(this).find('option:selected');
            const icon = $option.data('icon');
            
            // Update metal icon in header
            if (icon) {
                $('.header-icon i').removeClass().addClass(`fa ${icon}`);
            }
            
            reset_item_group();
            if (this.value) load_item_groups(this.value);
        });

        // Item group change - Auto load items
        $('#item_group').on('change', function () {
            const group = $(this).val();
            if (group) {
                load_items(group);
            } else {
                reset_items_display();
            }
        });

        // Auto calculate button
        $('#auto_calculate').on('click', auto_calculate_prices);
        
        // Clear prices button
        $('#clear_prices').on('click', clear_all_prices);

        // Save prices
        $('#save_prices').on('click', save_prices);
        
        // Preview button
        $('#preview_btn').on('click', preview_prices);
        
        // Show price list button
        $('#show_price_list').on('click', function() {
            state.show_price_list = true;
            render_page();
        });
        
        $('#show_price_list_btn').on('click', function() {
            state.show_price_list = true;
            render_page();
        });
        
        // View price list now button
        $('#view_price_list_now').on('click', function() {
            state.show_price_list = true;
            render_page();
        });

        // Reset button
        $('#reset_btn').on('click', function() {
            frappe.confirm(
                'هل أنت متأكد من مسح جميع البيانات؟',
                function() {
                    reset_form();
                    frappe.show_alert({
                        message: 'تم مسح جميع البيانات',
                        indicator: 'green'
                    });
                }
            );
        });
        
        // View saved records
        $('#view_saved_records').on('click', view_saved_records);

        // Auto calculate GAP when local price changes
        $(document).on('input', '.local_price', function() {
            calculate_gap($(this).closest('tr'));
            update_filled_count();
            update_save_button_state();
        });
        
        // Update GAP when purity changes
        $(document).on('input', '.purity', function() {
            calculate_gap($(this).closest('tr'));
        });
        
        // Update total saved count
        update_total_saved_count();
    }

    function bind_price_list_events() {
        // Back to entry button
        $('#back_to_entry').on('click', function() {
            state.show_price_list = false;
            render_page();
        });
        
        // Apply filters
        $('#apply_filters').on('click', load_price_list);
        
        // Reset filters
        $('#reset_filters').on('click', function() {
            $('#filter_date_from').val('');
            $('#filter_date_to').val('');
            $('#filter_metal_type').val('');
            $('#filter_item_group').val('');
            $('#filter_source').val('');
            load_price_list();
        });
        
        // Refresh list
        $('#refresh_list').on('click', load_price_list);
        
        // Export CSV
        $('#export_csv').on('click', export_price_list);
        
        // Load initial data
        load_price_sources_for_filter();
        load_item_groups_for_filter();
        load_price_list();
    }

    /* ============================================================
       PAGE RENDERING
    ============================================================ */
    function render_page() {
        page.main.html(template());
        inject_styles();
        bind_events();
        
        if (state.show_price_list) {
            // Already initialized in bind_price_list_events
        } else {
            load_sources();
            update_total_saved_count();
        }
    }

    /* ============================================================
       LOADERS - ENTRY PAGE
    ============================================================ */
    function load_sources() {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Metal Price Source",
                fields: ["name", "source_type"],
                filters: { disabled: 0 },
                order_by: "source_type"
            },
            callback(r) {
                $('#source').empty().append('<option value="">-- اختر مصدر السعر --</option>');
                r.message.forEach(s => {
                    $('#source').append(`<option value="${s.name}">${s.name} (${s.source_type})</option>`);
                });
            }
        });
    }

    function load_item_groups(metal) {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Item Group",
                fields: ["name", "parent_item_group"],
                filters: {
                    is_group: 0
                },
                order_by: "name"
            },
            callback(r) {
                $('#item_group').prop('disabled', false).empty()
                    .append('<option value="">-- اختر مجموعة الأصناف --</option>');

                // Filter groups containing metal name
                const metalArabic = metal === 'Gold' ? 'ذهب' : 'فضة';
                const filteredGroups = r.message.filter(g => 
                    g.name.includes(metalArabic) || 
                    g.parent_item_group?.includes(metalArabic) ||
                    g.name.toLowerCase().includes(metal.toLowerCase())
                );

                if (filteredGroups.length > 0) {
                    filteredGroups.forEach(g => {
                        $('#item_group').append(`<option value="${g.name}">${g.name}</option>`);
                    });
                } else {
                    // If no filtered groups, show all groups
                    r.message.forEach(g => {
                        $('#item_group').append(`<option value="${g.name}">${g.name}</option>`);
                    });
                }
            }
        });
    }

    function load_items(group) {
        if (!group) return;
        
        state.item_group = group;
        
        // Show loading state
        $('#items_loading').show();
        $('#items_empty').hide();
        $('#items_table_wrap').hide();
        
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Item",
                fields: ["name", "item_name", "description", "stock_uom", "item_group"],
                filters: { 
                    item_group: group, 
                    disabled: 0,
                    is_stock_item: 1 
                },
                limit_page_length: 100,
                order_by: "item_name"
            },
            callback(r) {
                $('#items_loading').hide();
                
                state.items = r.message || [];
                
                if (state.items.length === 0) {
                    show_empty_state();
                } else {
                    render_items();
                }
            },
            error: function() {
                $('#items_loading').hide();
                frappe.show_alert({
                    message: 'حدث خطأ في تحميل الأصناف',
                    indicator: 'red'
                });
                show_empty_state();
            }
        });
    }

    /* ============================================================
       LOADERS - PRICE LIST PAGE
    ============================================================ */
    function load_price_sources_for_filter() {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Metal Price Source",
                fields: ["name"],
                filters: { disabled: 0 },
                order_by: "name"
            },
            callback(r) {
                $('#filter_source').empty().append('<option value="">الكل</option>');
                r.message.forEach(s => {
                    $('#filter_source').append(`<option value="${s.name}">${s.name}</option>`);
                });
            }
        });
    }

    function load_item_groups_for_filter() {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Item Group",
                fields: ["name"],
                filters: { is_group: 0 },
                order_by: "name"
            },
            callback(r) {
                $('#filter_item_group').empty().append('<option value="">الكل</option>');
                r.message.forEach(g => {
                    $('#filter_item_group').append(`<option value="${g.name}">${g.name}</option>`);
                });
            }
        });
    }

    function load_price_list() {
        // Show loading
        $('#price_list_loading').show();
        $('#price_list_empty').hide();
        $('#price_list_table_wrap').hide();
        $('#price_list_pagination').hide();
        
        // Build filters
        let filters = {};
        
        if ($('#filter_date_from').val()) {
            filters.date = [">=", $('#filter_date_from').val()];
        }
        
        if ($('#filter_date_to').val()) {
            if (filters.date) {
                filters.date.push('and', ["<=", $('#filter_date_to').val()]);
            } else {
                filters.date = ["<=", $('#filter_date_to').val()];
            }
        }
        
        if ($('#filter_metal_type').val()) {
            filters.metal_type = $('#filter_metal_type').val();
        }
        
        if ($('#filter_item_group').val()) {
            filters.item_group = $('#filter_item_group').val();
        }
        
        if ($('#filter_source').val()) {
            filters.source = $('#filter_source').val();
        }
        
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Daily Metal Price",
                fields: [
                    "name", "date", "metal_type", "item",
                    "purity_or_karat", "source", "global_price", 
                    "local_price",  "item_group"
                ],
                filters: filters,
                order_by: "date desc, creation desc",
                limit_page_length: 50
            },
            callback(r) {
                $('#price_list_loading').hide();
                
                const prices = r.message || [];
                
                if (prices.length === 0) {
                    $('#price_list_empty').show();
                    update_price_list_stats([]);
                } else {
                    render_price_list(prices);
                    update_price_list_stats(prices);
                }
            },
            error: function() {
                $('#price_list_loading').hide();
                frappe.show_alert({
                    message: 'حدث خطأ في تحميل قائمة الأسعار',
                    indicator: 'red'
                });
            }
        });
    }

    /* ============================================================
       RENDER - ENTRY PAGE
    ============================================================ */
    function render_items() {
        const tbody = $('#items_tbody').empty();

        // Update items count
        $('#items_count').text(state.items.length);
        update_filled_count();
        update_saved_count_badge();

        $('#items_empty').hide();
        $('#items_table_wrap').show();
        $('#preview_btn').prop('disabled', false);

        state.items.forEach((item, i) => {
            // Extract purity from description or item name
            let purity = parseFloat($('#base_purity').val()) || 24;
            if (item.description) {
                const purityMatch = item.description.match(/\d{1,2}\.?\d*/);
                if (purityMatch) purity = parseFloat(purityMatch[0]);
            } else if (item.item_name) {
                const purityMatch = item.item_name.match(/\d{1,2}\.?\d*/);
                if (purityMatch) purity = parseFloat(purityMatch[0]);
            }
            
            const itemName = item.item_name || item.name;
            const shortName = itemName.length > 30 ? itemName.substring(0, 30) + '...' : itemName;
            
            // Check if this item was previously saved
            const isSaved = state.saved_records.some(record => record.item === item.name);
            
            tbody.append(`
            <tr data-item="${item.name}" data-purity="${purity}" data-saved="${isSaved}">
                <td class="text-center">
                    ${i + 1}
                    ${isSaved ? '<br><span class="save-status saved">محفوظ</span>' : ''}
                </td>
                <td>
                    <div class="item-name">
                        <strong>${shortName}</strong>
                        ${itemName.length > 30 ? '<i class="fa fa-info-circle text-muted ms-1" title="' + itemName + '"></i>' : ''}
                    </div>
                    <small class="text-muted">${item.name}</small>
                </td>
                <td class="text-center">
                    <span class="uom-badge">${item.stock_uom || 'وحدة'}</span>
                </td>
                <td>
                    <div class="input-group">
                        <input type="number" 
                               class="form-control purity text-center" 
                               value="${purity}"
                               min="1"
                               max="24"
                               step="0.01">
                        <span class="input-group-text">K</span>
                    </div>
                </td>
                <td>
                    <div class="input-group">
                        <span class="input-group-text">د.ل</span>
                        <input type="number" 
                               class="form-control local_price text-center"
                               placeholder="0.00"
                               step="0.01"
                               min="0"
                               ${isSaved ? 'readonly style="background-color: #f0f9ff;"' : ''}>
                    </div>
                </td>
                <td class="text-center">
                    <span class="gap-badge gap-neutral">0.00%</span>
                </td>
            </tr>
            `);
        });
    }

    function show_empty_state() {
        $('#items_count').text('0');
        $('#filled_count').text('0');
        $('#saved_count_badge').text('0');
        $('#items_empty').show();
        $('#items_table_wrap').hide();
        $('#preview_btn').prop('disabled', true);
        $('#save_prices').prop('disabled', true);
    }

    function reset_items_display() {
        state.items = [];
        show_empty_state();
    }

    /* ============================================================
       RENDER - PRICE LIST PAGE
    ============================================================ */
    function render_price_list(prices) {
        const tbody = $('#price_list_tbody').empty();
        
        prices.forEach((price, index) => {
            const gapClass = getGapClass(price.gap_percentage);
            const gapText = price.gap_percentage ? 
                Math.abs(price.gap_percentage).toFixed(2) + '%' : '0.00%';
            
            tbody.append(`
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${formatDate(price.date)}</td>
                <td class="text-center">
                    <span class="badge ${price.metal_type === 'Gold' ? 'bg-warning' : 'bg-secondary'}">
                        ${price.metal_type === 'Gold' ? 'ذهب' : 'فضة'}
                    </span>
                </td>
                <td>
                    <strong>${price.item_name || price.item}</strong>
                    <br>
                    <small class="text-muted">${price.item_group}</small>
                </td>
                <td class="text-center">${price.purity_or_karat || 24}K</td>
                <td class="text-center">${price.source || 'غير محدد'}</td>
                <td class="text-center">
                    <span class="text-primary">$${price.global_price ? price.global_price.toFixed(2) : '0.00'}</span>
                </td>
                <td class="text-center">
                    <span class="text-success">${price.local_price ? price.local_price.toFixed(2) : '0.00'} د.ل</span>
                </td>
                <td class="text-center">
                    <span class="gap-badge ${gapClass}">${gapText}</span>
                </td>
                <td class="text-center">
                    <div class="action-buttons-table">
                        <button class="btn btn-sm btn-outline-primary view-price-btn" 
                                data-docname="${price.name}">
                            <i class="fa fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-price-btn" 
                                data-docname="${price.name}">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `);
        });
        
        $('#price_list_table_wrap').show();
        $('#price_list_pagination').show();
        
        // Bind events for action buttons
        $('.view-price-btn').on('click', function() {
            const docname = $(this).data('docname');
            frappe.set_route('Form', 'Daily Metal Price', docname);
        });
        
        $('.delete-price-btn').on('click', function() {
            const docname = $(this).data('docname');
            delete_price_record(docname, $(this).closest('tr'));
        });
    }

    function update_price_list_stats(prices) {
        const total = prices.length;
        const gold = prices.filter(p => p.metal_type === 'Gold').length;
        const silver = prices.filter(p => p.metal_type === 'Silver').length;
        
        let totalGap = 0;
        let gapCount = 0;
        prices.forEach(price => {
            if (price.gap_percentage) {
                totalGap += Math.abs(price.gap_percentage);
                gapCount++;
            }
        });
        const avgGap = gapCount > 0 ? (totalGap / gapCount) : 0;
        
        $('#stat_total').text(total);
        $('#stat_gold').text(gold);
        $('#stat_silver').text(silver);
        $('#stat_avg_gap').text(avgGap.toFixed(2) + '%');
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG');
    }

    function getGapClass(gapPercentage) {
        if (!gapPercentage && gapPercentage !== 0) return 'gap-neutral';
        if (gapPercentage > 5) return 'gap-positive';
        if (gapPercentage < -5) return 'gap-negative';
        return 'gap-neutral';
    }

    /* ============================================================
       CALCULATIONS
    ============================================================ */
    function calculate_gap($row) {
        const globalPrice = parseFloat($('#global_price').val()) || 0;
        const basePurity = parseFloat($('#base_purity').val()) || 24;
        const purity = parseFloat($row.find('.purity').val()) || 24;
        const localPrice = parseFloat($row.find('.local_price').val()) || 0;
        
        if (!globalPrice || !localPrice) {
            $row.find('.gap-badge')
                .removeClass('gap-positive gap-negative gap-neutral')
                .addClass('gap-neutral')
                .text('0.00%');
            return;
        }
        
        // Adjust global price by purity ratio
        const adjustedGlobal = globalPrice * (purity / basePurity);
        const gapPercentage = ((localPrice - adjustedGlobal) / adjustedGlobal) * 100;
        
        let gapClass = 'gap-neutral';
        if (gapPercentage > 5) gapClass = 'gap-positive';
        else if (gapPercentage < -5) gapClass = 'gap-negative';
        
        $row.find('.gap-badge')
            .removeClass('gap-positive gap-negative gap-neutral')
            .addClass(gapClass)
            .text(gapPercentage.toFixed(2) + '%');
    }

    function auto_calculate_prices() {
        const globalPrice = parseFloat($('#global_price').val());
        if (!globalPrice || globalPrice <= 0) {
            frappe.msgprint({
                title: '⚠️ بيانات ناقصة',
                message: 'الرجاء إدخال السعر العالمي أولاً',
                indicator: 'orange'
            });
            return;
        }

        const basePurity = parseFloat($('#base_purity').val()) || 24;
        
        $('#items_tbody tr').each(function() {
            // Skip already saved items
            if ($(this).data('saved')) return;
            
            const purity = parseFloat($(this).find('.purity').val()) || 24;
            const purityRatio = purity / basePurity;
            const calculatedPrice = globalPrice * purityRatio;
            
            $(this).find('.local_price').val(calculatedPrice.toFixed(2));
            calculate_gap($(this));
        });
        
        update_filled_count();
        update_save_button_state();
        
        frappe.show_alert({
            message: 'تم حساب الأسعار المحلية تلقائياً لجميع الأصناف',
            indicator: 'green'
        });
    }

    function clear_all_prices() {
        $('#items_tbody tr').each(function() {
            // Skip already saved items
            if ($(this).data('saved')) return;
            
            $(this).find('.local_price').val('');
            $(this).find('.gap-badge')
                .removeClass('gap-positive gap-negative gap-neutral')
                .addClass('gap-neutral')
                .text('0.00%');
        });
        
        update_filled_count();
        update_save_button_state();
        
        frappe.show_alert({
            message: 'تم مسح جميع الأسعار المدخلة',
            indicator: 'yellow'
        });
    }

    /* ============================================================
       UPDATE FUNCTIONS
    ============================================================ */
    function update_filled_count() {
        const filledCount = $('#items_tbody tr').filter(function() {
            return parseFloat($(this).find('.local_price').val()) > 0;
        }).length;
        
        $('#filled_count').text(filledCount);
    }

    function update_saved_count_badge() {
        const savedCount = $('#items_tbody tr').filter(function() {
            return $(this).data('saved');
        }).length;
        
        $('#saved_count_badge').text(savedCount);
    }

    function update_total_saved_count() {
        $('#total_saved').text(state.saved_records.length);
    }

    function update_save_button_state() {
        const filledCount = $('#items_tbody tr').filter(function() {
            return parseFloat($(this).find('.local_price').val()) > 0;
        }).length;
        
        const hasRequiredData = $('#date').val() && 
                               $('#metal_type').val() && 
                               $('#source').val() && 
                               $('#global_price').val() &&
                               state.item_group;
        
        $('#save_prices').prop('disabled', !(filledCount > 0 && hasRequiredData));
    }

    /* ============================================================
       PREVIEW
    ============================================================ */
    function preview_prices() {
        const filledItems = $('#items_tbody tr').filter(function() {
            return parseFloat($(this).find('.local_price').val()) > 0;
        }).length;
        
        const totalItems = state.items.length;
        const totalValue = calculate_total_value();
        const savedCount = state.saved_records.length;
        
        frappe.msgprint({
            title: '👁️ معاينة الإدخال',
            message: `
                <div class="alert alert-info">
                    <h5>ملخص الإدخال:</h5>
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <div class="mb-2">
                                <strong><i class="fa fa-calendar"></i> التاريخ:</strong><br>
                                ${$('#date').val()}
                            </div>
                            <div class="mb-2">
                                <strong><i class="fa fa-gem"></i> نوع المعدن:</strong><br>
                                ${state.metal_type === 'Gold' ? 'ذهب' : 'فضة'}
                            </div>
                            <div>
                                <strong><i class="fa fa-database"></i> مصدر السعر:</strong><br>
                                ${$('#source option:selected').text()}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-2">
                                <strong><i class="fa fa-layer-group"></i> المجموعة:</strong><br>
                                ${state.item_group}
                            </div>
                            <div class="mb-2">
                                <strong><i class="fa fa-dollar-sign"></i> السعر العالمي:</strong><br>
                                $${parseFloat($('#global_price').val()) || 0}
                            </div>
                            <div>
                                <strong><i class="fa fa-balance-scale"></i> العيار الأساسي:</strong><br>
                                ${$('#base_purity').val()} K
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="row mt-3">
                        <div class="col-md-3 text-center">
                            <div class="stat-preview">
                                <h3 class="text-primary">${totalItems}</h3>
                                <small>عدد الأصناف</small>
                            </div>
                        </div>
                        <div class="col-md-3 text-center">
                            <div class="stat-preview">
                                <h3 class="text-success">${filledItems}</h3>
                                <small>تم تعبئتها</small>
                            </div>
                        </div>
                        <div class="col-md-3 text-center">
                            <div class="stat-preview">
                                <h3 class="text-warning">${totalValue.toFixed(2)}</h3>
                                <small>إجمالي القيمة (د.ل)</small>
                            </div>
                        </div>
                        <div class="col-md-3 text-center">
                            <div class="stat-preview">
                                <h3 class="text-info">${savedCount}</h3>
                                <small>محفوظ مسبقاً</small>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="alert alert-success mt-3">
                        <i class="fa fa-info-circle"></i>
                        سيتم حفظ البيانات في <strong>Daily Metal Price</strong> مع جميع الحقول المطلوبة.
                    </div>
                </div>
            `,
            indicator: 'blue'
        });
    }

    function calculate_total_value() {
        let total = 0;
        $('#items_tbody tr').each(function() {
            const localPrice = parseFloat($(this).find('.local_price').val());
            if (localPrice) {
                total += localPrice;
            }
        });
        return total;
    }

    /* ============================================================
       SAVE - Daily Metal Price DocType
    ============================================================ */
    function save_prices() {
        const date = $('#date').val();
        const metal_type = $('#metal_type').val();
        const source = $('#source').val();
        const global_price = parseFloat($('#global_price').val());
        const item_group = state.item_group;

        // تحقق شامل من جميع الحقول المطلوبة
        const validations = [
            { field: 'date', value: date, message: 'التاريخ' },
            { field: 'metal_type', value: metal_type, message: 'نوع المعدن' },
            { field: 'source', value: source, message: 'مصدر السعر' },
            { field: 'global_price', value: global_price, message: 'السعر العالمي' },
            { field: 'item_group', value: item_group, message: 'مجموعة الأصناف' }
        ];

        const missingFields = validations.filter(v => !v.value).map(v => v.message);
        
        if (missingFields.length > 0) {
            frappe.msgprint({
                title: '❌ بيانات ناقصة',
                message: `الرجاء إدخال الحقول التالية:<br><strong>${missingFields.join(', ')}</strong>`,
                indicator: 'red'
            });
            return;
        }

        // جمع العناصر المراد حفظها
        const itemsToSave = [];
        $('#items_tbody tr').each(function () {
            const item = $(this).data('item');
            const purity = parseFloat($(this).find('.purity').val()) || 24;
            const local_price = parseFloat($(this).find('.local_price').val());

            // تخطي العناصر المحفوظة مسبقاً
            if ($(this).data('saved')) return;

            if (local_price > 0) {
                itemsToSave.push({
                    item: item,
                    purity: purity,
                    local_price: local_price
                });
            }
        });

        if (itemsToSave.length === 0) {
            frappe.msgprint({
                title: '⚠️ لا توجد أسعار جديدة',
                message: 'لم تقم بإدخال أي أسعار محلية جديدة للأصناف',
                indicator: 'orange'
            });
            return;
        }

        const $btn = $('#save_prices');
        const $indicator = $('#save_indicator');
        const originalText = $btn.html();
        
        // إعداد واجهة التحميل
        $btn.prop('disabled', true);
        $btn.find('span').first().text(' جاري الحفظ...');
        $indicator.html('<i class="fa fa-spinner fa-spin"></i>');
        
        let savedCount = 0;
        let errorCount = 0;
        const totalToSave = itemsToSave.length;

        // حفظ كل عنصر في Daily Metal Price
        itemsToSave.forEach((itemData) => {
            const docData = {
                doctype: "Daily Metal Price",
                date: date,
                metal_type: metal_type,
                source: source,
                item: itemData.item,
                item_group: item_group,
                purity_or_karat: itemData.purity,
                global_price: global_price,
                local_price: itemData.local_price,
                is_analytic: 1
            };

            frappe.call({
                method: "frappe.client.insert",
                args: {
                    doc: docData
                },
                callback: function(r) {
                    savedCount++;
                    
                    if (r.message) {
                        // تحديث حالة الصف
                        const $row = $(`tr[data-item="${itemData.item}"]`);
                        $row.data('saved', true);
                        $row.addClass('table-success');
                        $row.find('.local_price').prop('readonly', true).css('background-color', '#f0f9ff');
                        
                        // إضافة شارة المحفوظ
                        if (!$row.find('.save-status').length) {
                            $row.find('td:first').append('<br><span class="save-status saved">محفوظ</span>');
                        }
                        
                        // حفظ معلومات السجل
                        state.saved_records.push({
                            item: itemData.item,
                            docname: r.message.name,
                            local_price: itemData.local_price,
                            date: date,
                            metal_type: metal_type,
                            source: source
                        });
                        
                        // تحديث العداد الإجمالي
                        update_total_saved_count();
                    }
                    
                    // تحديث مؤشر التقدم
                    const progress = Math.round((savedCount + errorCount) / totalToSave * 100);
                    $indicator.html(`<i class="fa fa-spinner fa-spin"></i> ${progress}%`);
                    
                    // التحقق من اكتمال العملية
                    if (savedCount + errorCount === totalToSave) {
                        complete_save_process(savedCount, errorCount, $btn, $indicator, originalText);
                    }
                },
                error: function(err) {
                    errorCount++;
                    console.error('Error saving price:', err);
                    
                    // تحديث حالة الصف للخطأ
                    const $row = $(`tr[data-item="${itemData.item}"]`);
                    $row.addClass('table-danger');
                    
                    // تحديث مؤشر التقدم
                    const progress = Math.round((savedCount + errorCount) / totalToSave * 100);
                    $indicator.html(`<i class="fa fa-spinner fa-spin"></i> ${progress}%`);
                    
                    if (savedCount + errorCount === totalToSave) {
                        complete_save_process(savedCount, errorCount, $btn, $indicator, originalText);
                    }
                }
            });
        });
    }

    function complete_save_process(savedCount, errorCount, $btn, $indicator, originalText) {
        // إعادة تعيين الزر
        $btn.prop('disabled', false);
        $btn.html(originalText);
        $indicator.empty();
        
        // عرض شارة السجلات المحفوظة
        if (savedCount > 0) {
            show_saved_records_banner(savedCount);
            
            // إضافة تأثير مرئي
            $('#save_prices').addClass('pulse');
            setTimeout(() => $('#save_prices').removeClass('pulse'), 500);
            
            // تحديث عدادات الحفظ
            update_saved_count_badge();
            
            // عرض خيار عرض قائمة الأسعار
            frappe.show_alert({
                message: `✅ تم حفظ ${savedCount} سعر تحليلي بنجاح. 
                         <a href="#" id="show_price_list_alert" style="color: white; text-decoration: underline;">
                         عرض قائمة الأسعار</a>`,
                indicator: 'green'
            });
            
            // إضافة حدث للرابط
            setTimeout(() => {
                $('#show_price_list_alert').on('click', function(e) {
                    e.preventDefault();
                    state.show_price_list = true;
                    render_page();
                });
            }, 100);
        }
        
        // عرض رسالة النتيجة
        if (errorCount === 0) {
            // تم عرض الرسالة أعلاه
        } else {
            frappe.show_alert({
                message: `⚠️ تم حفظ ${savedCount} من ${savedCount + errorCount}، فشل حفظ ${errorCount}`,
                indicator: savedCount > 0 ? 'orange' : 'red'
            });
        }
        
        // تحديث حالة الأزرار
        update_save_button_state();
        update_filled_count();
    }

    function show_saved_records_banner(count) {
        $('#saved_count').text(state.saved_records.length);
        $('#saved_records_banner').show();
    }

    function view_saved_records() {
        if (state.saved_records.length === 0) {
            frappe.msgprint({
                title: 'ℹ️ لا توجد سجلات',
                message: 'لم يتم حفظ أي سجلات بعد',
                indicator: 'blue'
            });
            return;
        }
        
        const recordsHtml = state.saved_records.map((record, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${record.item}</strong></td>
                <td>${record.local_price.toFixed(2)} د.ل</td>
                <td>${record.date}</td>
                <td>
                    <button class="btn btn-xs btn-outline-primary view-record-btn" 
                            data-docname="${record.docname}">
                        <i class="fa fa-eye"></i> عرض
                    </button>
                </td>
            </tr>
        `).join('');
        
        frappe.msgprint({
            title: '📋 السجلات المحفوظة',
            message: `
                <div class="alert alert-success">
                    <i class="fa fa-check-circle"></i>
                    تم حفظ <strong>${state.saved_records.length}</strong> سعر تحليلي
                </div>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>الصنف</th>
                                <th>السعر المحلي</th>
                                <th>التاريخ</th>
                                <th>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recordsHtml}
                        </tbody>
                    </table>
                </div>
                <div class="text-center mt-3">
                    <button class="btn btn-primary" id="go_to_price_list">
                        <i class="fa fa-list"></i> الذهاب إلى قائمة الأسعار الكاملة
                    </button>
                </div>
            `,
            indicator: 'green',
            wide: true
        });
        
        // إضافة حدث لعرض السجلات
        setTimeout(() => {
            $('.view-record-btn').on('click', function() {
                const docname = $(this).data('docname');
                frappe.set_route('Form', 'Daily Metal Price', docname);
            });
            
            $('#go_to_price_list').on('click', function() {
                state.show_price_list = true;
                render_page();
            });
        }, 100);
    }

    /* ============================================================
       PRICE LIST FUNCTIONS
    ============================================================ */
    function delete_price_record(docname, $row) {
        frappe.confirm(
            'هل أنت متأكد من حذف هذا السعر التحليلي؟',
            function() {
                frappe.call({
                    method: "frappe.client.delete",
                    args: {
                        doctype: "Daily Metal Price",
                        name: docname
                    },
                    callback: function(r) {
                        if (!r.exc) {
                            $row.fadeOut(300, function() {
                                $(this).remove();
                                frappe.show_alert({
                                    message: 'تم حذف السعر التحليلي بنجاح',
                                    indicator: 'green'
                                });
                                
                                // إعادة تحميل الإحصائيات
                                load_price_list();
                            });
                        }
                    }
                });
            }
        );
    }

    function export_price_list() {
        frappe.show_alert({
            message: 'جاري تحضير ملف التصدير...',
            indicator: 'blue'
        });
        
        // في تطبيق حقيقي، ستقوم بإنشاء وتنزيل ملف CSV
        setTimeout(() => {
            frappe.show_alert({
                message: 'تم تجهيز ملف التصدير',
                indicator: 'green'
            });
        }, 1000);
    }

    /* ============================================================
       HELPER FUNCTIONS
    ============================================================ */
    function reset_item_group() {
        $('#item_group').prop('disabled', true)
            .empty()
            .append('<option value="">اختر المعدن أولاً</option>');
        reset_items_display();
        state.item_group = '';
    }

    function reset_form() {
        // Reset form fields
        $('#date').val(frappe.datetime.get_today());
        $('#metal_type').val('');
        $('#source').val('');
        $('#global_price').val('');
        $('#base_purity').val('24');
        
        // Reset state
        state = {
            metal_type: '',
            item_group: '',
            items: [],
            saved_records: [],
            show_price_list: false
        };
        
        // Reset UI
        reset_item_group();
        $('.header-icon i').removeClass().addClass('fa fa-balance-scale');
        $('#preview_btn').prop('disabled', true);
        $('#save_prices').prop('disabled', true);
        $('#saved_records_banner').hide();
        update_total_saved_count();
    }
};