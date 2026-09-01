import multer from "multer";

// Use memory storage for Vercel serverless (read-only filesystem)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per image
});

export const uploadImage = upload.array("images", 5); // 'images' is the field name in the form data
export default uploadImage;

// For certificate uploads, allow any file type
const uploadAnyFile = multer({ storage: storage });
export const uploadCertificateFile = uploadAnyFile.single("uploadDocument");
