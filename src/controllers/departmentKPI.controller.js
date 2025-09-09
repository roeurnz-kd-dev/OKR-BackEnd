import pool from "../config/db.js";

export const addDepartmentKPI  =   async (req, res) => {
  try {
    const { kpi_id, department_id } = req.body;

    if (!kpi_id || !department_id) {
      return res.status(400).json({ error: "kpi_id and department_id are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO department_kpis (kpi_id, department_id) VALUES (?, ?)`,
      [kpi_id, department_id]
    );

    res.json({ message: "KPI assigned to department successfully", id: result.insertId, kpi_id, department_id });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "This KPI is already assigned to the department" });
    }
    console.error("Assign KPI to Department failed:", error);
    res.status(500).json({ error: "Failed to assign KPI to Department" });
  }
};



export const getDepartmentKPI = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT dk.* , k.id AS kpi_id, k.title, k.target_value, k.frequency, 
              k.description, k.progress,
              d.id AS department_id, d.name AS department_name
       FROM department_kpis dk
       JOIN kpis k ON dk.kpi_id = k.id
       JOIN departments d ON dk.department_id = d.id`
    );

    res.json(rows);
  } catch (error) {
    console.error("Get Department KPI failed:", error);
    res.status(500).json({ error: "Failed to get Department KPI" });
  }
};

export const deleteDepartmentKPI = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM department_kpis WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Department KPI mapping not found" });
    }

    res.json({ message: "Department KPI mapping deleted successfully", id });
  } catch (error) {
    console.error("Delete Department KPI failed:", error);
    res.status(500).json({ error: "Failed to delete Department KPI" });
  }
};

