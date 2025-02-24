import multer from "multer"
import cloudinary from "../config/cloudinary.js"
import {CloudinaryStorage} from "multer-storage-cloudinary"

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "post-uploads",
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
})

const postUpload = multer({storage: storage})

export default postUpload