import { S3 } from "aws-sdk";
import { NextApiRequest, NextApiResponse, NextConfig } from "next";
import formidable from "formidable";
import fs from 'fs';
import User from "@/models/user";
import dbConnect from "@/lib/mongodb";
// import s3_bucket from "@/utilities/s3";
import { upload } from "@/utilities/s3";
import { serialize_profilePicUrl } from "@/utilities/serialize";
import { SignJWT } from "jose";

export const config = {
    api: {
        bodyParser: false
    }
}

// const s3_bucket = new S3({
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY as string,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
//     }
// })

const refresh_secret = process.env.REFRESH_TOKEN_SECRET

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method === 'POST') {
        const form = formidable();
        const { status, error, message } = await new Promise<{ status: number, error?: string, message?: string }>(resolve => {
            form.parse(req, async (err, fields, files: any) => {
                if (err) {
                    console.log('parser error...', err)
                    resolve({ status: 500, error: 'parser error' })
                }

                if (process.env.AWS_BUCKET_NAME) {

                    const key = 'Profile Picture/' + fields.user + '/' + Date.now() + files.image.originalFilename

                    try {
                        const uploaded = await upload(key, files.image.filepath)

                        if (uploaded) {


                            await dbConnect();

                            const user = await User.findOne({ email: fields.user })
                            if (user && user.profilePicture) {
                                user.profilePicture.key = key
                                user.profilePicture.url = uploaded.Location
                                try {
                                    await user.save()
                                    const profilePicUrl_serialized = serialize_profilePicUrl(user.profilePicture.url || '')

                                    res.setHeader('Set-Cookie', [profilePicUrl_serialized])
                                    resolve({ status: 200, message: 'success' })

                                } catch (ex) {
                                    console.log('profilePic save error...', ex)
                                    resolve({ status: 500, error: 'ProfilePic save error' })
                                }
                            }
                        }

                    } catch (ex) {
                        console.log('upload profile picture api...', ex)
                        resolve({ status: 500, error: 'Internal Server Error' })
                    }

                }
                else {
                    resolve({ status: 500, error: 'Unable to load AWS_BUCKET_NAME env' })
                }
            })
        })

        if (error) {
            res.status(status).json({ error })
        }
        if (message) {
            res.status(status).json({ message })
        }
    }

    // return res.status(500).json({ error: "formidable didn't run" })
}

export default handler;