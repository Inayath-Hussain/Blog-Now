import dbConnect from '@/lib/mongodb';
import blog from '@/models/blog';
import draft from '@/models/draft';
import images from '@/models/images';
import user from '@/models/user';
import { deleteImgs } from '@/utilities/s3';
import { delete_access, delete_profilePicUrl, delete_refresh } from '@/utilities/serialize';
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
    if (req.method === 'DELETE') {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'email is missing' })
        console.log(email);

        await dbConnect();

        const userDetails = await user.findOne({ email })
        if (!userDetails) return res.status(400).json({ error: "user doesn't exist" })

        let keys: string[] = []
        let draftIds: string[] = []

        if (userDetails.profilePicture?.key) keys.push(userDetails.profilePicture.key)

        // get all drafts and delete images first then use deleteOne
        const drafts = await draft.find({ owner: userDetails._id })
        drafts.forEach(draft => {
            if (draft.coverImage?.key) keys.push(draft.coverImage.key)
            draftIds.push(draft._id.toString())
            // delete draft here
        })

        const allImages = await images.find({ draft_id: { '$in': draftIds } })

        allImages.forEach(image => {
            image.images.forEach(i => {
                keys.push(i.key)
                // delete image here

            })
        })

        const deletedImages = await images.deleteMany({ draft_id: { '$in': draftIds } })

        if (deletedImages) await draft.deleteMany({ owner: userDetails._id })

        // get all blogs and delete images first then use deleteOne
        const blogs = await blog.find({ owner: userDetails._id })
        blogs.forEach(blog => {
            if (blog.coverImage?.key) keys.push(blog.coverImage.key)
        })
        await blog.deleteMany({ owner: userDetails._id })

        keys = [... new Set(keys)]
        console.log('keys....', keys)


        const deletedImgs = await deleteImgs(keys)

        await userDetails.deleteOne()

        const cookies = <string[]>[]
        cookies.push(delete_access())
        cookies.push(delete_refresh())
        cookies.push(delete_profilePicUrl())

        res.setHeader('Set-Cookie', [...cookies])
        return res.status(200).json({ message: 'success' })
    }

    return res.status(405).json({ error: 'method not allowed' });
}

export default handler;