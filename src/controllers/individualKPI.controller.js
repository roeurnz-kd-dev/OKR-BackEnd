import pool from "../config/db.js";

export const addIndividualKPI = async (req, res) => {
  try {
    const { kpi_id, user_id } = req.body;

    if (!kpi_id || !user_id) {
      return res.status(400).json({ error: "kpi_id and user_id are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO individual_kpis (kpi_id, user_id) VALUES (?, ?)`,
      [kpi_id, user_id]
    );

    res.json({ message: "KPI assigned to user successfully", id: result.insertId, kpi_id, user_id });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "This KPI is already assigned to the user" });
    }
    console.error("Assign KPI to user failed:", error);
    res.status(500).json({ error: "Failed to assign KPI to user" });
  }
};

export const getIndividualKPIs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ik.*, k.id AS kpi_id, k.title, k.target_value, k.frequency, 
              k.description, k.progress,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM individual_kpis ik
       JOIN kpis k ON ik.kpi_id = k.id
       JOIN users u ON ik.user_id = u.id`
    );

    res.json(rows);
  } catch (error) {
    console.error("Get Individual KPIs failed:", error);
    res.status(500).json({ error: "Failed to get Individual KPIs" });
  }
};

export const deleteIndividualKPI = async (req, res) => {
  try {
    const { id } = req.params; // mapping row id

    const [result] = await pool.query(
      `DELETE FROM individual_kpis WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Individual KPI mapping not found" });
    }

    res.json({ message: "Individual KPI mapping deleted successfully", id });
  } catch (error) {
    console.error("Delete Individual KPI failed:", error);
    res.status(500).json({ error: "Failed to delete Individual KPI" });
  }
};
export const getKPIsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await pool.query(
      `SELECT k.id AS kpi_id, k.title, k.target_value, k.frequency, 
              k.description, k.progress,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM individual_kpis ik
       JOIN kpis k ON ik.kpi_id = k.id
       JOIN users u ON ik.user_id = u.id
       WHERE u.id = ?`,
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No KPIs found for this user" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Get KPIs by User ID failed:", error);
    res.status(500).json({ error: "Failed to get KPIs by User ID" });
  }
};
