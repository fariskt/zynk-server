const multer = require("multer")
const cloudinary = require("../config/cloudinary")
const {CloudinaryStorage}= require("multer-storage-cloudinary")

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "post-uploads",
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
})

const postUpload = multer({storage: storage})

module.exports = postUpload