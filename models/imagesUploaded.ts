import mongoose from "mongoose";

const UploadedImageSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    images: {
        type: [String]
    }
})

const UploadedImage = mongoose.models.UploadedImage || mongoose.model('UploadedImage', UploadedImageSchema)
export default UploadedImage;