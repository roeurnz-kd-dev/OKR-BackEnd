// export const getAllReports = async (req, res) => {
//   try {
//     // 🔹 1. Liquidity Report
//     const [totalResult] = await pool.query(`
//       SELECT COUNT(*) AS total_leads 
//       FROM leads
//     `);

//     const [respondedResult] = await pool.query(`
//       SELECT COUNT(*) AS responded_leads 
//       FROM leads 
//       WHERE status IN ('Contacted', 'Qualified', 'Lost')
//     `);

//     const [closingResult] = await pool.query(`
//       SELECT 
//         COUNT(*) AS total_closing,
//         AVG(DATEDIFF(o.updated_at, l.created_at)) AS avg_cycle_days
//       FROM opportunities o
//       JOIN leads l ON o.lead_id = l.id
//       WHERE o.stage = 'Closing'
//     `);

//     const totalClosing = closingResult[0].total_closing;
//     const avgCycleDays = closingResult[0].avg_cycle_days;
//     const conversionSpeedRatio = totalClosing / avgCycleDays;
//     const totalLeads = totalResult[0].total_leads;
//     const respondedLeads = respondedResult[0].responded_leads;

//     const LeadResponseRatio = {
//       totalLeads,
//       respondedLeads,
//       leadResponseRatio: totalLeads > 0
//         ? `${((respondedLeads / totalLeads) * 100).toFixed(2)}%`
//         : "0%"
//     };

//     const ConversionSpeedRatio = {
//       totalClosing,
//       avgCycleDays: Number(parseFloat(avgCycleDays).toFixed(2)),
//       conversionSpeedRatio: parseFloat(conversionSpeedRatio.toFixed(2))
//     };

//     // 🔹 2. Efficiency Report
//     const [effRows] = await pool.query(`
//       WITH okr_avg AS (
//         SELECT 
//           kr.okr_id, 
//           AVG(kr.progress) AS avg_progress
//         FROM key_results kr
//         GROUP BY kr.okr_id
//       )
//       SELECT 
//           COUNT(DISTINCT o.id) AS total_okrs,
//           COUNT(DISTINCT completed_okrs.okr_id) AS completed_okrs,
//           (COUNT(DISTINCT completed_okrs.okr_id) / COUNT(DISTINCT o.id)) * 100 AS okr_completion_ratio,

//           (SELECT COUNT(*) FROM key_results) AS total_key_results,
//           (SELECT COUNT(*) FROM key_results WHERE progress = 100) AS completed_key_results,
//           ((SELECT COUNT(*) FROM key_results WHERE progress = 100) / (SELECT COUNT(*) FROM key_results)) * 100 AS kr_completion_ratio,

//           (SELECT COUNT(*) FROM okr_avg WHERE avg_progress >= 60) AS ontrack_okrs
//       FROM okrs o
//       LEFT JOIN (
//           SELECT kr.okr_id
//           FROM key_results kr
//           GROUP BY kr.okr_id
//           HAVING MIN(kr.progress) = 100
//       ) AS completed_okrs ON o.id = completed_okrs.okr_id
//     `);

//     const OKRCompletionRatio = {
//       totalOKRs: effRows[0].total_okrs,
//       completedOKRs: effRows[0].completed_okrs,
//       CompletionRatio: Number(parseFloat(effRows[0].okr_completion_ratio).toFixed(2))
//     };

//     const KeyResultsProgressRatio = {
//       totalKeyResults: effRows[0].total_key_results,
//       completedKeyResults: effRows[0].completed_key_results,
//       CompletionRatio: Number(parseFloat(effRows[0].kr_completion_ratio).toFixed(2))
//     };

//     const OnTrackOkrRatio = {
//       onTrackOKRs: effRows[0].ontrack_okrs,
//       totalOKRs: effRows[0].total_okrs,
//       Ratio: effRows[0].total_okrs > 0
//         ? Number(((effRows[0].ontrack_okrs / effRows[0].total_okrs) * 100).toFixed(2))
//         : 0
//     };

