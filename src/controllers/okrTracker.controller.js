import pool from "../config/db.js";


export const getOkrProgressTracker = async (req, res) => {
  try {
    const { type, owner_id, department_id, quarter } = req.query;

    // Base query for OKRs with joins
    let query = `
      SELECT o.*, 
             u.name AS owner_name, 
             d.name AS department_name
      FROM okrs o
      LEFT JOIN users u ON o.owner_id = u.id
      LEFT JOIN departments d ON o.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += " AND o.type = ?";
      params.push(type);
    }
    if (owner_id) {
      query += " AND o.owner_id = ?";
      params.push(owner_id);
    }
    if (department_id) {
      query += " AND o.department_id = ?";
      params.push(department_id);
    }
    if (quarter) {
      query += " AND o.target_quarter = ?";
      params.push(quarter);
    }

    query += " ORDER BY o.created_at DESC";

    // Fetch OKRs
    const [okrs] = await pool.query(query, params);

    // Fetch all key results
    const [keyResults] = await pool.query(`SELECT * FROM key_results`);

    // Process OKRs with key results + avg progress
    const processedOkrs = okrs.map(okr => {
      const krList = keyResults.filter(kr => kr.okr_id === okr.id);

      const avg_progress = krList.length > 0 
        ? krList.reduce((sum, kr) => sum + kr.progress, 0) / krList.length 
        : 0;

      return {
        ...okr,
        avg_progress: Math.round(avg_progress),
        key_results: krList.map(kr => ({
          id: kr.id,
          title: kr.title,
          progress: kr.progress
        }))
      };
    });

    // Calculate dashboard stats
    const total = processedOkrs.length;
    const on_track = processedOkrs.filter(o => o.avg_progress >= 60).length;
    const at_risk = processedOkrs.filter(o => o.avg_progress < 60 && o.avg_progress >= 30).length;
    const behind = processedOkrs.filter(o => o.avg_progress < 30).length;

    res.json({
      summary: {
        total,
        on_track,
        at_risk,
        behind
      },
      okrs: processedOkrs
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching OKR progress tracker" });
  }
};
