import createModel from "@/utilities/createModel";
import mongoose from "mongoose";

interface IimageSchema {
    draft_id: string,
    images: {
        key: string,
        url: string
    }[]
}

type ImageModel = mongoose.Model<IimageSchema, {}>

const imagesSchema = new mongoose.Schema<IimageSchema, ImageModel>({
    draft_id: {
        type: String,
        required: true
    },
    images: {
        type: [{
            _id: false,
            key: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }],
        required: true
    }
})


export default createModel<IimageSchema, ImageModel>('image', imagesSchema)