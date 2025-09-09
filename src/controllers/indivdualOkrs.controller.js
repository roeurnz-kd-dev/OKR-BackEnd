    import pool from  "../config/db.js";
      import cloudinary from "cloudinary";
        import fs from 'fs';
    
    cloudinary.config({
      cloud_name: "dflse5uml",
      api_key: "968877372139259",
      api_secret: "LdDm3phJvG3ZkRKUU6FkJA87BLo",
    });
    

// CREATE Individual OKR (with multiple key results)
export const createIndividualOkr = async (req, res) => {
  const { title, description, target_quarter, owner_id } = req.body;
   const key_results = req.body.key_results ? JSON.parse(req.body.key_results) : [];

  const created_by = req.user?.id || 1; // assume logged in user or fallback

     const filesMap = {};
    if (req.files) {
      req.files.forEach((file) => {
        filesMap[file.fieldname] = file;
      });
    }

  if (!title || !target_quarter) {
    return res.status(400).json({ message: "Title and target_quarter are required" });
  }

  try {
    // Insert OKR
    const [okrResult] = await pool.query(
      `INSERT INTO okrs (title, description, type, target_quarter, owner_id, created_by)
       VALUES (?, ?, 'individual', ?, ?, ?)`,
      [title, description, target_quarter, owner_id || null, created_by]
    );

    const okrId = okrResult.insertId;

     for (let idx = 0; idx < key_results.length; idx++) {
          const kr = key_results[idx];
          const file = filesMap[`key_result_image_${idx}`];
    
          if (file) {
            // Upload local file to Cloudinary
            const uploadResult = await cloudinary.v2.uploader.upload(file.path, {
              resource_type: "auto",
              folder: "company_okrs" // optional folder in Cloudinary
            });
    
            kr.image = uploadResult.secure_url;
    
            // Remove file from local uploads folder
            fs.unlinkSync(file.path);
          }
        }
    

    // Insert key results if provided
    if (Array.isArray(key_results) && key_results.length > 0) {

      const krPromises = key_results.map(kr => {
     const progress = kr.progress ?? (Math.floor(Math.random() * 4) * 10 + 60);
        return pool.query( `INSERT INTO key_results (okr_id, title, progress, image) VALUES (?, ?, ?, ?)`,
        [okrId, kr.title, progress, kr.image || null]);
      });
      await Promise.all(krPromises);
    }

    res.status(201).json({ message: "Individual OKR created successfully", okr_id: okrId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating individual OKR" });
  }
};

// READ all Individual OKRs (with key results)
export const getIndividualOkrs = async (req, res) => {
  try {
    // Join users table to fetch owner name
    const [okrs] = await pool.query(
      `SELECT o.*, u.name AS owner_name
       FROM okrs o
       LEFT JOIN users u ON o.owner_id = u.id
       WHERE o.type = 'individual'
       ORDER BY o.created_at DESC`
    );

    const [keyResults] = await pool.query(`SELECT * FROM key_results`);

    // attach key results to each OKR
    const data = okrs.map(okr => {
      const krList = keyResults.filter(kr => kr.okr_id === okr.id);
      return { ...okr, key_results: krList };
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching company OKRs" });
  }
};


// GET single Individual OKR
export const getIndividualOkrById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[okr]] = await pool.query(
      `SELECT * FROM okrs WHERE id = ? AND type = 'individual'`,
      [id]
    );

    if (!okr) {
      return res.status(404).json({ message: "Individual OKR not found" });
    }

    const [keyResults] = await pool.query(`SELECT * FROM key_results WHERE okr_id = ?`, [id]);

    res.json({ ...okr, key_results: keyResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching company OKR" });
  }
};

// DELETE Individual OKR (and its key results)
export const deleteIndividualOkr = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM key_results WHERE okr_id = ?`, [id]);
    const [result] = await pool.query(`DELETE FROM okrs WHERE id = ? AND type = 'individual'`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Individual OKR not found" });
    }

    res.json({ message: "Individual OKR deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting company OKR" });
  }
};
