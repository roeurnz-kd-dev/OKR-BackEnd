import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";
import cloudinary from "cloudinary";

// Hardcoded Cloudinary config
cloudinary.config({
  cloud_name: "dflse5uml",
  api_key: "968877372139259",
  api_secret: "LdDm3phJvG3ZkRKUU6FkJA87BLo",
});

export const createKeyResult = async (req, res) => {
  try {
    const { okr_id, title, progress, created_by } = req.body;
    if (!okr_id || !title) return res.status(400).json({ message: "OKR ID and title are required" });

    let image = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
      image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const [dbResult] = await pool.query(
      "INSERT INTO key_results (okr_id, title, progress, created_by, image) VALUES (?, ?, ?, ?, ?)",
      [okr_id, title, progress || 0, created_by, image]
    );

    res.status(201).json({
      message: "Key Result created successfully",
      data: {
        id: dbResult.insertId,
        okr_id,
        title,
        progress: progress || 0,
        created_by,
        image
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create key result", error: error.message });
  }
};
// Get all Key Results
export const getKeyResults = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM key_results");
    return sendResponse(res, 200, "Key Results retrieved successfully", rows);
  } catch (error) {
    console.error("Get key results failed:", error);
    return sendError(res, 500, "Failed to retrieve key results", error.message);
  }
};

// Get Key Result by ID
export const getKeyResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM key_results WHERE id = ?", [id]);

    if (rows.length === 0) return sendError(res, 404, "Key Result not found");

    return sendResponse(res, 200, "Key Result retrieved successfully", rows[0]);
  } catch (error) {
    console.error("Get key result failed:", error);
    return sendError(res, 500, "Failed to retrieve key result", error.message);
  }
};

// Delete Key Result
export const deleteKeyResult = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM key_results WHERE id = ?", [id]);

    if (result.affectedRows === 0) return sendError(res, 404, "Key Result not found");

    return sendResponse(res, 200, "Key Result deleted successfully");
  } catch (error) {
    console.error("Delete key result failed:", error);
    return sendError(res, 500, "Failed to delete key result", error.message);
  }
};
