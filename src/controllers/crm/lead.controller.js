import pool from "../../config/db.js";

export const addLead = async (req, res) => {
  try {
    const { name, company, email, phone, lead_source, status, notes, owner } = req.body;

    const [result] = await pool.query(
      `INSERT INTO leads 
        (name, company, email, phone, lead_source, status, notes, owner) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, company || null, email || null, phone || null, lead_source || null, status || "New", notes || null, owner || null]
    );

    res.json({
      id: result.insertId,
      name,
      company,
      email,
      phone,
      lead_source,
      status,
      notes,
      owner,
    });
  } catch (err) {
    console.error("Add Lead failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getLeads = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         l.*, 
         u.name AS owner_name,
         CASE 
           WHEN d.id IS NOT NULL THEN true
           ELSE false
         END AS deal_status
       FROM leads l
       LEFT JOIN users u ON l.owner = u.id
       LEFT JOIN opportunities d ON l.id = d.lead_id
       ORDER BY l.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get lead by ID
export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT l.*, u.name as owner_name
       FROM leads l
       LEFT JOIN users u ON l.owner = u.id
       WHERE l.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update lead (full update)
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    if (!id) {
      return res.status(400).json({ error: "Lead ID is required" });
    }

    // If nothing sent, don't run query
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Build only the fields sent in request
    const allowedFields = [
      "name",
      "company",
      "email",
      "phone",
      "lead_source",
      "status",
      "notes",
      "owner"
    ];

    const updates = [];
    const values = [];

    for (const key of Object.keys(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    const [result] = await pool.query(
      `UPDATE leads SET ${updates.join(", ")} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({
      message: "Lead updated successfully",
      id,
      updatedFields: fields
    });
  } catch (err) {
    console.error("Error updating lead:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete lead
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM leads WHERE id = ?", [id]);
    await pool.query("DELETE FROM opportunities WHERE lead_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Update lead status

export const updateleadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.query(
      `UPDATE leads SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({ message: "Lead status updated successfully", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};