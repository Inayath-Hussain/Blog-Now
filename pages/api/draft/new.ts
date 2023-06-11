import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Draft from "@/models/draft";
import images from "@/models/images";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method === 'POST') {
        const { owner, name } = req.body;

        await dbConnect();

        const draft = new Draft({
            owner,
            name,
            title: '',
            content: '',
            coverImage: {
                key: '',
                url: ''
            }
        });

        try {
            const r = await draft.save()
            if (r) {
                const draft_images = new images({
                    draft_id: r._id
                })
                const i = await draft_images.save()
                i._id.toString()
                if (i) {
                    return res.status(201).json({ message: 'success', id: i.draft_id })
                }
            }
        } catch (ex) {
            console.log('new draft api.....', ex)
            return res.status(500).json({ error: 'Internal Server Error' })
        }
    }
}

export default handler;