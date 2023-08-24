import createModel from "@/utilities/createModel";
import mongoose from "mongoose";
import { IUserSchema } from "./user";

interface IuserRef extends IUserSchema {
    _id: mongoose.ObjectId
}

export interface IDraftSchema {
    owner: IuserRef,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
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