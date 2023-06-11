import createModel from "@/utilities/createModel";
import mongoose from "mongoose";
import { IUserSchema } from "./user";

const commentSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
})

interface DocumentResult<T> {
    _doc: Omit<T, '_doc'>
}

interface IuserRef extends IUserSchema {
    _id: mongoose.ObjectId
}

export interface IBlogSchema extends DocumentResult<IBlogSchema> {
    owner: IuserRef,
    posted_on: Date
    coverImage?: {
        key: string,
        url: string
    },
    title: string,
    content: string
}

type BlogModel = mongoose.Model<IBlogSchema, {}>

const blogSchema = new mongoose.Schema<IBlogSchema, BlogModel>({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    posted_on: {
        type: Date,
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
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // comments: {
    //     type: [commentSchema]
    // },
    // likes: {
    //     type: Number,
    //     required: true
    // }
})

export default createModel<IBlogSchema, BlogModel>('blog', blogSchema)