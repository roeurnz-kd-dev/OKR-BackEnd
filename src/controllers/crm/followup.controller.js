import pool from "../../config/db.js";

export const createFollowup = async (req, res) => {
  try {
    let { lead_id, deal_id, user_id, description, due_date, status, priority } = req.body;

    // If user_id is not provided, determine owner from linked lead (via lead_id or deal_id)
    if (!user_id) {
      // Try to get lead_id from deal if only deal_id is present
      if (deal_id && !lead_id) {
        const [dealRows] = await pool.query(
          "SELECT lead_id FROM opportunities WHERE id = ?",
          [deal_id]
        );
        if (dealRows.length > 0) {
          lead_id = dealRows.lead_id;
        }
      }
      // If lead_id is now available, get owner from leads
      if (lead_id) {
        const [leadRows] = await pool.query(
          "SELECT owner FROM leads WHERE id = ?",
          [lead_id]
        );
        if (leadRows.length > 0) {
          user_id = leadRows.owner;
        }
      }
    }

    const [result] = await pool.query(
      `INSERT INTO followups (lead_id, deal_id, user_id, description, due_date, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [lead_id || null, deal_id || null, user_id || null, description, due_date, status || 'Pending', priority ]
    );

    res.status(201).json({ message: "Follow-up created", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Error creating follow-up", error: error.message });
  }
};

export const getFollowups = async (req, res) => {
  try {
    const { lead_id, deal_id } = req.query;

    // Build where clause dynamically
    let whereClause = "";
    let params = [];

    if (lead_id && deal_id) {
      whereClause = "WHERE f.lead_id = ? AND f.deal_id = ?";
      params.push(lead_id, deal_id);
    } else if (lead_id) {
      whereClause = "WHERE f.lead_id = ?";
      params.push(lead_id);
    } else if (deal_id) {
      whereClause = "WHERE f.deal_id = ?";
      params.push(deal_id);
    }

    const [rows] = await pool.query(
      `
      SELECT 
        f.id AS followup_id,
        f.description,
        f.due_date,
        f.status,
        f.deal_id,
        f.lead_id,
        f.priority,
        f.user_id AS created_by_id,
        cu.name AS created_by_name,
        
        -- Deal / Lead info
        COALESCE(d.id, l.id) AS entity_id,
        COALESCE(d.stage, '') AS deal_stage,
        COALESCE(l.name, d.lead_name, '') AS lead_name,
         l.company AS company,
        
        -- Owner (fallback: deal.owner → lead.owner)
        COALESCE(d.owner, l.owner) AS owner_id,
        COALESCE(du.name, lu.name, 'Unassigned') AS owner_name
        
      FROM followups f
      LEFT JOIN opportunities d ON f.deal_id = d.id
      LEFT JOIN leads l ON COALESCE(f.lead_id, d.lead_id) = l.id
      LEFT JOIN users du ON d.owner = du.id
      LEFT JOIN users lu ON l.owner = lu.id
      LEFT JOIN users cu ON f.user_id = cu.id
      ${whereClause}
      ORDER BY f.due_date ASC
      `,
      params
    );

    res.status(200).json({ status: true, data: rows });
  } catch (error) {
    console.error("Error fetching followups:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching followups",
      error: error.message,
    });
  }
};


export const updateFollowup = async (req, res) => {
  try {
    const { id } = req.params;
    const { lead_id, deal_id, user_id, description, due_date, status } = req.body;

    // Build dynamic update query
    const fields = [];
    const params = [];

    if (lead_id !== undefined) {
      fields.push("lead_id = ?");
      params.push(lead_id);
    }
    if (deal_id !== undefined) {
      fields.push("deal_id = ?");
      params.push(deal_id);
    }
    if (user_id !== undefined) {
      fields.push("user_id = ?");
      params.push(user_id);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      params.push(description);
    }
    if (due_date !== undefined) {
      fields.push("due_date = ?");
      params.push(due_date);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      params.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    params.push(id);

    const [result] = await pool.query(
      `UPDATE followups SET ${fields.join(", ")} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Follow-up not found" });
    }

    res.status(200).json({ message: "Follow-up updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating follow-up", error: error.message });
  }
};

export const getFollowupById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        f.id AS followup_id,
        f.description,
        f.due_date,
        f.status,
        f.deal_id,
        f.lead_id,
        f.priority,
        f.user_id AS created_by_id,
        cu.name AS created_by_name,
        
        COALESCE(d.id, l.id) AS entity_id,
        COALESCE(d.stage, '') AS deal_stage,
        COALESCE(l.name, d.lead_name, '') AS lead_name,
         l.company AS lead_company,
        
        COALESCE(d.owner, l.owner) AS owner_id,
        COALESCE(du.name, lu.name, 'Unassigned') AS owner_name
        
      FROM followups f
      LEFT JOIN opportunities d ON f.deal_id = d.id
      LEFT JOIN leads l ON COALESCE(f.lead_id, d.lead_id) = l.id
      LEFT JOIN users du ON d.owner = du.id
      LEFT JOIN users lu ON l.owner = lu.id
      LEFT JOIN users cu ON f.user_id = cu.id
      WHERE f.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Follow-up not found" });
    }

    res.status(200).json({ status: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching follow-up", error: error.message });
  }
};


export const deleteFollowup = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM followups WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Follow-up not found" });
    }

    res.status(200).json({ message: "Follow-up deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting follow-up", error: error.message });
  }
};
