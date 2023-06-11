import createModel from "@/utilities/createModel";
import mongoose from "mongoose";

// to use in the frontend
export interface IDraft {
    owner: string,
    name: string,
    coverImage?: {
        key: string,
        url: string
    },
    title?: string,
    content?: string
}

interface IDraftSchema {
    owner: string,
    name: string,
    coverImage?: {
        key: string,
        url: string
    },
    title?: string,
    content?: string
}

type IDraftModel = mongoose.Model<IDraftSchema, {}>

const draftSchema = new mongoose.Schema<IDraftSchema, IDraftModel>({
    owner: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    coverImage: {
        type: {
            _id: false,
            key: {
                type: String
            },
            url: {
                type: String
            }
        }
    },
    title: {
        type: String
    },
    content: {
        type: String
    }
})

// const Draft = mongoose.models.draft || mongoose.model('draft', draftSchema)
// export default Draft;

export default createModel<IDraftSchema, IDraftModel>('draft', draftSchema)