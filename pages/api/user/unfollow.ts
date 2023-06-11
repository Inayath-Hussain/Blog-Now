import dbConnect from "@/lib/mongodb";
import user from "@/models/user";
import { NextApiRequest, NextApiResponse } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'PUT') {
        try {
            const { user_id, blogger_id } = req.body;
            await dbConnect();

            const userDetail = await user.findById(user_id)
            if (userDetail) {
                userDetail.following = userDetail.following.filter(v => v !== blogger_id)
                const saved = await userDetail.save()

                if (saved) {
                    return res.status(200).json({ message: 'success' })
                }
            }
            else {
                return res.status(400).json({ error: 'No user found' })
            }
        } catch (ex) {
            console.log('User Follow API', ex)
            return res.status(500).json({ error: 'Internal Server Error' })
        }
    }
    else {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }
}

export default handler;