import pool from "../config/db.js";

export const createOkrDependency = async (req, res) => {
  try {
    const { okr_id, department_id, tasks, priority } = req.body;
    const created_by = req.user?.id || 1;

    if (!okr_id || !department_id) {
      return res.status(400).json({ message: "okr_id and department_id are required" });
    }

    // Verify OKR and Department
    const [okr] = await pool.query("SELECT id FROM okrs WHERE id = ?", [okr_id]);
    if (!okr.length) return res.status(404).json({ message: "OKR not found" });

    const [dept] = await pool.query("SELECT id FROM departments WHERE id = ?", [department_id]);
    if (!dept.length) return res.status(404).json({ message: "Department not found" });

    // Parse tasks
    const parsedTasks = typeof tasks === "string" ? JSON.parse(tasks) : tasks;
    if (!Array.isArray(parsedTasks) || parsedTasks.length === 0) {
      return res.status(400).json({ message: "tasks must be a non-empty array" });
    }

    // Insert dependency
    const [depResult] = await pool.query(
      `INSERT INTO okr_dependencies (okr_id, department_id, created_by, priority)
       VALUES (?, ?, ?, ?)`,
      [okr_id, department_id, created_by, priority]
    );
    const dependencyId = depResult.insertId;

    // Insert tasks
    const taskPromises = parsedTasks.map((t) =>
      pool.query(
        `INSERT INTO okr_dependency_tasks (dependency_id, task) VALUES (?, ?)`,
        [dependencyId, t.task || t]
      )
    );
    await Promise.all(taskPromises);

    res.status(201).json({
      message: "OKR dependency created successfully",
      dependency_id: dependencyId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating OKR dependency", error: error.message });
  }
};

export const getOkrDependencies = async (req, res) => {
  try {
    // Fetch dependencies with related OKR and department details
 const [rows] = await pool.query(`
  SELECT 
    od.id AS dependency_id,
    od.priority AS okr_priority,
    o.id AS okr_id,
    o.title AS okr_title,
    o.description,
    o.target_quarter,
    o.type,
    o.owner_id,
    u.name AS owner_name,
    od.department_id,
    d.name AS department_name,
      ROUND(COALESCE(AVG(kr.progress), 0), 2) AS avg_progress 
  FROM okr_dependencies od
  INNER JOIN okrs o ON od.okr_id = o.id
  LEFT JOIN key_results kr ON o.id = kr.okr_id
  LEFT JOIN users u ON o.owner_id = u.id
  LEFT JOIN departments d ON od.department_id = d.id
  GROUP BY 
    od.id,
    od.priority,
    o.id,
    o.title,
    o.description,
    o.target_quarter,
    o.type,
    o.owner_id,
    u.name,
    o.department_id,
    d.name
`);


    if (!rows.length) {
      return res.status(200).json({ dependencies: [] });
    }

    // Helper function to map avg progress to status
    const calculateStatus = (avg) => {
      if (avg > 60) return "On Track";
      if (avg > 30) return "At Risk";
      return "Behind";
    };

    // Fetch tasks for each dependency
    const dependencyIds = rows.map(r => r.dependency_id);
    let tasksMap = {};
    if (dependencyIds.length) {
      const [tasks] = await pool.query(
        `SELECT dependency_id, task FROM okr_dependency_tasks 
         WHERE dependency_id IN (?)`,
        [dependencyIds]
      );
      tasksMap = tasks.reduce((acc, t) => {
        acc[t.dependency_id] = acc[t.dependency_id] || [];
        acc[t.dependency_id].push(t.task);
        return acc;
      }, {});
    }

    // Final response
    const dependencies = rows.map(r => ({
      id: r.dependency_id,
      okr_id: r.okr_id,
      okr_title: r.okr_title,
      priority: r.okr_priority,
      target_quarter: r.target_quarter,
      owner_id: r.owner_id,
      
      department_id: r.department_id,
      department_name: r.department_name,
      avg_progress: r.avg_progress,
      progres_status: calculateStatus(r.avg_progress),
      tasks: tasksMap[r.dependency_id] || []
    }));

    res.status(200).json({ dependencies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dependencies", error: error.message });
  }
};



export const deleteOkrDependency = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Dependency ID is required" });
    }

    // Check if the dependency exists
    const [existing] = await pool.query(
      "SELECT id FROM okr_dependencies WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Dependency not found" });
    }

    // Delete the dependency (tasks will be deleted via ON DELETE CASCADE)
    await pool.query("DELETE FROM okr_dependencies WHERE id = ?", [id]);

    res.status(200).json({ message: "OKR dependency deleted successfully" });
  } catch (error) {
    console.error("Error deleting OKR dependency:", error);
    res
      .status(500)
      .json({ message: "Error deleting OKR dependency", error: error.message });
  }
};
