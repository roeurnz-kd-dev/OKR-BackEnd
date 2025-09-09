// controllers/dashboard.controller.js
import pool from "../config/db.js";

// export const getCompanyKPIDashboard = async (req, res) => {
//   try {
//     const { timeframe = "weekly" } = req.query; // default = weekly
//     let dateFilter = "";

//     // Build date filter condition
//     switch (timeframe) {
//       case "today":
//         dateFilter = "WHERE DATE(k.created_at) = CURDATE()";
//         break;
//       case "weekly":
//         dateFilter = "WHERE k.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
//         break;
//       case "monthly":
//         dateFilter =
//           "WHERE MONTH(k.created_at) = MONTH(CURDATE()) AND YEAR(k.created_at) = YEAR(CURDATE())";
//         break;
//       case "quarterly":
//         dateFilter = `
//           WHERE QUARTER(k.created_at) = QUARTER(CURDATE())
//           AND YEAR(k.created_at) = YEAR(CURDATE())
//         `;
//         break;
//       case "yearly":
//         dateFilter = "WHERE YEAR(k.created_at) = YEAR(CURDATE())";
//         break;
//       default:
//         dateFilter = ""; // No filter = all time
//     }

//     // 1. Overall KPI stats
//     // 1. Overall KPI stats
// const [overall] = await pool.query(`
//   SELECT 
//     COUNT(*) AS total_kpis,
//     ROUND(SUM(k.progress) / COUNT(*), 2) AS avg_progress,
//     SUM(CAST(REPLACE(k.target_value, '%', '') AS UNSIGNED)) AS total_target
//   FROM kpis k
//   ${dateFilter}
// `);


//     // 2. Department-wise KPI stats
//     const [byDepartment] = await pool.query(`
//       SELECT 
//         d.id AS department_id, 
//         d.name AS department_name,
//         COUNT(k.id) AS total_kpis,
//         ROUND(SUM(k.progress) / COUNT(k.id), 2) AS avg_progress,
//         SUM(k.target_value) AS total_target
//       FROM department_kpis dk
//       JOIN kpis k ON dk.kpi_id = k.id
//       JOIN departments d ON dk.department_id = d.id
//       ${dateFilter}
//       GROUP BY d.id, d.name
//     `);

//     // 3. User-wise KPI stats
//     const [byUser] = await pool.query(`
//       SELECT 
//         u.id AS user_id, 
//         u.name AS user_name,
//         COUNT(k.id) AS total_kpis,
//         ROUND(SUM(k.progress) / COUNT(k.id), 2) AS avg_progress
//       FROM individual_kpis ik
//       JOIN kpis k ON ik.kpi_id = k.id
//       JOIN users u ON ik.user_id = u.id
//       ${dateFilter}
//       GROUP BY u.id, u.name
//     `);

//     // 4. Frequency breakdown

//     // 5. Overall Trend for charts (daily aggregation)

//     res.json({
//       overall: overall[0],
//       departments: byDepartment,
//       individuals: byUser,

//     });
//   } catch (error) {
//     console.error("Dashboard API failed:", error);
//     res.status(500).json({ error: "Failed to load dashboard data" });
//   }
// };

export const getCompanyKPIDashboard = async (req, res) => {
  try {
    // 1. Overall KPI stats
   const [overall] = await pool.query(`
      SELECT 
        COUNT(*) AS total_kpis,
        ROUND(SUM(k.progress) / COUNT(*), 2) AS avg_progress,
        ROUND(AVG(CAST(REPLACE(k.target_value, '%', '') AS UNSIGNED)), 2) AS total_target
      FROM kpis k
    `);
    // 2. Department-wise KPI stats
    const [byDepartment] = await pool.query(`
      SELECT 
        d.id AS department_id, 
        d.name AS department_name,
        COUNT(k.id) AS total_kpis,
        ROUND(SUM(k.progress) / COUNT(k.id), 2) AS avg_progress,
        SUM(CAST(REPLACE(k.target_value, '%', '') AS UNSIGNED)) AS total_target
      FROM department_kpis dk
      JOIN kpis k ON dk.kpi_id = k.id
      JOIN departments d ON dk.department_id = d.id
      GROUP BY d.id, d.name
    `);

    // 3. User-wise KPI stats
    const [byUser] = await pool.query(`
      SELECT 
        u.id AS user_id, 
        u.name AS user_name,
        COUNT(k.id) AS total_kpis,
        ROUND(SUM(k.progress) / COUNT(k.id), 2) AS avg_progress,
        SUM(CAST(REPLACE(k.target_value, '%', '') AS UNSIGNED)) AS total_target
      FROM individual_kpis ik
      JOIN kpis k ON ik.kpi_id = k.id
      JOIN users u ON ik.user_id = u.id
      GROUP BY u.id, u.name
    `);

    res.json({
      overall: overall[0],
      departments: byDepartment,
      individuals: byUser,
    });
  } catch (error) {
    console.error("Dashboard API failed:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
};
