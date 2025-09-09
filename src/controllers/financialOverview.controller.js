import pool from "../config/db.js";

export const financialOverview = async (req, res) => {
  try {
    // Revenue data grouped by month filtered by stage 'Closing'
    const [revenueData] = await pool.query(`
      SELECT 
        SUM(deal_value) AS total_revenue,
        DATE_FORMAT(expected_close_date, '%Y-%m') AS month,
        COUNT(id) AS closed_deals
      FROM opportunities
      WHERE stage = 'Closing'
      GROUP BY month
      ORDER BY month DESC;
    `);

   const [upcomingRevenue] = await pool.query(`
  SELECT 
    IFNULL(SUM(deal_value), 0) AS upcoming_revenue,
    COUNT(id) AS upcoming_deals_count
  FROM opportunities
  WHERE stage != 'Closing'
    AND expected_close_date > NOW();
`);


    // Top 5 deals with owners' names joined from leads table
    const [topDeals] = await pool.query(`
      SELECT 
        l.name AS deal_name,
        o.deal_value,
        l.owner AS owner_id,
        u.name AS owner_name
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LEFT JOIN users u ON l.owner = u.id
      WHERE o.stage = 'Qualification'
      ORDER BY o.deal_value DESC
      LIMIT 5;
    `);

    // Pipeline data - sum and count of open deals (exclude 'Closing' and assumed 'Lost' stage)
    const [pipelineData] = await pool.query(`
      SELECT 
        SUM(deal_value) AS pipeline_value,
        COUNT(id) AS open_deals
      FROM opportunities
      WHERE stage NOT IN ('Closing', 'Lost');
    `);

    // Deal metrics - win rate and average deal size based on deal_value and stage
    const [dealMetrics] = await pool.query(`
      SELECT 
        (SUM(CASE WHEN stage = 'Closing' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS win_rate,
        AVG(deal_value) AS average_deal_size
      FROM opportunities;
    `);

    // Average KPI progress filtered by 'Finance' category from kpis table
    // const [kpiData] = await pool.query(`
    //   SELECT 
    //     AVG(progress) AS avg_kpi_progress
    //   FROM kpis
    //   WHERE category = 'Finance';
    // `);

    // OKR completion rate filtered on type 'Finance'
    const [okrData] = await pool.query(`
      SELECT 
        (SUM(progress)/COUNT(*)) AS okr_completion_rate
      FROM okrs
      WHERE type = 'Finance';
    `);

    res.json({
      status: true,
      data: {
        revenueData,
        topDeals,
        pipelineData: pipelineData[0],
        dealMetrics: dealMetrics[0],
        upcomingRevenue: upcomingRevenue[0],
        // kpiData: kpiData[0],
        okrData: okrData[0],
      }
    });

  } catch (error) {
    console.error("Error fetching finance overview:", error);
    res.status(500).json({ 
      status: false, 
      message: "Error fetching finance overview", 
      error: error.message 
    });
  }
};


export const getFinancialRatios = async (req, res) => {
  try {
    // Lead to deal conversion rate
    const [[crmRatio]] = await pool.query(`
      SELECT 
        CASE WHEN COUNT(l.id) = 0 THEN 0 
        ELSE (COUNT(d.id) / COUNT(l.id)) * 100 END AS lead_to_deal_conversion_rate
      FROM leads l
      LEFT JOIN opportunities d ON l.id = d.lead_id
    `);

    // Average deal value for closed deals
    const [[avgDeal]] = await pool.query(`
      SELECT 
        COALESCE(AVG(deal_value), 0) AS average_deal_value
      FROM opportunities
      WHERE status = 'Closing' OR status = 'Closed-Won'
    `);

    // Total pipeline value (sum of open deals)
    const [[pipelineValue]] = await pool.query(`
      SELECT 
        COALESCE(SUM(deal_value), 0) AS total_pipeline_value
      FROM opportunities
      WHERE status IN ('Qualification', 'Meeting', 'Closing')
    `);

    // Closed revenue (sum of won deals)
    const [[closedRevenue]] = await pool.query(`
      SELECT 
        COALESCE(SUM(deal_value), 0) AS closed_won_revenue
      FROM opportunities
      WHERE status = 'Closing'
    `);

    // OKR completion rate
    const [[okrRate]] = await pool.query(`
      SELECT 
        CASE WHEN COUNT(*) = 0 THEN 0 
        ELSE (SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) / COUNT(*)) * 100 END AS okr_completion_rate
      FROM okrs
    `);

    // KPI average progress
    const [[kpiProgress]] = await pool.query(`
      SELECT 
        COALESCE(AVG(progress), 0) AS average_kpi_progress
      FROM kpis
    `);

    res.json({
      status: true,
      data: {
        lead_to_deal_conversion_rate: parseFloat(crmRatio.lead_to_deal_conversion_rate).toFixed(2),
        average_deal_value: parseFloat(avgDeal.average_deal_value).toFixed(2),
        total_pipeline_value: parseFloat(pipelineValue.total_pipeline_value).toFixed(2),
        closed_won_revenue: parseFloat(closedRevenue.closed_won_revenue).toFixed(2),
        okr_completion_rate: parseFloat(okrRate.okr_completion_rate).toFixed(2),
        average_kpi_progress: parseFloat(kpiProgress.average_kpi_progress).toFixed(2)
      }
    });
  } catch (error) {
    console.error("Error fetching financial ratios:", error);
    res.status(500).json({ 
      status: false, 
      message: "Error fetching ratios", 
      error: error.message 
    });
  }
};
