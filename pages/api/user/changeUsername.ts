import dbConnect from '@/lib/mongodb';
import user from '@/models/user';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const handler: NextApiHandler = async (req, res) => {

    if (req.method === 'PUT') {
        const { email, username } = req.body;

        if (!email || !username) return res.status(400).json({ error: 'email or username is missing' })

        await dbConnect();

        const userDetails = await user.findOne({ email })

        if (!userDetails) return res.status(400).json({ error: "user doesn't exist" })

        try {
            userDetails.username = username
            const saved = await userDetails.save()

            if (saved) return res.status(200).json({ message: 'success' })
        }
        catch (ex) {
            console.log('changeUsername....', ex)
            return res.status(500).json({ error: 'Server Error' })
        }
    }

    return res.status(405).json({ error: 'method not allowed' });
}

export default handler;