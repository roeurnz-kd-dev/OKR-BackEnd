import pool from "../config/db.js";



export const updateKeyResultProgress = async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  if (progress === undefined) {
    return res.status(400).json({ message: "Progress is required" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE key_results SET progress = ? WHERE id = ?`,
      [progress, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Key result not found" });
    }

    res.json({ message: "Key result progress updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating key result progress" });
  }
};
