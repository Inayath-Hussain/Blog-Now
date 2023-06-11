import dbConnect from "@/lib/mongodb";
import user from "@/models/user";
import { NextApiRequest, NextApiResponse } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'PUT') {
        const { user_id, blog_id }: { user_id: string, blog_id: string } = req.body;
        try {
            await dbConnect();
            const user_data = await user.findById(user_id);
            user_data?.saved_blogs.push(blog_id)
            const saved = await user_data?.save();

            if (saved) {
                return res.status(200).json({ message: 'success' })
            }
        } catch (ex) {
            console.log('save users saved blog API...', ex)
            return res.status(500).json({ error: 'Internal Server Error' })
        }

    }
    else {
        res.status(405).json({ error: 'Method Not Allowed' })
    }
}

export default handler;