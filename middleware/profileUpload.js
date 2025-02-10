const multer = require("multer")
const cloudinary = require("../config/cloudinary")
const {CloudinaryStorage}= require("multer-storage-cloudinary")

const profilePicStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile_pictures",
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
})

const profilePictureUpload = multer({storage: profilePicStorage})

module.exports = profilePictureUpload