import multer from "multer";
import path from "path";

// Set up multer for uploading the image to the local filesystem (total of 5 image array we will upload)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export const uploadImage = upload.array("images", 5); // 'images' is the field name in the form data
export default uploadImage;

// For certificate uploads, allow any file type
const uploadAnyFile = multer({ storage: storage });
export const uploadCertificateFile = uploadAnyFile.single("uploadDocument");
