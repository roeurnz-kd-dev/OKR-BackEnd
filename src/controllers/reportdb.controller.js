// import pool from "../db.js";
import pool from "../config/db.js";

export const addreport = async (req, res) => {
  try {
    const { name, report_type, tags } = req.body;

    if (!name || !report_type || !req.file) {
      return res.status(400).json({ message: "name, report_type, and file are required" });
    }

    const fileUrl = req.file.path;

    const [result] = await pool.query(
      `INSERT INTO reports (name, report_type, report, tags) 
       VALUES (?, ?, ?, ?)`,
      [name, report_type, fileUrl, tags || null]
    );

    res.status(201).json({
      message: "Report added successfully",
      id: result.insertId,
      fileUrl
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding report", error: err.message });
  }
};

export const getReport = async (req, res) => {
  try {
    // ---------------------- 1. OKRs ----------------------
    const [rows] = await pool.query(`
      SELECT 
        o.id AS okr_id,
        o.title AS okr_title,
        o.description,
        o.target_quarter,
        o.type,
        o.owner_id,
        u.name AS owner_name,
        o.department_id,
        d.name AS department_name,
        kr.progress AS kr_progress
      FROM okrs o
      LEFT JOIN key_results kr ON o.id = kr.okr_id
      LEFT JOIN users u ON o.owner_id = u.id
      LEFT JOIN departments d ON o.department_id = d.id
    `);

    const calculateStatus = (avg) => {
      if (avg > 60) return "On Track";
      if (avg > 30) return "At Risk";
      return "Behind";
    };

    const okrMap = {};
    rows.forEach((r) => {
      if (!okrMap[r.okr_id]) {
        okrMap[r.okr_id] = {
          okr_id: r.okr_id,
          okr_title: r.okr_title,
          description: r.description,
          target_quarter: r.target_quarter,
          type: r.type,
          owner_id: r.owner_id,
          owner_name: r.owner_name,
          department_id: r.department_id,
          department_name: r.department_name,
          kr_progress: [],
        };
      }
      if (r.kr_progress !== null)
        okrMap[r.okr_id].kr_progress.push(r.kr_progress);
    });

    const okrs = Object.values(okrMap).map((okr) => {
      const avg =
        okr.kr_progress.length > 0
          ? okr.kr_progress.reduce((s, v) => s + v, 0) / okr.kr_progress.length
          : 0;

      return {
        okr_id: okr.okr_id,
        okr_title: okr.okr_title,
        description: okr.description,
        target_quarter: okr.target_quarter,
        type: okr.type,
        owner_id: okr.owner_id,
        owner_name: okr.owner_name,
        department_id: okr.department_id,
        department_name: okr.department_name,
        average_progress: parseFloat(avg.toFixed(2)),
        status: calculateStatus(avg),
      };
    });

    const companyOKRs = okrs.filter((o) => o.type === "company");
    const departmentOKRs = okrs.filter((o) => o.type === "department");

    const companyAvg =
      companyOKRs.length > 0
        ? companyOKRs.reduce((s, o) => s + o.average_progress, 0) /
        companyOKRs.length
        : 0;

    const companyReport = {
      total_okrs: companyOKRs.length,
      average_progress: parseFloat(companyAvg.toFixed(2)),
      status: calculateStatus(companyAvg),
      // okrs: companyOKRs,
    };

    const deptMap = {};
    departmentOKRs.forEach((okr) => {
      const deptId = okr.department_id || "no_department";
      if (!deptMap[deptId]) {
        deptMap[deptId] = {
          department_id: okr.department_id,
          department_name: okr.department_name || "No Department",
          okrs: [],
        };
      }
      deptMap[deptId].okrs.push(okr);
    });

    const departments = Object.values(deptMap).map((dept) => {
      const avg =
        dept.okrs.reduce((s, o) => s + o.average_progress, 0) / dept.okrs.length;
      return {
        department_id: dept.department_id,
        department_name: dept.department_name,
        total_okrs: dept.okrs.length,
        average_progress: parseFloat(avg.toFixed(2)),
        status: calculateStatus(avg),
        owner_names: [...new Set(dept.okrs.map((o) => o.owner_name))],
        // okrs: dept.okrs,
      };
    });

    // ---------------------- 2. KPI Reports ----------------------
    const { user_id, year } = req.query;
    const selectedYear = year || new Date().getFullYear();

    // Company KPI
    const [companyKPIs] = await pool.query(`
      SELECT ROUND(AVG(IFNULL(progress,0)), 2) AS avg_progress
      FROM kpis
    `);
    console.log(companyKPIs,"companyKPIs")
    const companyKPI = companyKPIs[0]?.avg_progress || 0;

    // Department KPI
    const [departmentProgress] = await pool.query(`
      SELECT d.id AS department_id, d.name AS department_name,
             ROUND(AVG(IFNULL(k.progress,0)), 2) AS avg_progress
      FROM departments d
      LEFT JOIN department_kpis dk ON d.id = dk.department_id
      LEFT JOIN kpis k ON dk.kpi_id = k.id
      GROUP BY d.id
    `);

    // Individual KPI
    let individualProgress = [];
    if (user_id) {
      const uid = parseInt(user_id, 10);
      [individualProgress] = await pool.query(
        `
        SELECT u.id AS user_id, u.name AS user_name,
               ROUND(AVG(IFNULL(k.progress,0)), 2) AS avg_progress
        FROM users u
        LEFT JOIN individual_kpis ik ON u.id = ik.user_id
        LEFT JOIN kpis k ON ik.kpi_id = k.id
        WHERE u.id = ?
        GROUP BY u.id
      `,
        [uid]
      );
    }

    // Monthly KPI trend
    const [monthlyProgress] = await pool.query(
      `
      SELECT MONTH(updated_at) AS month,
             ROUND(AVG(IFNULL(progress,0)), 2) AS avg_progress
      FROM kpis
      WHERE YEAR(updated_at) = ?
      GROUP BY MONTH(updated_at)
      ORDER BY MONTH(updated_at)
    `,
      [selectedYear]
    );

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthData = months.map((m, idx) => {
      const found = monthlyProgress.find((mp) => mp.month === idx + 1);
      return {
        month: m,
        value: found ? found.avg_progress : 0,
      };
    });

    // ---------------------- 3. CRM Reports ----------------------
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

    const [totalLeadsResult] = await pool.query(`SELECT COUNT(*) AS total_leads FROM leads`);
    const [totalDealsResult] = await pool.query(`SELECT COUNT(*) AS total_deals FROM opportunities`);

    // ---------------------- FINAL RESPONSE ----------------------
    return res.status(200).json({
      okrs: {
        company_okrs: companyReport,
        department_okrs: departments,
      },
      kpis: {
        company_kpi: Number(companyKPI),
        department_progress: departmentProgress.map((d) => ({
          ...d,
          avg_progress: d.avg_progress || 0,
        })),
        individual_progress: individualProgress,
        monthly_progress: monthData,
      },
      crm: {
        lead_status: leadStatus,
        lead_source: leadSource,
        deal_stages: dealStages,
        total_leads: totalLeadsResult[0]?.total_leads || 0,
        total_deals: totalDealsResult[0]?.total_deals || 0,
      },
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Error fetching reports", error: err.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`SELECT report FROM reports WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const fileUrl = rows[0].report;

    // delete from DB
    const [result] = await pool.query(`DELETE FROM reports WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted successfully", fileUrl });
  } catch (err) {
    res.status(500).json({ message: "Error deleting report", error: err.message });
  }
};

export const getliquidityReport = async (req, res) => {
  try {
    // Total leads
    const [totalResult] = await pool.query(`
      SELECT COUNT(*) AS total_leads 
      FROM leads
    `);

    // Responded leads (all except "New")
    const [respondedResult] = await pool.query(`
      SELECT COUNT(*) AS responded_leads 
      FROM leads 
      WHERE status IN ('Contacted', 'Qualified', 'Lost')
    `);

    const [result] = await pool.query(`
  SELECT 
  COUNT(*) AS total_closing,
  AVG(DATEDIFF(o.updated_at, l.created_at)) AS avg_cycle_days
FROM opportunities o
JOIN leads l ON o.lead_id = l.id
WHERE o.stage = 'Closing';
`);

    const totalClosing = result[0].total_closing;
    const avgCycleDays = result[0].avg_cycle_days;
    const conversionSpeedRatio = totalClosing / avgCycleDays;
    const totalLeads = totalResult[0].total_leads;
    const respondedLeads = respondedResult[0].responded_leads;

    // Lead Response Ratio calculation
    const ratio = totalLeads > 0
      ? ((respondedLeads / totalLeads) * 100).toFixed(2)
      : 0;

    const LeadResponseRatio = {
      totalLeads,
      respondedLeads,
      leadResponseRatio: `${ratio}%`,
    }

    const ConversionSpeedRatio = {
      totalClosing,
      avgCycleDays: Number(parseFloat(avgCycleDays).toFixed(2)),
      conversionSpeedRatio: parseFloat(conversionSpeedRatio.toFixed(2))
    }

    res.status(200).json({
      LeadResponseRatio,
      ConversionSpeedRatio
    });

  } catch (err) {
    res.status(500).json({
      message: "Error fetching reports",
      error: err.message
    });
  }
};

export const getefficiencyReport = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH okr_avg AS (
        SELECT 
          kr.okr_id, 
          AVG(kr.progress) AS avg_progress
        FROM key_results kr
        GROUP BY kr.okr_id
      )
      SELECT 
          COUNT(DISTINCT o.id) AS total_okrs,
          COUNT(DISTINCT completed_okrs.okr_id) AS completed_okrs,
          (COUNT(DISTINCT completed_okrs.okr_id) / COUNT(DISTINCT o.id)) * 100 AS okr_completion_ratio,

          (SELECT COUNT(*) FROM key_results) AS total_key_results,
          (SELECT COUNT(*) FROM key_results WHERE progress = 100) AS completed_key_results,
          ((SELECT COUNT(*) FROM key_results WHERE progress = 100) / (SELECT COUNT(*) FROM key_results)) * 100 AS kr_completion_ratio,

          (SELECT COUNT(*) FROM okr_avg WHERE avg_progress >= 60) AS ontrack_okrs
      FROM okrs o
      LEFT JOIN (
          SELECT kr.okr_id
          FROM key_results kr
          GROUP BY kr.okr_id
          HAVING MIN(kr.progress) = 100
      ) AS completed_okrs ON o.id = completed_okrs.okr_id
    `);

    const OKRCompletionRatio = {
      totalOKRs: rows[0].total_okrs,
      completedOKRs: rows[0].completed_okrs,
      CompletionRatio: Number(parseFloat(rows[0].okr_completion_ratio).toFixed(2))
    };

    const KeyResultsProgressRatio = {
      totalKeyResults: rows[0].total_key_results,
      completedKeyResults: rows[0].completed_key_results,
      CompletionRatio: Number(parseFloat(rows[0].kr_completion_ratio).toFixed(2))
    };

    const OnTrackOkrRatio = {
      onTrackOKRs: rows[0].ontrack_okrs,
      totalOKRs: rows[0].total_okrs,
      Ratio: rows[0].total_okrs > 0
        ? Number(((rows[0].ontrack_okrs / rows[0].total_okrs) * 100).toFixed(2))
        : 0
    };

    res.json({ OKRCompletionRatio, KeyResultsProgressRatio, OnTrackOkrRatio });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching reports",
      error: err.message
    });
  }
};

export const getprofitabilityReport = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          AVG(progress) AS avg_progress,
          AVG(target_value) AS avg_target,
          (AVG(progress) / AVG(target_value)) * 100 AS target_achievement_ratio
      FROM kpis
    `);

    const ProfitabilityReport = {
      averageProgress: Number(parseFloat(rows[0].avg_progress).toFixed(2)),
      averageTarget: Number(parseFloat(rows[0].avg_target).toFixed(2)),
      TargetAchievementRatio: Number(parseFloat(rows[0].target_achievement_ratio).toFixed(2))
    };

    res.json({ ProfitabilityReport });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching profitability report",
      error: err.message
    });
  }
};

export const getAllReports = async (req, res) => {
  try {
    // 🔹 1. Liquidity Report
    const [totalResult] = await pool.query(`SELECT COUNT(*) AS total_leads FROM leads`);
    const totalLeads = Number(totalResult?.[0]?.total_leads || 0);

    const [respondedResult] = await pool.query(`
      SELECT COUNT(*) AS responded_leads 
      FROM leads 
      WHERE status IN ('Contacted', 'Qualified', 'Lost')
    `);
    const respondedLeads = Number(respondedResult?.[0]?.responded_leads || 0);

    const [closingResult] = await pool.query(`
      SELECT 
        COUNT(*) AS total_closing,
        AVG(DATEDIFF(o.updated_at, l.created_at)) AS avg_cycle_days
      FROM opportunities o
      JOIN leads l ON o.lead_id = l.id
      WHERE o.stage = 'Closing'
    `);
    const totalClosing = Number(closingResult?.[0]?.total_closing || 0);
    const avgCycleDays = Number(closingResult?.[0]?.avg_cycle_days || 1); // prevent division by 0
    const conversionSpeedRatio = avgCycleDays > 0 ? totalClosing / avgCycleDays : 0;

    const LeadResponseRatio = {
      totalLeads,
      respondedLeads,
      leadResponseRatio: totalLeads > 0 ? Number(((respondedLeads / totalLeads) * 100).toFixed(2)) : 0
    };

    const ConversionSpeedRatio = {
      totalClosing,
      avgCycleDays: Number(avgCycleDays.toFixed(2)),
      conversionSpeedRatio: Number(conversionSpeedRatio.toFixed(2))
    };

    // 🔹 2. Efficiency Report
    const [effRows] = await pool.query(`
      WITH okr_avg AS (
        SELECT kr.okr_id, AVG(kr.progress) AS avg_progress
        FROM key_results kr
        GROUP BY kr.okr_id
      )
      SELECT 
        COUNT(DISTINCT o.id) AS total_okrs,
        COUNT(DISTINCT completed_okrs.okr_id) AS completed_okrs,
        (COUNT(DISTINCT completed_okrs.okr_id) / NULLIF(COUNT(DISTINCT o.id),0)) * 100 AS okr_completion_ratio,
        (SELECT COUNT(*) FROM key_results) AS total_key_results,
        (SELECT COUNT(*) FROM key_results WHERE progress = 100) AS completed_key_results,
        ((SELECT COUNT(*) FROM key_results WHERE progress = 100) / NULLIF((SELECT COUNT(*) FROM key_results),0)) * 100 AS kr_completion_ratio,
        (SELECT COUNT(*) FROM okr_avg WHERE avg_progress >= 60) AS ontrack_okrs
      FROM okrs o
      LEFT JOIN (
        SELECT kr.okr_id
        FROM key_results kr
        GROUP BY kr.okr_id
        HAVING MIN(kr.progress) = 100
      ) AS completed_okrs ON o.id = completed_okrs.okr_id
    `);

    const totalOKRs = Number(effRows?.[0]?.total_okrs || 0);
    const completedOKRs = Number(effRows?.[0]?.completed_okrs || 0);
    const okrCompletionRatio = Number(effRows?.[0]?.okr_completion_ratio || 0);
    const totalKeyResults = Number(effRows?.[0]?.total_key_results || 0);
    const completedKeyResults = Number(effRows?.[0]?.completed_key_results || 0);
    const krCompletionRatio = Number(effRows?.[0]?.kr_completion_ratio || 0);
    const onTrackOKRs = Number(effRows?.[0]?.ontrack_okrs || 0);
    const onTrackRatio = totalOKRs > 0 ? Number(((onTrackOKRs / totalOKRs) * 100).toFixed(2)) : 0;

    // 🔹 3. Profitability Report
    const [profRows] = await pool.query(`
      SELECT 
        AVG(progress) AS avg_progress,
        AVG(target_value) AS avg_target,
        (AVG(progress) / NULLIF(AVG(target_value),0)) * 100 AS target_achievement_ratio
      FROM kpis
    `);

    const avgProgress = Number(profRows?.[0]?.avg_progress || 0);
    const avgTarget = Number(profRows?.[0]?.avg_target || 0);
    const targetAchievementRatio = Number(profRows?.[0]?.target_achievement_ratio || 0);

    res.status(200).json({
      LiquidityReport: {
        LeadResponseRatio,
        ConversionSpeedRatio
      },
      EfficiencyReport: {
        OKRCompletionRatio: { totalOKRs, completedOKRs, CompletionRatio: okrCompletionRatio },
        KeyResultsProgressRatio: { totalKeyResults, completedKeyResults, CompletionRatio: krCompletionRatio },
        OnTrackOkrRatio: { onTrackOKRs, totalOKRs, Ratio: onTrackRatio }
      },
      ProfitabilityReport: { averageProgress: avgProgress, averageTarget: avgTarget, TargetAchievementRatio: targetAchievementRatio }
    });

  } catch (err) {
    res.status(500).json({
      message: "Error fetching combined reports",
      error: err.message
    });
  }
};

export const getAllPerformanceDashboardsData = async (req, res) => {
  try {
    const [usersResult] = await pool.query(`SELECT COUNT(*) AS total_users FROM users`);
    const totalUsers = Number(usersResult?.[0]?.total_users || 0);

    const [leadsResult] = await pool.query(`
      SELECT 
        COUNT(*) AS total_leads,
        SUM(CASE WHEN status = 'Qualified' THEN 1 ELSE 0 END) AS qualified_leads
      FROM leads
    `);
    const totalLeads = Number(leadsResult?.[0]?.total_leads || 0);
    const qualifiedLeads = Number(leadsResult?.[0]?.qualified_leads || 0);
    const conversionRate = totalLeads > 0 ? Number(((qualifiedLeads / totalLeads) * 100).toFixed(2)) : 0;

    const [revenueResult] = await pool.query(`SELECT IFNULL(SUM(deal_value), 0) AS total_revenue FROM opportunities`);
    const totalRevenue = Number(revenueResult?.[0]?.total_revenue || 0);

    const [kpiResult] = await pool.query(`SELECT COUNT(*) AS total_kpis FROM kpis`);
    const totalKPIs = Number(kpiResult?.[0]?.total_kpis || 0);

    const [okrsResult] = await pool.query(`
      SELECT 
        o.id,
        COUNT(kr.id) AS total_key_results,
        SUM(CASE WHEN kr.progress = 100 THEN 1 ELSE 0 END) AS completed_key_results
      FROM okrs o
      LEFT JOIN key_results kr ON o.id = kr.okr_id
      GROUP BY o.id
    `);

    const totalOKRs = okrsResult?.length || 0;
    const totalKeyResults = okrsResult?.reduce((sum, okr) => sum + Number(okr.total_key_results || 0), 0);
    const totalCompletedKeyResults = okrsResult?.reduce((sum, okr) => sum + Number(okr.completed_key_results || 0), 0);

    const [completedOKRsResult] = await pool.query(`
      SELECT COUNT(*) AS completed_okrs
      FROM (
        SELECT o.id
        FROM okrs o
        LEFT JOIN key_results kr ON o.id = kr.okr_id
        GROUP BY o.id
        HAVING COUNT(kr.id) > 0 AND COUNT(kr.id) = SUM(CASE WHEN kr.progress = 100 THEN 1 ELSE 0 END)
      ) AS completed
    `);
    const completedOKRs = Number(completedOKRsResult?.[0]?.completed_okrs || 0);

    res.status(200).json({
      totalUsers,
      conversionRate,
      totalRevenue,
      totalKPIs,
      totalOKRs,
      totalKeyResults,
      totalCompletedKeyResults,  
      completedOKRs
    });

  } catch (err) { 
    res.status(500).json({
      message: "Error fetching combined reports",
      error: err.message
    });
  }
};
