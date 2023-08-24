import { NextApiRequest, NextApiResponse, NextConfig } from "next";
import formidable from "formidable";
import { Document, Types } from 'mongoose'
import fs from 'fs';
import User, { IUserSchema } from "@/models/user";
import dbConnect from "@/lib/mongodb";
import { upload, deleteImg, deleteImgs } from "@/utilities/s3";
import { delete_profilePicUrl, serialize_profilePicUrl } from "@/utilities/serialize";
import { SignJWT } from "jose";

export const config = {
    api: {
        bodyParser: false
    }
}

type Iparma = Document<unknown, {}, IUserSchema> & Omit<IUserSchema & { _id: Types.ObjectId }, never>

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

                    await dbConnect();

                    console.log(files.image !== undefined)
                    const key = (files.image !== undefined) ? 'Profile Picture/' + fields.user + '/' + Date.now() + files.image.originalFilename :
                        ''


                    try {
                        const userDetails = await User.findOne({ email: fields.user })
                        if (!userDetails) return res.status(400).json({ error: 'no user found' })

                        // if key exists then removed first
                        console.log('changeProfilePicture.....', userDetails.profilePicture)
                        if (userDetails.profilePicture?.key) {
                            const deleted = await deleteImgs([userDetails.profilePicture.key])
                            console.log('deleted..........', deleted)
                        }


                        if (files.image !== undefined) {
                            const uploaded = await upload(key, files.image.filepath)

                            if (uploaded) {
                                console.log(uploaded)

                                if (userDetails && userDetails.profilePicture) {
                                    userDetails.profilePicture.key = key
                                    userDetails.profilePicture.url = uploaded.Location
                                    try {
                                        await userDetails.save()
                                        const profilePicUrl_serialized = serialize_profilePicUrl(userDetails.profilePicture.url || '')

                                        res.setHeader('Set-Cookie', [profilePicUrl_serialized])
                                        return resolve({ status: 200, message: 'success' })

                                    } catch (ex) {
                                        console.log('profilePic save error...', ex)
                                        resolve({ status: 500, error: 'ProfilePic save error' })
                                    }
                                }
                            }
                        }


                        // if file is empty then set empty string
                        if (userDetails.profilePicture) {
                            userDetails.profilePicture.key = ''
                            userDetails.profilePicture.url = ''

                            await userDetails.save()
                            const profilePicUrl_serialized = delete_profilePicUrl()
                            res.setHeader('Set-Cookie', [profilePicUrl_serialized])
                            resolve({ status: 200, message: 'success' })
                        }
                        console.log('files...', files.image)
                        console.log('fields...', fields)



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