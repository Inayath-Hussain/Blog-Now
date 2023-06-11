import dbConnect from "@/lib/mongodb";
import blog from "@/models/blog";
import user from "@/models/user";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { owner, title, coverImage, content } = req.body;

        await dbConnect();

        const ownerDetails = await user.findById(owner)


        if (ownerDetails) {
            const new_blog = new blog({
                owner: ownerDetails._id,
                title,
                coverImage: coverImage || { key: '', url: '' },
                content,
                posted_on: Date.now()
            })

            const saved = await new_blog.save()
            if (saved) {
                return res.status(200).json({ id: saved._id })
            }
        }
    }
    return res.status(405).json({ error: 'Method Not Allowed' })
}

export default handler;