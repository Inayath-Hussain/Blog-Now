import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import dbConnect from "@/lib/mongodb";
import draft from "@/models/draft";
import { deleteImgs, upload } from "@/utilities/s3";
import images from "@/models/images";

export const config = {
    api: {
        bodyParser: false
    }
}

interface Iresult {
    status: number,
    error?: string,
    message?: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'PUT') {
        const form = formidable();
        const { status, error, message } = await new Promise<Iresult>(resolve => {
            form.parse(req, async (err, fields, files: any) => {
                if (err) {
                    console.log('parser error...', err)
                    resolve({ status: 500, error: 'parser error' })
                }
                const { draft_id, owner, title, content, coverImage } = fields
                if (coverImage === '') {
                    console.log('fields.....', draft_id, owner, coverImage)
                }
                console.log('files......', Object.keys(files).length)

                await dbConnect();

                try {
                    const user_draft = await draft.findById(draft_id)


                    if (user_draft) {
                        user_draft.title = title ? title as string : user_draft.title
                        // images removal from content
                        if (content) {
                            const draft_images = await images.findOne({ draft_id })
                            if (draft_images && draft_images?.images.length > 0) {
                                const images_to_remove = draft_images.images.filter(v => !(content.includes(v.url)))
                                const keys: string[] = []
                                images_to_remove.forEach(v => keys.push(v.key))
                                const result = await deleteImgs(keys)

                                draft_images.images = draft_images.images.filter(v => !keys.includes(v.key))
                                await draft_images.save()
                            }
                        }
                        user_draft.content = content ? content as string : user_draft.content

                        if (Object.keys(files).length > 0 || coverImage === '') {
                            try {

                                // deleting coverImage
                                if (user_draft.coverImage?.key && user_draft.coverImage?.url) {
                                    const deleted = await deleteImgs([user_draft.coverImage.key])

                                    // when coverImage is removed
                                    if (coverImage === '' && deleted) {

                                        user_draft.coverImage.key = ''
                                        user_draft.coverImage.url = ''
                                        const saved = await user_draft.save()
                                        if (saved) {
                                            return resolve({ status: 200, message: 'success' })
                                        }
                                    }
                                }

                                // when coverImage is swapped or added
                                const key = 'CoverImage/' + owner + '/' + Date.now() + files.coverImage.originalFilename
                                try {
                                    const uploaded = await upload(key, files.coverImage.filepath)
                                    if (uploaded && user_draft.coverImage?.key !== undefined && user_draft.coverImage?.url !== undefined) {

                                        user_draft.coverImage.key = key
                                        user_draft.coverImage.url = uploaded.Location
                                        const saved = await user_draft.save()
                                        if (saved) {

                                            resolve({ status: 200, message: 'success' })
                                        }
                                    }
                                } catch (ex) {
                                    console.log('upload error update API', ex)
                                    resolve({ status: 500, error: 's3 save error' })
                                }


                            } catch (ex) {
                                console.log('Draft Update API.....', ex)
                                resolve({ status: 500, error: 'Internal Server Error' })
                            }

                        }
                        else {
                            user_draft.save()
                            resolve({ status: 200, message: 'success' })
                        }
                    }

                } catch (ex) {
                    console.log('draft/update...api', ex)
                    resolve({ status: 500, error: 'Internal Server Error' })
                }

            })
        })
        if (error) {
            res.status(status).json(error)
        }
        if (message) {
            res.status(status).json(message)
        }
    }
    else {
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
}

export default handler;








// upload(key, files.coverImage.filepath, async (er: any, d: any) => {
//     if (er) {
//         console.log('er...', er)
//         return res.status(500).json({ error: 's3 save error' })
//     }

//     if (user_draft.coverImage?.key && user_draft.coverImage?.url) {
//         user_draft.coverImage.key = key
//         user_draft.coverImage.url = d.Location
//         const saved = await user_draft.save()
//         if (saved) {
//             console.log('when image is swapped or image is added')
//             return res.status(204).json({ message: 'success' })
//         }
//     }
// })