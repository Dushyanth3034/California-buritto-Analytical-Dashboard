const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const DB_DATE_EXPR = 'order_date';
const queryCache = new Map();
const inflightQueries = new Map();

async function cachedQuery(sql, params) {
  const key = sql + '::' + JSON.stringify(params || []);
  
  // Check memory cache (5 min TTL)
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  
  // Check inflight queries
  if (inflightQueries.has(key)) {
    return inflightQueries.get(key);
  }
  
  const promise = pool.query(sql, params)
    .then(([rows]) => {
      queryCache.set(key, {
        data: rows,
        timestamp: Date.now()
      });
      return rows;
    })
    .finally(() => {
      inflightQueries.delete(key);
    });
    
  inflightQueries.set(key, promise);
  return promise;
}

// Helper to parse multi-select filter parameters
function parseFilterParam(param) {
  if (!param) return [];
  if (Array.isArray(param)) return param;
  if (typeof param === 'string') {
    return param.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// Helper to construct dynamic SQL WHERE clause and parameter array
function buildWhereClause(query) {
  const conditions = [];
  const params = [];

  // Date range filters
  if (query.startDate) {
    conditions.push(`${DB_DATE_EXPR} >= ?`);
    params.push(`${query.startDate} 00:00:00`);
  }
  if (query.endDate) {
    conditions.push(`${DB_DATE_EXPR} <= ?`);
    params.push(`${query.endDate} 23:59:59`);
  }

  // Multi-select categorical filters
  const filterFields = [
    { paramName: 'brand', dbField: 'brand' },
    { paramName: 'outlet', dbField: 'outlet_name' },
    { paramName: 'group', dbField: '`group`' },
    { paramName: 'settlement', dbField: 'settlement' },
    { paramName: 'orderType', dbField: 'order_type' }
  ];

  for (const { paramName, dbField } of filterFields) {
    const vals = parseFilterParam(query[paramName]);
    if (vals.length > 0) {
      conditions.push(`${dbField} IN (${vals.map(() => '?').join(',')})`);
      params.push(...vals);
    }
  }

  // Global Dashboard search (Item name matching)
  if (query.itemSearch) {
    conditions.push('item LIKE ?');
    params.push(`%${query.itemSearch}%`);
  }

  // Table-specific search (multi-column matching)
  if (query.search) {
    conditions.push('(billno LIKE ? OR item LIKE ? OR outlet_name LIKE ? OR brand LIKE ? OR settlement LIKE ?)');
    const searchVal = `%${query.search}%`;
    params.push(searchVal, searchVal, searchVal, searchVal, searchVal);
  }

  const whereString = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereString, params };
}

let cachedFilterOptions = null;

// 1. GET /api/filter-options
router.get('/filter-options', async (req, res) => {
  try {
    if (cachedFilterOptions) {
      return res.json(cachedFilterOptions);
    }
    const brands = await cachedQuery('SELECT DISTINCT brand AS Brand FROM sales WHERE brand != "" ORDER BY brand');
    const outlets = await cachedQuery('SELECT DISTINCT outlet_name AS Outlet_Name FROM sales WHERE outlet_name != "" ORDER BY outlet_name');
    const groups = await cachedQuery('SELECT DISTINCT `group` AS Group_Name FROM sales WHERE `group` != "" ORDER BY `group`');
    const settlements = await cachedQuery('SELECT DISTINCT settlement AS Settlement FROM sales WHERE settlement != "" ORDER BY settlement');
    const orderTypes = await cachedQuery('SELECT DISTINCT order_type AS Order_Type FROM sales WHERE order_type != "" ORDER BY order_type');
    
    // Get min and max dates directly from the database formatted as strings to avoid timezone shift
    const dates = await cachedQuery(`SELECT DATE_FORMAT(MIN(${DB_DATE_EXPR}), "%Y-%m-%d") AS minDate, DATE_FORMAT(MAX(${DB_DATE_EXPR}), "%Y-%m-%d") AS maxDate FROM sales`);

    cachedFilterOptions = {
      brands: brands.map(row => row.Brand),
      outlets: outlets.map(row => row.Outlet_Name),
      groups: groups.map(row => row.Group_Name),
      settlements: settlements.map(row => row.Settlement),
      orderTypes: orderTypes.map(row => row.Order_Type),
      dateRange: {
        min: dates[0].minDate || '',
        max: dates[0].maxDate || ''
      }
    };

    res.json(cachedFilterOptions);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 2. GET /api/kpis
router.get('/kpis', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    
    const query = `
      SELECT 
        COALESCE(SUM(price * quantity), 0) AS totalRevenue,
        COALESCE(SUM(quantity), 0) AS totalQuantity,
        COUNT(DISTINCT billno) AS totalOrders,
        COUNT(DISTINCT brand) AS totalBrands,
        COUNT(DISTINCT outlet_name) AS totalOutlets
      FROM sales
      ${whereString}
    `;
    
    const rows = await cachedQuery(query, params);
    const kpis = rows[0];
    
    const totalRevenue = parseFloat(kpis.totalRevenue);
    const totalOrders = parseInt(kpis.totalOrders, 10);
    const totalQuantity = parseInt(kpis.totalQuantity, 10);
    const totalBrands = parseInt(kpis.totalBrands, 10);
    const totalOutlets = parseInt(kpis.totalOutlets, 10);
    const averageOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

    res.json({
      totalRevenue,
      totalQuantity,
      totalOrders,
      totalBrands,
      totalOutlets,
      averageOrderValue
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 3. GET /api/revenue-by-brand
router.get('/revenue-by-brand', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    const query = `
      SELECT brand AS Brand, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY brand
      ORDER BY revenue DESC
    `;
    const rows = await cachedQuery(query, params);
    res.json(rows.map(r => ({ brand: r.Brand, revenue: parseFloat(r.revenue) })));
  } catch (error) {
    console.error('Error fetching revenue by brand:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 4. GET /api/revenue-by-outlet
router.get('/revenue-by-outlet', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    const query = `
      SELECT outlet_name AS outlet, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY outlet_name
      ORDER BY revenue DESC
    `;
    const rows = await cachedQuery(query, params);
    res.json(rows.map(r => ({ outlet: r.outlet, revenue: parseFloat(r.revenue) })));
  } catch (error) {
    console.error('Error fetching revenue by outlet:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 5. GET /api/revenue-by-category
router.get('/revenue-by-category', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    const query = `
      SELECT \`group\` AS category, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY \`group\`
      ORDER BY revenue DESC
    `;
    const rows = await cachedQuery(query, params);
    res.json(rows.map(r => ({ category: r.category, revenue: parseFloat(r.revenue) })));
  } catch (error) {
    console.error('Error fetching revenue by category:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 6. GET /api/revenue-by-settlement
router.get('/revenue-by-settlement', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    const query = `
      SELECT settlement AS settlement, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY settlement
      ORDER BY revenue DESC
    `;
    const rows = await cachedQuery(query, params);
    res.json(rows.map(r => ({ settlement: r.settlement, revenue: parseFloat(r.revenue) })));
  } catch (error) {
    console.error('Error fetching revenue by settlement:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 7. GET /api/revenue-by-order-type
router.get('/revenue-by-order-type', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    const query = `
      SELECT order_type AS orderType, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY order_type
      ORDER BY revenue DESC
    `;
    const rows = await cachedQuery(query, params);
    res.json(rows.map(r => ({ orderType: r.orderType, revenue: parseFloat(r.revenue) })));
  } catch (error) {
    console.error('Error fetching revenue by order type:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 8. GET /api/top-products
router.get('/top-products', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    const query = `
      SELECT item AS item, COALESCE(SUM(quantity), 0) AS quantity, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY item
      ORDER BY quantity DESC
      LIMIT 10
    `;
    const rows = await cachedQuery(query, params);
    res.json(rows.map(r => ({
      item: r.item,
      quantity: parseInt(r.quantity, 10),
      revenue: parseFloat(r.revenue)
    })));
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 9. GET /api/monthly-revenue
router.get('/monthly-revenue', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    const query = `
      SELECT DATE_FORMAT(${DB_DATE_EXPR}, '%Y-%m') AS month, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY month
      ORDER BY month ASC
    `;
    const rows = await cachedQuery(query, params);
    res.json(rows.map(r => ({ month: r.month, revenue: parseFloat(r.revenue) })));
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 10. GET /api/revenue-trend
router.get('/revenue-trend', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    const query = `
      SELECT DATE_FORMAT(${DB_DATE_EXPR}, '%Y-%m-%d') AS date, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY date
      ORDER BY date ASC
    `;
    const rows = await cachedQuery(query, params);
    console.log("Revenue Trend Rows:", rows.length);
    res.json(rows.map(r => ({ date: r.date, revenue: parseFloat(r.revenue) })));
  } catch (error) {
    console.error('Error fetching daily revenue trend:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 11. GET /api/sales - Server-side pagination, sorting, search, filtering
router.get('/sales', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    // Validate sorting parameters to prevent SQL injection
    const allowedSortFields = [
      'BillNo', 'Outlet_Name', 'Order_Datetime', 'Group_Name', 
      'Order_Type', 'Item', 'Price', 'Quantity', 'Settlement', 'Brand', 'Revenue'
    ];
    
    // Map allowed sort fields to lowercase database columns
    const dbSortFieldMap = {
      'BillNo': 'billno',
      'Outlet_Name': 'outlet_name',
      'Order_Datetime': DB_DATE_EXPR,
      'Group_Name': '`group`',
      'Order_Type': 'order_type',
      'Item': 'item',
      'Price': 'price',
      'Quantity': 'quantity',
      'Settlement': 'settlement',
      'Brand': 'brand',
      'Revenue': '(price * quantity)'
    };
    
    const sortByParam = req.query.sortBy || 'Order_Datetime';
    const sortBy = allowedSortFields.includes(sortByParam) ? sortByParam : 'Order_Datetime';
    
    const sortOrderParam = String(req.query.sortOrder).toUpperCase();
    const sortOrder = sortOrderParam === 'ASC' || sortOrderParam === 'DESC' ? sortOrderParam : 'DESC';

    const { whereString, params } = buildWhereClause(req.query);

    // SQL query to fetch paginated rows.
    const orderExpression = dbSortFieldMap[sortBy] || DB_DATE_EXPR;

    const dataQuery = `
      SELECT 
        billno AS BillNo, 
        outlet_name AS Outlet_Name, 
        order_datetime AS Order_Datetime, 
        \`group\` AS \`Group\`, 
        order_type AS Order_Type, 
        item AS Item, 
        price AS Price, 
        quantity AS Quantity, 
        settlement AS Settlement, 
        brand AS Brand, 
        (price * quantity) AS Revenue
      FROM sales
      ${whereString}
      ORDER BY ${orderExpression} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    // Append limit and offset parameters
    const dataParams = [...params, limit, offset];
    
    // Fetch records and count in parallel
    const countQuery = `SELECT COUNT(*) AS total FROM sales ${whereString}`;
    
    const [rows, countRows] = await Promise.all([
      cachedQuery(dataQuery, dataParams),
      cachedQuery(countQuery, params)
    ]);

    const totalCount = countRows[0] ? countRows[0].total : 0;

    res.json({
      data: rows.map(r => ({
        ...r,
        Price: parseFloat(r.Price),
        Quantity: parseInt(r.Quantity, 10),
        Revenue: parseFloat(r.Revenue)
      })),
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching transactional records:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 12. GET /api/dashboard-summary - Consolidated dashboard KPIs and charts
router.get('/dashboard-summary', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);

    // Define all database queries to execute in parallel
    const kpisQuery = `
      SELECT 
        COALESCE(SUM(price * quantity), 0) AS totalRevenue,
        COALESCE(SUM(quantity), 0) AS totalQuantity,
        COUNT(DISTINCT billno) AS totalOrders,
        COUNT(DISTINCT brand) AS totalBrands,
        COUNT(DISTINCT outlet_name) AS totalOutlets
      FROM sales
      ${whereString}
    `;

    const trendQuery = `
      SELECT DATE_FORMAT(${DB_DATE_EXPR}, '%Y-%m-%d') AS date, COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY date
      ORDER BY date ASC
    `;

    const brandQuery = `
      SELECT 
        brand AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue,
        COUNT(DISTINCT billno) AS orders,
        COALESCE(SUM(quantity), 0) AS quantity
      FROM sales
      ${whereString}
      GROUP BY brand
      ORDER BY revenue DESC
    `;

    const outletQuery = `
      SELECT 
        outlet_name AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY outlet_name
      ORDER BY revenue DESC
    `;

    const categoryQuery = `
      SELECT 
        \`group\` AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue,
        COALESCE(SUM(quantity), 0) AS quantity
      FROM sales
      ${whereString}
      GROUP BY \`group\`
      ORDER BY revenue DESC
    `;

    const productQuery = `
      SELECT 
        item AS name, 
        COALESCE(SUM(quantity), 0) AS quantity, 
        COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY item
      ORDER BY quantity DESC
      LIMIT 10
    `;

    const settlementQuery = `
      SELECT 
        settlement AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue,
        COUNT(*) AS count
      FROM sales
      ${whereString}
      GROUP BY settlement
      ORDER BY count DESC
    `;

    const orderTypeQuery = `
      SELECT 
        order_type AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue,
        COUNT(*) AS count
      FROM sales
      ${whereString}
      GROUP BY order_type
      ORDER BY revenue DESC
    `;

    const [
      kpiRows,
      trendRows,
      brandRows,
      outletRows,
      categoryRows,
      productRows,
      settlementRows,
      orderTypeRows
    ] = await Promise.all([
      cachedQuery(kpisQuery, params),
      cachedQuery(trendQuery, params),
      cachedQuery(brandQuery, params),
      cachedQuery(outletQuery, params),
      cachedQuery(categoryQuery, params),
      cachedQuery(productQuery, params),
      cachedQuery(settlementQuery, params),
      cachedQuery(orderTypeQuery, params)
    ]);

    console.log("Revenue Trend Rows (Summary):", trendRows.length);

    const kpisRaw = kpiRows[0];
    const totalRevenue = parseFloat(kpisRaw.totalRevenue);
    const totalOrders = parseInt(kpisRaw.totalOrders, 10);
    const totalQuantitySold = parseInt(kpisRaw.totalQuantity, 10);
    const totalBrands = parseInt(kpisRaw.totalBrands, 10);
    const totalOutlets = parseInt(kpisRaw.totalOutlets, 10);
    const avgOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

    // Find top-performing elements to populate the advanced insights panel.
    const bestPerformingBrand = brandRows[0] ? brandRows[0].name : 'N/A';
    const topSellingCategory = categoryRows[0] ? categoryRows[0].name : 'N/A';
    
    // Find settlement with the highest transaction count (not necessarily revenue)
    let mostUsedSettlement = 'N/A';
    if (settlementRows.length > 0) {
      const sortedByCount = [...settlementRows].sort((a, b) => b.count - a.count);
      mostUsedSettlement = sortedByCount[0].name;
    }

    res.json({
      kpis: {
        totalRevenue,
        totalOrders,
        totalQuantitySold,
        totalBrands,
        totalOutlets,
        avgOrderValue,
        bestPerformingBrand,
        topSellingCategory,
        mostUsedSettlement
      },
      charts: {
        trendData: trendRows.map(r => ({ date: r.date, revenue: parseFloat(r.revenue) })),
        brandRevenueData: brandRows.map(r => ({ name: r.name, revenue: parseFloat(r.revenue), orders: parseInt(r.orders, 10), quantity: parseInt(r.quantity, 10) })),
        outletRevenueData: outletRows.map(r => ({ name: r.name, revenue: parseFloat(r.revenue) })),
        categoryRevenueData: categoryRows.map(r => ({ name: r.name, revenue: parseFloat(r.revenue), quantity: parseInt(r.quantity, 10) })),
        productData: productRows.map(r => ({ name: r.name, quantity: parseInt(r.quantity, 10), revenue: parseFloat(r.revenue) })),
        settlementData: settlementRows.map(r => ({ name: r.name, value: parseFloat(r.revenue), count: parseInt(r.count, 10) })),
        orderTypeData: orderTypeRows.map(r => ({ name: r.name, value: parseFloat(r.revenue), count: parseInt(r.count, 10) }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Database summary query failed' });
  }
});

// 13. GET /api/ai-insights - Dynamic rules-based business insights
router.get('/ai-insights', async (req, res) => {
  try {
    const { whereString, params } = buildWhereClause(req.query);
    
    const kpisQuery = `
      SELECT 
        COALESCE(SUM(price * quantity), 0) AS totalRevenue,
        COALESCE(SUM(quantity), 0) AS totalQuantity,
        COUNT(DISTINCT billno) AS totalOrders,
        COUNT(DISTINCT brand) AS totalBrands,
        COUNT(DISTINCT outlet_name) AS totalOutlets
      FROM sales
      ${whereString}
    `;
    const brandQuery = `
      SELECT 
        brand AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue,
        COUNT(DISTINCT billno) AS orders,
        COALESCE(SUM(quantity), 0) AS quantity
      FROM sales
      ${whereString}
      GROUP BY brand
      ORDER BY revenue DESC
    `;
    const outletQuery = `
      SELECT 
        outlet_name AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY outlet_name
      ORDER BY revenue DESC
    `;
    const categoryQuery = `
      SELECT 
        \`group\` AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue,
        COALESCE(SUM(quantity), 0) AS quantity
      FROM sales
      ${whereString}
      GROUP BY \`group\`
      ORDER BY revenue DESC
    `;
    const productQuery = `
      SELECT 
        item AS name, 
        COALESCE(SUM(quantity), 0) AS quantity, 
        COALESCE(SUM(price * quantity), 0) AS revenue
      FROM sales
      ${whereString}
      GROUP BY item
      ORDER BY quantity DESC
      LIMIT 10
    `;
    const orderTypeQuery = `
      SELECT 
        order_type AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue,
        COUNT(*) AS count
      FROM sales
      ${whereString}
      GROUP BY order_type
      ORDER BY revenue DESC
    `;
    const settlementQuery = `
      SELECT 
        settlement AS name, 
        COALESCE(SUM(price * quantity), 0) AS revenue,
        COUNT(*) AS count
      FROM sales
      ${whereString}
      GROUP BY settlement
      ORDER BY count DESC
    `;

    const [
      kpiRows,
      brandRows,
      outletRows,
      categoryRows,
      productRows,
      orderTypeRows,
      settlementRows
    ] = await Promise.all([
      cachedQuery(kpisQuery, params),
      cachedQuery(brandQuery, params),
      cachedQuery(outletQuery, params),
      cachedQuery(categoryQuery, params),
      cachedQuery(productQuery, params),
      cachedQuery(orderTypeQuery, params),
      cachedQuery(settlementQuery, params)
    ]);

    const totalRevenue = parseFloat(kpiRows[0].totalRevenue);
    const insights = [];

    if (totalRevenue > 0) {
      // 1. Brand Insight
      if (brandRows.length > 0) {
        const topBrand = brandRows[0];
        const share = (parseFloat(topBrand.revenue) / totalRevenue) * 100;
        insights.push(`Brand "${topBrand.name}" contributes ${share.toFixed(1)}% of total revenue ($${parseFloat(topBrand.revenue).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}).`);
      }

      // 2. Order Type Insight
      if (orderTypeRows.length > 0) {
        const topOrderType = orderTypeRows[0];
        insights.push(`Order channel "${topOrderType.name}" generates the highest revenue ($${parseFloat(topOrderType.revenue).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}).`);
      }

      // 3. Product Insight
      if (productRows.length > 0) {
        const topProduct = productRows[0];
        insights.push(`"${topProduct.name}" is the top-selling product with ${parseInt(topProduct.quantity, 10).toLocaleString()} units sold.`);
        
        if (productRows.length >= 3) {
          const top3Revenue = productRows.slice(0, 3).reduce((sum, p) => sum + parseFloat(p.revenue), 0);
          const top3Share = (top3Revenue / totalRevenue) * 100;
          insights.push(`The top 3 menu products contribute ${top3Share.toFixed(1)}% of total gross sales.`);
        }
      }

      // 4. Outlet Insight
      if (outletRows.length > 0) {
        const topOutlet = outletRows[0];
        const lowestOutlet = outletRows[outletRows.length - 1];
        
        if (outletRows.length >= 2) {
          const secondOutlet = outletRows[1];
          const topOutletRev = parseFloat(topOutlet.revenue);
          const secondOutletRev = parseFloat(secondOutlet.revenue);
          if (secondOutletRev > 0) {
            const diff = ((topOutletRev - secondOutletRev) / secondOutletRev) * 100;
            insights.push(`Outlet "${topOutlet.name}" outperforms "${secondOutlet.name}" by ${diff.toFixed(1)}% in net sales.`);
          }
        }
        
        if (topOutlet.name !== lowestOutlet.name) {
          insights.push(`Outlet "${lowestOutlet.name}" shows the lowest revenue ($${parseFloat(lowestOutlet.revenue).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}).`);
        }
      }

      // 5. Category Insight
      if (categoryRows.length > 0) {
        const topCategory = categoryRows[0];
        const categoryShare = (parseFloat(topCategory.revenue) / totalRevenue) * 100;
        insights.push(`Menu category "${topCategory.name}" accounts for the largest share of sales (${categoryShare.toFixed(1)}%).`);
      }

      // 6. Settlement Insight
      if (settlementRows.length > 0) {
        const topSettlement = settlementRows[0];
        insights.push(`"${topSettlement.name}" is the most preferred payment method with ${parseInt(topSettlement.count, 10).toLocaleString()} transactions.`);
      }

      // 7. Dynamic recommendations
      if (productRows.length > 0) {
        insights.push(`Recommendation: Increase promotions and inventory for top-selling product "${productRows[0].name}" to maximize sales volume.`);
      }
      if (outletRows.length >= 2) {
        const lowestOutlet = outletRows[outletRows.length - 1];
        insights.push(`Recommendation: Improve performance and launch local marketing for underperforming outlet "${lowestOutlet.name}".`);
      }
      if (orderTypeRows.length > 0) {
        insights.push(`Recommendation: Focus marketing campaigns and delivery speed optimizations on the highest-revenue channel "${orderTypeRows[0].name}".`);
      }
    } else {
      insights.push("No transaction records found for the selected filter criteria.");
    }

    res.json({ insights });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ error: 'Database insights query failed' });
  }
});

module.exports = router;
