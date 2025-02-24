import cloudinary  from "../config/cloudinary.js"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"


const profilePicturesStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req,file)=> {
        let folder = "others"
        if(file.fieldname === "profilePicture"){
            folder = "profile_pictures"
        }else if(file.fieldname === "coverPhoto"){
            folder = "cover_photos"
        }
        return {
            folder: folder,
            allowed_formats: ["jpg", "jpeg","png", "gif", "webp"],
            public_id: `${file.originalname.split(".")[0]}-${Date.now()}}`,
        }
    }
})

const profilePicturesUpload = multer({storage: profilePicturesStorage})

export default profilePicturesUpload