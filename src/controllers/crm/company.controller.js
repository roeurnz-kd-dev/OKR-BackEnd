import pool from "../../config/db.js";


// CREATE
export const addCompany = async (req, res) => {
  try {
    const {
      name,
      industry,
      email,
      phone,
      number_of_employees,
      annual_revenue,
      address,
      tags,
    } = req.body;

    if (!name) return res.status(400).json({ error: "Company name is required" });

    const [result] = await pool.query(
      `INSERT INTO companies 
       (name, industry, email, phone, number_of_employees, annual_revenue, address, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, industry, email, phone, number_of_employees, annual_revenue, address, tags]
    );

    res.status(201).json({ message: "Company added successfully", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ (All)
export const getCompanies = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM companies ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ (Single)
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM companies WHERE id = ?`, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Company not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      industry,
      email,
      phone,
      number_of_employees,
      annual_revenue,
      address,
      tags,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE companies 
       SET name = ?, industry = ?, email = ?, phone = ?, number_of_employees = ?, 
           annual_revenue = ?, address = ?, tags = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, industry, email, phone, number_of_employees, annual_revenue, address, tags, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Company not found" });

    res.json({ message: "Company updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM companies WHERE id = ?`, [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: "Company not found" });

    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
