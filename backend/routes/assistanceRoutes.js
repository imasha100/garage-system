const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  registerAssistance,
  getAllAssistances,
  getAssistanceById,
  getAssistanceProfileByLoginId,
  updateAssistance,
  updateAssistanceShiftStatus,
  uploadAssistanceProfilePhoto,
  changeAssistancePassword,
} = require("../controllers/assistanceController");

// ======================================================
// ASSISTANCE PROFILE PHOTO UPLOAD CONFIG
// ======================================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "assistance-profiles"
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
    const uniqueName =
      `assistance-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`;

    const extension =
      path.extname(file.originalname);

    cb(
      null,
      `${uniqueName}${extension}`
    );
  },
});

// ======================================================
// FILE FILTER
// Only image files
// ======================================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP image files are allowed."
      ),
      false
    );
  }
};

// ======================================================
// MULTER UPLOAD
// ======================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});

// ======================================================
// REGISTER ASSISTANCE OFFICER
//
// POST /api/assistances
// ======================================================

router.post(
  "/assistances",
  registerAssistance
);

// ======================================================
// GET ALL ASSISTANCE OFFICERS
//
// GET /api/assistances
// Optional:
// ?garageId=1
// ======================================================

router.get(
  "/assistances",
  getAllAssistances
);

// ======================================================
// GET LOGGED-IN ASSISTANCE PROFILE
//
// GET /api/assistances/profile/:loginId
// ======================================================

router.get(
  "/assistances/profile/:loginId",
  getAssistanceProfileByLoginId
);

// ======================================================
// UPLOAD ASSISTANCE PROFILE PHOTO
//
// PUT /api/assistances/:id/photo
//
// form-data:
// profilePhoto = image file
// ======================================================

router.put(
  "/assistances/:id/photo",
  upload.single("profilePhoto"),
  uploadAssistanceProfilePhoto
);

// ======================================================
// UPDATE ASSISTANCE SHIFT STATUS
//
// PUT /api/assistances/:id/shift-status
// ======================================================

router.put(
  "/assistances/:id/shift-status",
  updateAssistanceShiftStatus
);

// ======================================================
// CHANGE ASSISTANCE PASSWORD
//
// PUT /api/assistances/:id/change-password
//
// Body:
// {
//   "currentPassword": "Assist@123456",
//   "newPassword": "NewPass@123"
// }
// ======================================================

router.put(
  "/assistances/:id/change-password",
  changeAssistancePassword
);

// ======================================================
// GET SINGLE ASSISTANCE OFFICER
//
// GET /api/assistances/:id
// ======================================================

router.get(
  "/assistances/:id",
  getAssistanceById
);

// ======================================================
// UPDATE ASSISTANCE OFFICER
//
// PUT /api/assistances/:id
// ======================================================

router.put(
  "/assistances/:id",
  updateAssistance
);

// ======================================================
// MULTER ERROR HANDLER
// ======================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Profile photo must be smaller than 5 MB.",
          });
      }

      return res
        .status(400)
        .json({
          success: false,
          message:
            error.message ||
            "Profile photo upload failed.",
        });
    }

    if (error) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            error.message ||
            "Profile photo upload failed.",
        });
    }

    next();
  }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;