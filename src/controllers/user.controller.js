import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { sendError, sendResponse } from '../utils/response.js';

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, role, password, active_status } = req.body;

    if (!name || !email) {
      return sendError(res, 400, "Name & email are required");
    }

    // Hash password only if provided
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.query(
      `INSERT INTO users (name, email, role, password, active_status) VALUES (?, ?, ?, ?, ?)`,
      [name, email, role || "user", hashedPassword, active_status ?? true]
    );

    return sendResponse(res, 201, "User registered successfully", {
      user_id: result.insertId,
      name,
      email,
      role: role || "user",
      active_status: active_status ?? true
    });

  } catch (error) {
    console.error("Register user failed:", error);
    return sendError(res, 500, "Failed to register user", error.message);
  }
};
// Get all users
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name, email, role, active_status, created_at, updated_at FROM users`);
    return sendResponse(res, 200, "Users retrieved successfully", rows);
  } catch (error) {
    console.error("Get users failed:", error);
    return sendError(res, 500, "Failed to retrieve users", error.message);
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT id, name, email, role, active_status, created_at, updated_at FROM users WHERE id = ?`, [id]);

    if (rows.length === 0) return sendError(res, 404, "User not found");

    return sendResponse(res, 200, "User retrieved successfully", rows[0]);
  } catch (error) {
    console.error("Get user failed:", error);
    return sendError(res, 500, "Failed to retrieve user", error.message);
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, active_status } = req.body;

    // First check if user exists
    const [users] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (users.length === 0) {
      return sendError(res, 404, "User not found");
    }

    const existingUser = users[0];

    let query = `UPDATE users SET name = ?, email = ?`;
    let values = [
      name ?? existingUser.name,
      email ?? existingUser.email,
    ];

    // Only update active_status if provided, otherwise keep old value
    if (active_status !== undefined) {
      query += `, active_status = ?`;
      values.push(active_status);
    }

    // Only update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      values.push(hashedPassword);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return sendError(res, 404, "User not found");
    }

    return sendResponse(res, 200, "User updated successfully", {
      id,
      name: name ?? existingUser.name,
      email: email ?? existingUser.email,
      active_status: active_status ?? existingUser.active_status,
    });
  } catch (error) {
    console.error("Update user failed:", error);
    return sendError(res, 500, "Failed to update user", error.message);
  }
};


// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);

    if (result.affectedRows === 0) return sendError(res, 404, "User not found");

    return sendResponse(res, 200, "User deleted successfully");
  } catch (error) {
    console.error("Delete user failed:", error);
    return sendError(res, 500, "Failed to delete user", error.message);
  }
};
