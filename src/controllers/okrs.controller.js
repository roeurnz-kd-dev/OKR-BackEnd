import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";

// Create OKR
export const createOkr = async (req, res) => {
  try {
    const { title, description, type, target_quarter, progress, owner_id, created_by } = req.body;

    if (!title || !type || !target_quarter) {
      return sendError(res, 400, "Title, type, and target_quarter are required");
    }

    const [result] = await pool.query(
      `INSERT INTO okrs (title, description, type, target_quarter, progress, owner_id, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, type, target_quarter, progress || 0, owner_id, created_by]
    );

    return sendResponse(res, 201, "OKR created successfully", {
      id: result.insertId,
      title,
      description,
      type,
      target_quarter,
      progress: progress || 0,
      owner_id,
      created_by
    });

  } catch (error) {
    console.error("Create OKR failed:", error);
    return sendError(res, 500, "Failed to create OKR", error.message);
  }
};

// Get all OKRs
export const getOkrs = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM okrs");
    return sendResponse(res, 200, "OKRs retrieved successfully", rows);
  } catch (error) {
    console.error("Get OKRs failed:", error);
    return sendError(res, 500, "Failed to retrieve OKRs", error.message);
  }
};

// Get single OKR by ID
export const getOkrById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM okrs WHERE id = ?", [id]);

    if (rows.length === 0) return sendError(res, 404, "OKR not found");

    return sendResponse(res, 200, "OKR retrieved successfully", rows[0]);
  } catch (error) {
    console.error("Get OKR failed:", error);
    return sendError(res, 500, "Failed to retrieve OKR", error.message);
  }
};

// Delete OKR
export const deleteOkr = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM okrs WHERE id = ?", [id]);
    await pool.query("DELETE FROM key_results WHERE okr_id = ? ", [id])
    if (result.affectedRows === 0) return sendError(res, 404, "OKR not found");

    return sendResponse(res, 200, "OKR deleted successfully");
  } catch (error) {
    console.error("Delete OKR failed:", error);
    return sendError(res, 500, "Failed to delete OKR", error.message);
  }
};
