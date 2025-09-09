import pool from "../../config/db.js";

export const getLeadAndDealStats = async (req, res) => {
  try {
    // Lead Status
    const [leadStatus] = await pool.query(`
      SELECT s.status AS lead_status,
             COALESCE(COUNT(l.id), 0) AS total
      FROM (
          SELECT 'New' AS status
          UNION ALL SELECT 'Contacted'
          UNION ALL SELECT 'Qualified'
          UNION ALL SELECT 'Lost'
      ) s
      LEFT JOIN leads l ON l.status = s.status
      GROUP BY s.status
      ORDER BY FIELD(s.status, 'New', 'Contacted', 'Qualified', 'Lost')
    `);

    // Lead Source
    const [leadSource] = await pool.query(`
      SELECT src.source AS lead_source,
             COALESCE(COUNT(l.id), 0) AS total
      FROM (
          SELECT 'Website' AS source
          UNION ALL SELECT 'LinkedIn'
          UNION ALL SELECT 'Referral'
          UNION ALL SELECT 'Cold Call'
          UNION ALL SELECT 'Event'
      ) src
      LEFT JOIN leads l ON l.lead_source = src.source
      GROUP BY src.source
      ORDER BY FIELD(src.source, 'Website', 'LinkedIn', 'Referral', 'Cold Call', 'Event')
    `);

    // Deal Stages (Removed Prospecting and renamed Closing -> Closed)
    const [dealStages] = await pool.query(`
      SELECT st.stage AS deal_stage,
             COALESCE(COUNT(d.id), 0) AS total
      FROM (
          SELECT 'Meeting' AS stage
          UNION ALL SELECT 'Qualification'
          UNION ALL SELECT 'Proposal'
          UNION ALL SELECT 'Closing'
          UNION ALL SELECT 'Lost'
      ) st
      LEFT JOIN opportunities d ON d.stage = st.stage
      GROUP BY st.stage
      ORDER BY FIELD(st.stage, 'Meeting', 'Qualification', 'Proposal', 'Closing', 'Lost')
    `);

    // Total Leads
    const [totalLeadsResult] = await pool.query(`
      SELECT COUNT(*) AS total_leads FROM leads
    `);

    // Total Deals
    const [totalDealsResult] = await pool.query(`
      SELECT COUNT(*) AS total_deals FROM opportunities
    `);

    res.status(200).json({
      lead_status: leadStatus,
      lead_source: leadSource,
      deal_stages: dealStages,
      total_leads: totalLeadsResult[0]?.total_leads || 0,
      total_deals: totalDealsResult[0]?.total_deals || 0
    });
  } catch (error) {
    console.error("Error fetching lead/deal stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// export const getSalesforecast = async (req, res) => {
//   try {
//     // Get totals and forecast
//     const [summary] = await pool.query(`
//       SELECT
//         COALESCE(SUM(deal_value), 0) AS total_deal_value,
//         COALESCE(SUM(CASE WHEN stage = 'Closing' THEN deal_value ELSE 0 END), 0) AS total_in_closing,
//         COALESCE(SUM(CASE 
//             WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) 
//             AND YEAR(created_at) = YEAR(CURRENT_DATE()) 
//             THEN deal_value ELSE 0 END), 0) AS achieved_this_month,
//         COALESCE(SUM(deal_value * (probability / 100)), 0) AS forecasted_revenue
//       FROM opportunities;
//     `);

//     // Get monthly trend (group by month-year)
//     const [monthlyTrend] = await pool.query(`
//       SELECT 
//         DATE_FORMAT(created_at, '%Y-%m') AS month,
//         COALESCE(SUM(deal_value), 0) AS total_deal_value,
//          COALESCE(SUM(CASE WHEN stage = 'Closing' THEN deal_value ELSE 0 END), 0) AS total_in_closing,
//         COALESCE(SUM(deal_value * (probability / 100)), 0) AS forecasted_revenue
//       FROM opportunities
//       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
//       ORDER BY month ASC;
//     `);

//     return res.status(200).json({
//       message: "Performance dashboard data",
//       data: {
//         totals: summary[0],
//         monthly_trend: monthlyTrend
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Error fetching performance dashboard",
//       error: error.message
//     });
//   }
// };


// export const getSalesforecast = async (req, res) => {
//   try {
//     // Stage-wise totals
//     const [stageWiseTotals] = await pool.query(`
//       SELECT 
//         stage,
//         COALESCE(SUM(deal_value), 0) AS total_value,
//         COALESCE(SUM(deal_value * (probability / 100)), 0) AS forecasted_value
//       FROM opportunities
//       GROUP BY stage;
//     `);

//     // Summary totals
//     const [summary] = await pool.query(`
//       SELECT
//         COALESCE(SUM(deal_value), 0) AS total_deal_value,
//         COALESCE(SUM(CASE WHEN stage = 'Closing' THEN deal_value ELSE 0 END), 0) AS total_in_closing,
//         COALESCE(SUM(CASE 
//             WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) 
//             AND YEAR(created_at) = YEAR(CURRENT_DATE()) 
//             THEN deal_value ELSE 0 END), 0) AS achieved_this_month,
//         COALESCE(SUM(deal_value * (probability / 100)), 0) AS forecasted_revenue
//       FROM opportunities;
//     `);

//     // Monthly trend (all deals and forecast)
//     const [monthlyTrend] = await pool.query(`
//       SELECT 
//         DATE_FORMAT(created_at, '%Y-%m') AS month,
//         COALESCE(SUM(deal_value), 0) AS total_deal_value,
//         COALESCE(SUM(deal_value * (probability / 100)), 0) AS forecasted_revenue
//       FROM opportunities
//       WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
//       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
//       ORDER BY month ASC;
//     `);

//     // Achieved per month (closed/won deals)
//     // Assuming you track won deals via stage='Closing' or status='Won'.
//     // Adjust stage/status filter as per your schema.
//     const [achievedMonthly] = await pool.query(`
//       SELECT 
//         DATE_FORMAT(created_at, '%Y-%m') AS month,
//         COALESCE(SUM(deal_value), 0) AS achieved_value
//       FROM opportunities
//       WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
//         AND stage = 'Closing'
//       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
//       ORDER BY month ASC;
//     `);

//     return res.status(200).json({
//       message: "Performance dashboard data",
//       data: {
//         stage_wise: stageWiseTotals,
//         totals: summary[0],
//         monthly_trend: monthlyTrend,
//         achieved_monthly: achievedMonthly
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Error fetching performance dashboard",
//       error: error.message
//     });
//   }
// };

export const getSalesforecast  = async (req, res) => {
  try {
    // Fetch all opportunities
    const [rows] = await pool.query(`
      SELECT 
        id,
        deal_value,
        probability,
        stage,
        created_at,
        expected_close_date
      FROM opportunities
    `);

    if (!rows.length) {
      return res.status(200).json({
        total_deal_value: 0,
        closing_total: 0,
        achieved_current_month: 0,
        probability_forecast: 0,
        stage_wise_totals: {},
        monthly_achieved: {}
      });
    }

    // Helper for month names
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    let totalDealValue = 0;
    let closingTotal = 0;
    let achievedCurrentMonth = 0;
    let probabilityForecast = 0;

    const stageWiseTotals = {
      Qualification: 0,
      Meeting: 0,
      Proposal: 0,
      Closing: 0
    };

    // Month-wise achieved totals
    const monthlyAchieved = {};
    months.forEach(m => monthlyAchieved[m] = 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    rows.forEach((opp) => {
      const dealValue = parseFloat(opp.deal_value) || 0;
      const probability = parseFloat(opp.probability) || 0;
      const stage = opp.stage || "";
      const createdDate = new Date(opp.created_at);

      totalDealValue += dealValue;

      // Probability-weighted forecast
      probabilityForecast += (dealValue * (probability / 100));

      // Stage-wise totals
      if (stageWiseTotals.hasOwnProperty(stage)) {
        stageWiseTotals[stage] += dealValue;
      }

      // Closing stage total
      if (stage === "Closing") {
        closingTotal += dealValue;
      }

      // Achieved current month
      if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
        achievedCurrentMonth += dealValue;
      }

      // Month-wise achieved totals
      const monthIndex = createdDate.getMonth();
      if (createdDate.getFullYear() === currentYear) {
        monthlyAchieved[months[monthIndex]] += dealValue;
      }
    });

    return res.status(200).json({
      total_deal_value: totalDealValue,
      closing_total: closingTotal,
      achieved_current_month: closingTotal,
      probability_forecast: probabilityForecast,
      stage_wise_totals: stageWiseTotals,
      monthly_achieved: monthlyAchieved
    });
  } catch (error) {
    console.error("Error fetching opportunities dashboard:", error);
    return res.status(500).json({
      message: "Error fetching opportunities dashboard",
      error: error.message
    });
  }
};