const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getOwnerProfile,
  uploadOwnerProfilePhoto,
} = require("../controllers/ownerController");

// ======================================================
// OWNER PROFILE UPLOAD FOLDER
// ======================================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads/owner-profiles"
);

// Create folder automatically if it does not exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const loginId = req.params.loginId;

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const fileName =
      `owner-${loginId}-${Date.now()}${extension}`;

    cb(null, fileName);
  },
});

// ======================================================
// IMAGE FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, and WEBP images are allowed."
      ),
      false
    );
  }
};

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ======================================================
// GET LOGGED-IN OWNER PROFILE
//
// GET /api/owners/profile/:loginId
// ======================================================

router.get(
  "/profile/:loginId",
  getOwnerProfile
);

// ======================================================
// UPLOAD OWNER PROFILE PHOTO
//
// PUT /api/owners/profile/:loginId/photo
//
// FormData field name:
// profilePhoto
// ======================================================

router.put(
  "/profile/:loginId/photo",

  upload.single("profilePhoto"),

  uploadOwnerProfilePhoto
);

// ======================================================
// MULTER ERROR HANDLER
// ======================================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "Profile photo must be smaller than 5 MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to upload profile photo.",
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to upload profile photo.",
    });
  }

  next();
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;