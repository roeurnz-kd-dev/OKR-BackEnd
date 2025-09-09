 import pool from  "../config/db.js";

    import cloudinary from "cloudinary";
    import fs from 'fs';

cloudinary.config({
  cloud_name: "dflse5uml",
  api_key: "968877372139259",
  api_secret: "LdDm3phJvG3ZkRKUU6FkJA87BLo",
});


export const createBulkCompanyOkrs = async (req, res) => {
  try {
    const okrs = req.body.okrs ? JSON.parse(req.body.okrs) : [];
    const filesMap = {};

    if (req.files) {
      req.files.forEach((file) => {
        filesMap[file.fieldname] = file;
      });
    }

    const created_by = req.user?.id || 1;

    if (!Array.isArray(okrs) || okrs.length === 0) {
      return res.status(400).json({ message: "At least one OKR is required" });
    }

    const insertedOkrs = [];

    for (let okrIndex = 0; okrIndex < okrs.length; okrIndex++) {
      let { title, description, type, target_quarter, owner_id, owner_name, department_id, department_name, key_results = [] } =
        okrs[okrIndex];

      if (!title || !target_quarter) continue;

      // ✅ If owner_name is provided, resolve it to id
      if (!owner_id && owner_name) {
        const [rows] = await pool.query(
          `SELECT id FROM users WHERE name = ?`,
          [owner_name]
        );
        if (rows.length > 0) {
          owner_id = rows[0].id;
        } else {
          owner_id = null; // or you can skip inserting
        }
      }

     // ✅ If department_name is provided, resolve it to id
      if (!department_id && department_name) {
        const [deptRows] = await pool.query(
          `SELECT id FROM departments WHERE name = ?`,
          [department_name]
        );
        if (deptRows.length > 0) {
          department_id = deptRows[0].id;
        } else {
          department_id = null;
        }
      }

      // Insert OKR
      const [okrResult] = await pool.query(
        `INSERT INTO okrs (title, description, type, target_quarter, owner_id, department_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, type, target_quarter, owner_id || null, department_id || null, created_by]
      );
      const okrId = okrResult.insertId;
     

      // Upload images for key_results
      for (let krIndex = 0; krIndex < key_results.length; krIndex++) {
        const kr = key_results[krIndex];
        const file = filesMap[`okr_${okrIndex}_key_result_image_${krIndex}`];

        if (file) {
          const uploadResult = await cloudinary.v2.uploader.upload(file.path, {
            resource_type: "auto",
            folder: "company_okrs",
          });

          kr.image = uploadResult.secure_url;
          fs.unlinkSync(file.path);
        }
      }

      // Insert key_results
      const krPromises = key_results.map((kr) => {
        const progress = kr.progress ?? (Math.floor(Math.random() * 4) * 10 + 60);
        return pool.query(
          `INSERT INTO key_results (okr_id, title, progress, image) VALUES (?, ?, ?, ?)`,
          [okrId, kr.title, progress, kr.image || null]
        );
      });
      await Promise.all(krPromises);

      insertedOkrs.push({ okr_id: okrId, title });
    }

    res.status(201).json({
      message: "Bulk company OKRs created successfully",
      okrs: insertedOkrs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating bulk company OKRs" });
  }
};

