import createModel from '@/utilities/createModel';
import mongoose from 'mongoose';

interface DocumentResult<T> {
    _doc: Omit<T, '_doc'>
}

export interface IVerificationSchema extends DocumentResult<IVerificationSchema> {
    email: string
    code: string
    createdAt: Date
}

type VerificationModel = mongoose.Model<IVerificationSchema, {}>

const verificationSchema = new mongoose.Schema<IVerificationSchema, VerificationModel>({
    email: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
})

export default createModel<IVerificationSchema, VerificationModel>('verification', verificationSchema)