//     // 🔹 3. Profitability Report
//     const [profRows] = await pool.query(`
//       SELECT 
//           AVG(progress) AS avg_progress,
//           AVG(target_value) AS avg_target,
//           (AVG(progress) / AVG(target_value)) * 100 AS target_achievement_ratio
//       FROM kpis
//     `);

//     const ProfitabilityReport = {
//       averageProgress: Number(parseFloat(profRows[0].avg_progress).toFixed(2)),
//       averageTarget: Number(parseFloat(profRows[0].avg_target).toFixed(2)),
//       TargetAchievementRatio: Number(parseFloat(profRows[0].target_achievement_ratio).toFixed(2))
//     };

//     // ✅ Final Combined Response
//     res.status(200).json({
//       LiquidityReport: {
//         LeadResponseRatio,
//         ConversionSpeedRatio
//       },
//       EfficiencyReport: {
//         OKRCompletionRatio,
//         KeyResultsProgressRatio,
//         OnTrackOkrRatio
//       },
//       ProfitabilityReport
//     });

//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching combined reports",
//       error: err.message
//     });
//   }
// };




// export const getAllPerformanceDashboardsData = async (req, res) => {
//   try {
//     // --- Users ---
//     const [usersResult] = await pool.query(`
//       SELECT COUNT(*) AS total_users FROM users
//     `);
//     const totalUsers = usersResult[0].total_users;

//     // --- Leads & Conversion ---
//     const [leadsResult] = await pool.query(`
//       SELECT 
//         COUNT(*) AS total_leads,
//         SUM(CASE WHEN status = 'Qualified' THEN 1 ELSE 0 END) AS qualified_leads
//       FROM leads
//     `);
//     const totalLeads = leadsResult[0].total_leads;
//     const qualifiedLeads = leadsResult[0].qualified_leads;
//     const conversionRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(2) : 0;

//     // --- Revenue ---
//     const [revenueResult] = await pool.query(`
//       SELECT IFNULL(SUM(deal_value), 0) AS total_revenue FROM opportunities
//     `);
//     const totalRevenue = Number(revenueResult[0].total_revenue);

//     // --- KPIs ---
//     const [kpiResult] = await pool.query(`
//       SELECT COUNT(*) AS total_kpis FROM kpis
//     `);
//     const totalKPIs = kpiResult[0].total_kpis;

//     // --- OKRs with Key Results ---
//     const [okrsResult] = await pool.query(`
//       SELECT 
//         o.id,
//         o.title AS okr_title,
//         COUNT(kr.id) AS total_key_results,
//         SUM(CASE WHEN kr.progress = 100 THEN 1 ELSE 0 END) AS completed_key_results
//       FROM okrs o
//       LEFT JOIN key_results kr ON o.id = kr.okr_id
//       GROUP BY o.id
//     `);

//     const totalOKRs = okrsResult.length;
//     const totalKeyResults = okrsResult.reduce((sum, okr) => sum + okr.total_key_results, 0);
//     const totalCompletedKeyResults = okrsResult.reduce((sum, okr) => sum + Number(okr.completed_key_results), 0);

//     // --- Completed OKRs (all Key Results completed) ---
//     const [completedOKRsResult] = await pool.query(`
//       SELECT COUNT(*) AS completed_okrs
//       FROM (
//         SELECT o.id
//         FROM okrs o
//         LEFT JOIN key_results kr ON o.id = kr.okr_id
//         GROUP BY o.id
//         HAVING COUNT(kr.id) > 0 
//            AND COUNT(kr.id) = SUM(CASE WHEN kr.progress = 100 THEN 1 ELSE 0 END)
//       ) AS completed
//     `);
//     const completedOKRs = completedOKRsResult[0].completed_okrs;

//     res.status(200).json({
//       totalUsers,
//       conversionRate: Number(conversionRate),
//       totalRevenue,
//       totalKPIs,
//       totalOKRs,
//       totalKeyResults,
//       totalCompletedKeyResults,  
//       completedOKRs
//     });

//   } catch (err) { 
//     res.status(500).json({
//       message: "Error fetching combined reports",
//       error: err.message
//     });
//   }
// };

