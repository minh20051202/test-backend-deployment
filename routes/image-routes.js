const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const {
  uploadImageController,
  fetchImagesController,
  deleteImageController,
} = require("../controllers/image-controller");
// upload the image
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single("image"),
  uploadImageController,
  deleteImageController
);

// to get all the images
router.get("/get", authMiddleware, adminMiddleware, fetchImagesController);
router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteImageController
);

module.exports = router;
