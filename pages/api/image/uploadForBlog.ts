import { S3 } from 'aws-sdk';
import formidable from "formidable";
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from "next"
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
// import s3_bucket from '@/utilities/s3';
import { upload } from '@/utilities/s3';
import draft from '@/models/draft';
import images from '@/models/images';

export const config = {
    api: {
        bodyParser: false
    }
}

interface Iresult {
    status: number,
    error?: string,
    url?: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method === 'POST') {
        const form = formidable()
        const { status, error, url } = await new Promise<Iresult>(resolve => {
            form.parse(req, async (err, fields, files: any) => {
                if (err) {
                    console.log('parser error...', err)
                    resolve({ status: 500, error: 'parser error' })
                }

                const key = 'Draft/' + fields.user + '/' + Date.now() + files.image.originalFilename

                try {
                    await dbConnect();
                    const blog_images = await images.findOne({ draft_id: fields.draft_id })

                    if (blog_images) {
                        const uploaded = await upload(key, files.image.filepath)
                        if (uploaded) {
                            blog_images.images.push({ key, url: uploaded.Location })
                            const saved = await blog_images.save()

                            if (saved) {
                                resolve({ status: 200, url: uploaded.Location })
                            }
                        }
                    }
                } catch (ex) {
                    console.log('upload for blog API...', ex)
                    resolve({ status: 500, error: 's3 save error' })
                }

            })
        })

        if (error) {
            return res.status(status).json(error)
        }
        if (url) {
            console.log(url)
            return res.status(status).json(url)
        }
    }
}

export default handler;