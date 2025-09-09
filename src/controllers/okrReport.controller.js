import pool from "../config/db.js";
import dayjs from "dayjs";
export const getOKRReports = async (req, res) => {
  try {
    // Fetch OKRs with related data
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

    if (!rows.length) {
      return res.status(200).json({ company_okrs: {}, department_okrs: [] });
    }

    // Helper to calculate status
    const calculateStatus = (avg) => {
      if (avg > 60) return "On Track";
      if (avg > 30) return "At Risk";
      return "Behind";
    };

    // Group key results by OKR
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
      if (r.kr_progress !== null) okrMap[r.okr_id].kr_progress.push(r.kr_progress);
    });

    // Transform into list (exclude kr_progress in final result)
    const okrs = Object.values(okrMap).map((okr) => {
      const avg =
        okr.kr_progress.length > 0
          ? okr.kr_progress.reduce((sum, v) => sum + v, 0) / okr.kr_progress.length
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

    // Separate company and department OKRs
    const companyOKRs = okrs.filter((o) => o.type === "company");
    const departmentOKRs = okrs.filter((o) => o.type === "department");

    // Company summary
    const companyAvg =
      companyOKRs.length > 0
        ? companyOKRs.reduce((sum, o) => sum + o.average_progress, 0) /
          companyOKRs.length
        : 0;

    const companyReport = {
      total_okrs: companyOKRs.length,
      average_progress: parseFloat(companyAvg.toFixed(2)),
      status: calculateStatus(companyAvg),
      okrs: companyOKRs,
    };

    // Department summary grouped
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
        dept.okrs.reduce((sum, o) => sum + o.average_progress, 0) / dept.okrs.length;
      return {
        department_id: dept.department_id,
        department_name: dept.department_name,
        total_okrs: dept.okrs.length,
        average_progress: parseFloat(avg.toFixed(2)),
        status: calculateStatus(avg),
        owner_names: [...new Set(dept.okrs.map((o) => o.owner_name))],
        okrs: dept.okrs,
      };
    });

    res.status(200).json({
      company_okrs: companyReport,
      department_okrs: departments,
    });
  } catch (err) {
    console.error("Error fetching OKR reports:", err);
    res.status(500).json({ error: err.message });
  }
};






// export const getKPIDashboard = async (req, res) => {
//   try {
//     const months = [
//       "Jan", "Feb", "Mar", "Apr", "May",
//       "Jun", "Jul", "Aug", "Sep", "Oct",
//       "Nov", "Dec"
//     ];

//     // KPI monthly average progress
//     const [kpiRows] = await pool.query(`
//       SELECT 
//         MONTH(created_at) AS month_num, 
//         ROUND(AVG(progress), 2) AS avg_progress
//       FROM kpis
//       GROUP BY MONTH(created_at)
//       ORDER BY month_num
//     `);

//     const kpiProgress = months.map((m, i) => {
//       const row = kpiRows.find(r => r.month_num === i + 1);
//       return {
//         month: m,
//         value: row ? row.avg_progress : 0
//       };
//     });

//     // Calculate month-over-month growth trend
//     const progressGrowth = kpiProgress.map((item, index, arr) => {
//       if (index === 0) return { month: item.month, growth: 0 };
//       const prev = arr[index - 1].value;
//       const growth = prev === 0 ? 0 : ((item.value - prev) / prev) * 100;
//       return { month: item.month, growth: Number(growth.toFixed(2)) };
//     });

//     // Lead statuses (fixed list)
//     const leadStatuses = ["New", "Contacted", "Qualified", "Lost"];
//     const [leadRows] = await pool.query(`
//       SELECT status, COUNT(*) AS total
//       FROM leads
//       GROUP BY status
//     `);
//     const leadStatus = leadStatuses.map(status => {
//       const row = leadRows.find(r => r.status === status);
//       return { status, total: row ? row.total : 0 };
//     });

//     // Deal stages (fixed list)
//     const dealStagesList = ["Qualification", "Meeting", "Proposal", "Closing", "Lost"];
//     const [dealRows] = await pool.query(`
//       SELECT stage, COUNT(*) AS total
//       FROM opportunities
//       GROUP BY stage
//     `);
//     const dealStages = dealStagesList.map(stage => {
//       const row = dealRows.find(r => r.stage === stage);
//       return { stage, total: row ? row.total : 0 };
//     });

//     res.status(200).json({
//       kpiProgress,
//       progressGrowth,
     
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };




export const getKPIDashboard = async (req, res) => {
  try {
    const { department_id, user_id, year } = req.query;
    const selectedYear = year || new Date().getFullYear();

    // 1. Company KPI (KPIs not linked to department_kpis or individual_kpis)
    const [companyKPIs] = await pool.query(`
      SELECT ROUND(AVG(IFNULL(progress,0)), 2) AS avg_progress
      FROM kpis
      WHERE id NOT IN (SELECT kpi_id FROM department_kpis)
        AND id NOT IN (SELECT kpi_id FROM individual_kpis)
    `);
    const companyKPI = companyKPIs[0]?.avg_progress || 0;

    // 2. Department progress (from department_kpis)
    const [departmentProgress] = await pool.query(`
      SELECT d.id AS department_id, d.name AS department_name,
             ROUND(AVG(IFNULL(k.progress,0)), 2) AS avg_progress
      FROM departments d
      LEFT JOIN department_kpis dk ON d.id = dk.department_id
      LEFT JOIN kpis k ON dk.kpi_id = k.id
      GROUP BY d.id
    `);

    // 3. Individual progress (optional if user_id is provided)
    let individualProgress = [];
    if (user_id) {
      const uid = parseInt(user_id, 10);
      [individualProgress] = await pool.query(`
        SELECT u.id AS user_id, u.name AS user_name,
               ROUND(AVG(IFNULL(k.progress,0)), 2) AS avg_progress
        FROM users u
        LEFT JOIN individual_kpis ik ON u.id = ik.user_id
        LEFT JOIN kpis k ON ik.kpi_id = k.id
        WHERE u.id = ?
        GROUP BY u.id
      `, [uid]);
    }

    // 4. Monthly KPI progress trend
    const [monthlyProgress] = await pool.query(`
      SELECT MONTH(updated_at) AS month,
             ROUND(AVG(IFNULL(progress,0)), 2) AS avg_progress
      FROM kpis
      WHERE YEAR(updated_at) = ?
      GROUP BY MONTH(updated_at)
      ORDER BY MONTH(updated_at)
    `, [selectedYear]);

    // Format monthly progress to include all months
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthData = months.map((m, idx) => {
      const found = monthlyProgress.find(mp => mp.month === idx + 1);
      return {
        month: m,
        value: found ? found.avg_progress : 0
      };
    });

    return res.json({
      // companyKPI,
      departmentProgress: departmentProgress.map(d => ({
        ...d,
        avg_progress: d.avg_progress || 0
      })),
      individualProgress,
      kpiProgress: monthData
    });

  } catch (error) {
    console.error("Error fetching KPI dashboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
