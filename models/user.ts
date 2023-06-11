import createModel from '@/utilities/createModel';
import mongoose from 'mongoose';

interface DocumentResult<T> {
    _doc: Omit<T, '_doc'>
}

export interface IUserSchema extends DocumentResult<IUserSchema> {
    username: string,
    email: string,
    password: string,
    profilePicture?: {
        key: string,
        url: string
    },
    saved_blogs: string[],
    joined_on: Date,
    followers: number,
    following: string[]
}

type UserModel = mongoose.Model<IUserSchema, {}>

const userSchema = new mongoose.Schema<IUserSchema, UserModel>({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        key: {
            type: String
        },
        url: {
            type: String
        }
    },
    saved_blogs: {
        type: [String]
    },
    joined_on: {
        type: Date,
        required: true
    },
    followers: {
        type: Number
    },
    following: {
        type: [String]
    }
})

// const userModel = mongoose.model<IUserSchema>('user', userSchema)

// export const User = (mongoose.models.user as typeof userModel) || userModel

export default createModel<IUserSchema, UserModel>('user', userSchema)
