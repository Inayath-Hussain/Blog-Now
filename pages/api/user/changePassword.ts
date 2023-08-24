import dbConnect from '@/lib/mongodb';
import user from '@/models/user';
import { compareSync, genSalt, hash, hashSync } from 'bcrypt';
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
    if (req.method === 'PUT') {
        const { currentPassword, newPassword, email } = req.body;
        if (!currentPassword || !email || !newPassword) return res.status(400).json({ error: 'request body is missing parameters' })

        await dbConnect();

        const userDetails = await user.findOne({ email })

        if (!userDetails) return res.status(400).json({ error: 'user not found' })

        const verified = compareSync(currentPassword, userDetails.password)

        if (!verified) return res.status(400).json({ error: 'current password is incorrect' })
        try {

            const salt = await genSalt(10)
            const hashedPassword = hashSync(newPassword, salt)
            userDetails.password = hashedPassword
            const saved = await userDetails.save()
            if (saved) return res.status(200).json({ message: 'success' })
        }
        catch (ex) {
            console.log('changePassword....', ex)

            return res.status(500).json({ error: 'server error' })
        }
    }
    return res.status(405).json({ error: 'method not allowed' });
}

export default handler;