const Image = require("../models/Image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const cloudinary = require("../config/cloudinary");
const uploadImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    // store image info in database
    const newlyUploadedImage = new Image({
      url: url,
      publicId: publicId,
      uploadedBy: req.userInfo.userId,
    });

    await newlyUploadedImage.save();

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newlyUploadedImage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while uploading image. Please try again.",
    });
  }
};

const fetchImagesController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sortByObj = {};
    sortByObj[sortBy] = sortOrder;

    const totalImages = await Image.countDocuments({});
    const totalPages = Math.ceil(totalImages / limit);
    const images = await Image.find({}).sort(sortByObj).skip(skip).limit(limit);
    if (images) {
      res.status(200).json({
        success: true,
        totalPages: totalPages,
        currentPage: page,
        images: images,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while uploading image. Please try again.",
    });
  }
};

const deleteImageController = async (req, res) => {
  try {
    const getImageId = req.params.id;
    const userId = req.userInfo.userId;
    const imageToBeDeleted = await Image.findById(getImageId);

    if (!imageToBeDeleted) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // check if this image is uploaded by the current user who is trying to delete
    if (imageToBeDeleted.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this image because you are not the owner",
      });
    }

    // delete this image first from cloudianry
    await cloudinary.uploader.destroy(imageToBeDeleted.publicId);

    await Image.findByIdAndDelete(getImageId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  uploadImageController,
  fetchImagesController,
  deleteImageController,
};
