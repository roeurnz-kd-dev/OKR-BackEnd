// controllers/opportunity.controller.js

import pool from "../../config/db.js";


// Add Opportunity
export const addOpportunity = async (req, res) => {
  try {
    const { lead_id, deal_value, probability, expected_close_date } = req.body;

    // Basic validation
    if (!lead_id || !deal_value || !probability || !expected_close_date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the lead already has a deal
    const [existing] = await pool.query(
      `SELECT id FROM opportunities WHERE lead_id = ? LIMIT 1`,
      [lead_id]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "This lead already has an associated deal." });
    }

    // Insert new opportunity
    const [result] = await pool.query(
      `INSERT INTO opportunities 
        (lead_id, deal_value, probability, expected_close_date, created_at, updated_at, stage) 
       VALUES (?, ?, ?, ?, NOW(), NOW(), ?)`,
      [lead_id, deal_value, probability, expected_close_date, "Qualification"]
    );

    res.status(201).json({
      message: "Lead added to pipeline successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error adding opportunity:", err);
    res.status(500).json({ error: err.message });
  }
};


export const getOpportunities = async (req, res) => {
  try {
    // GET /api/opportunities
    const [rows] = await pool.query(`
      SELECT 
        o.id, 
        o.deal_value, 
        o.probability, 
        o.expected_close_date,
        o.stage,
        o.lead_id,
        
        l.name AS lead_name, 
        l.email AS lead_email, 
        l.phone AS lead_phone, 
        l.company AS lead_company,
        u.name AS owner_name
      FROM opportunities o
      JOIN leads l ON o.lead_id = l.id
      LEFT JOIN users u ON l.owner = u.id
      ORDER BY FIELD(stage, 'Qualification','Meeting','Proposal','Closing','Won','Lost')
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateStage = async( req, res) => {
   try {
    const { id} = req.params; // opportunity id
       const { stage } = req.body;

       // Basic validation
       if (!id || !stage) {
           return res.status(400).json({ error: "ID and stage are required" });
       }

       const [result] = await pool.query(
           `UPDATE opportunities SET stage = ?, updated_at = NOW() WHERE id = ?`,
           [stage, id]
       );

       if (result.affectedRows === 0) {
           return res.status(404).json({ error: "Opportunity not found" });
       }

       res.json({ message: "Stage updated successfully" });
   } catch (err) {
       console.error("Error updating stage:", err);
       res.status(500).json({ error: err.message });
   }
}


// Delete Opportunity (Deal) Only
export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params; // opportunity id

    // Basic validation
    if (!id) {
      return res.status(400).json({ error: "Opportunity ID is required" });
    }

    // Delete the opportunity (deal)
    const [result] = await pool.query(
      `DELETE FROM opportunities WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    res.json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    console.error("Error deleting opportunity:", err);
    res.status(500).json({ error: err.message });
  }
};


// Update Opportunity (Deal)
export const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params; // opportunity id
    const { deal_value, probability, expected_close_date, stage } = req.body;

    // Validation: ensure ID is provided
    if (!id) {
      return res.status(400).json({ error: "Opportunity ID is required" });
    }

    // Build dynamic query (only update provided fields)
    let updates = [];
    let values = [];

    if (deal_value !== undefined) {
      updates.push("deal_value = ?");
      values.push(deal_value);
    }
    if (probability !== undefined) {
      updates.push("probability = ?");
      values.push(probability);
    }
    if (expected_close_date !== undefined) {
      updates.push("expected_close_date = ?");
      values.push(expected_close_date);
    }
    if (stage !== undefined) {
      updates.push("stage = ?");
      values.push(stage);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id); // for WHERE clause

    const [result] = await pool.query(
      `UPDATE opportunities SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    res.json({ message: "Opportunity updated successfully" });
  } catch (err) {
    console.error("Error updating opportunity:", err);
    res.status(500).json({ error: err.message });
  }
};

