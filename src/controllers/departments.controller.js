import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const { name} = req.body;
    if (!name) return sendError(res, 400, "Department name is required");

    const [result] = await pool.query(
      "INSERT INTO departments (name) VALUES (?)",
      [name]
    );

    return sendResponse(res, 201, "Department created successfully", {
      id: result.insertId,
      name
     
    });
  } catch (error) {
    console.error("Create department failed:", error);
    return sendError(res, 500, "Failed to create department", error.message);
  }
};

// Get all Departments
export const getDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM departments");
    return sendResponse(res, 200, "Departments retrieved successfully", rows);
  } catch (error) {
    console.error("Get departments failed:", error);
    return sendError(res, 500, "Failed to retrieve departments", error.message);
  }
};

// Get Department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM departments WHERE id = ?", [id]);

    if (rows.length === 0) return sendError(res, 404, "Department not found");

    return sendResponse(res, 200, "Department retrieved successfully", rows[0]);
  } catch (error) {
    console.error("Get department failed:", error);
    return sendError(res, 500, "Failed to retrieve department", error.message);
  }
};

// Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM departments WHERE id = ?", [id]);

    if (result.affectedRows === 0) return sendError(res, 404, "Department not found");

    return sendResponse(res, 200, "Department deleted successfully");
  } catch (error) {
    console.error("Delete department failed:", error);
    return sendError(res, 500, "Failed to delete department", error.message);
  }
};
