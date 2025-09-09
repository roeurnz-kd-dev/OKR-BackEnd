import pool from "../config/db.js";

export const addKPI = async ( req, res) => {
    try{
      const { title, target_value, frequency, department_id, user_id, description } = req.body;
  try {
    const progress = (Math.floor(Math.random() * 5) * 10 + 60);
    const [result] = await pool.query(

      'INSERT INTO kpis (title, target_value, frequency, department_id, user_id, description ,progress) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, target_value, frequency, department_id || null, user_id || null, description || null, progress]
    );
    res.json({ id: result.insertId, title, target_value, frequency, department_id, user_id, description, progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

    } catch(error) {
        console.error("Add KPI failed:", error);
        return sendError(res, 500, "Failed to add KPI", error.message);
    }
}

  export const getKPIs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kpis');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getKPIById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM kpis WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'KPI not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update KPI assignment (user or department)
export const updateKPIAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, department_id } = req.body;

    // Check if at least one field is provided
    if (user_id === undefined && department_id === undefined) {
      return res.status(400).json({ error: "Provide user_id or department_id to update" });
    }

    // Build dynamic query
    let query = "UPDATE kpis SET ";
    const values = [];

    if (user_id !== undefined) {
      query += "user_id = ?";
      values.push(user_id);
    }

    if (department_id !== undefined) {
      if (values.length > 0) query += ", ";
      query += "department_id = ?";
      values.push(department_id);
    }

    query += " WHERE id = ?";
    values.push(id);

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "KPI not found" });
    }

    res.json({ message: "KPI updated successfully", id, user_id, department_id });
  } catch (err) {
    console.error("Update KPI assignment failed:", err);
    res.status(500).json({ error: err.message });
  }
};


export const deleteKPI = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM kpis WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "KPI not found" });
    }
    res.json({ message: "KPI deleted successfully", id });
  } catch (err) {
    console.error("Delete KPI failed:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update KPI (full update)
export const updateKPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, target_value, frequency, department_id, user_id, description, progress } = req.body;

    const [result] = await pool.query(
      `UPDATE kpis 
       SET title = ?, target_value = ?, frequency = ?, department_id = ?, user_id = ?, description = ?, progress = ? 
       WHERE id = ?`,
      [title, target_value, frequency, department_id || null, user_id || null, description || null, progress || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "KPI not found" });
    }

    res.json({ message: "KPI updated successfully", id, title, target_value, frequency, department_id, user_id, description, progress });
  } catch (err) {
    console.error("Update KPI failed:", err);
    res.status(500).json({ error: err.message });
  }
};

// Patch KPI progress (only progress)
export const patchKPIProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress === undefined) {
      return res.status(400).json({ error: "Progress value is required" });
    }

    const [result] = await pool.query('UPDATE kpis SET progress = ? WHERE id = ?', [progress, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "KPI not found" });
    }

    res.json({ message: "KPI progress updated successfully", id, progress });
  } catch (err) {
    console.error("Patch KPI progress failed:", err);
    res.status(500).json({ error: err.message });
  }
};


// export const getDepartmentKPI = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT kpis.*, d.name AS department_name
//        FROM kpis
//        JOIN departments d ON kpis.department_id = d.id
//        WHERE kpis.department_id IS NOT NULL`
//     );
// console.log(rows);
//     res.json(rows);
//   } catch (error) {
//     console.error("Get Department KPI failed:", error);
//     res.status(500).json({ error: "Failed to get Department KPI" });
//   }
// };











// export const getKPIById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [rows] = await pool.query("SELECT * FROM kpis WHERE id = ?", [id]);

//     if (rows.length === 0) return sendError(res, 404, "OKR not found");

//     return sendResponse(res, 200, "OKR retrieved successfully", rows[0]);
//   } catch (error) {
//     console.error("Get OKR failed:", error);
//     return sendError(res, 500, "Failed to retrieve OKR", error.message);
//   }
// };