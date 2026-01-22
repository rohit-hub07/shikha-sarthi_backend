const { cloudinary } = require('../config/cloudinary');

exports.upload = async (req, res, next) => {
  try {
    // console.log("request: ",req);
    // console.log("req.file: ", req.file);
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No file provided!",
        success: false,
      });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "shikha",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    return res.status(200).json({
      message: "Media Uploaded Successfully!",
      success: true,
      mediaUrl: result.secure_url,
      mediaType: result.resource_type,
    });
  } catch (err) {
    next(err);
  }
};
