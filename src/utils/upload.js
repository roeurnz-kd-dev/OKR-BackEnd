import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType = "auto"; // auto handles images, pdf, csv, excel
    return {
      folder: "reports",
      resource_type: resourceType,
      public_id: Date.now() + "-" + file.originalname.split(".")[0],
    };
  },
});

const upload = multer({ storage });

export default upload;
