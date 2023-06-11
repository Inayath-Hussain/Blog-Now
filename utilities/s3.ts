import { S3 } from 'aws-sdk';
import fs from 'fs';

const s3_bucket = new S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
})

export const upload = async (key: string, path: string) => {

    // if(process.env.AWS_BUCKET_NAME){
    return s3_bucket.upload({
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: key,
        Body: fs.createReadStream(path),
        ACL: 'public-read'
    }).promise()
    // }
}

export const deleteImg = (key: string, callback_func: any) => {
    s3_bucket.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: key
    }, callback_func)
}

interface Ikey {
    Key: string
}

export const deleteImgs = async (keys: string[]) => {
    const object_keys: Ikey[] = keys.map(key => ({ Key: key }))

    return s3_bucket.deleteObjects({
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Delete: { Objects: object_keys }
    }).promise()
}