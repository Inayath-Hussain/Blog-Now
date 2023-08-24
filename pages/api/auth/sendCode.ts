import bcrypt from 'bcrypt';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/mongodb';
import verificationCode from '@/models/verificationCode';
import { generateVerificationCode } from '@/utilities/generateVerificationCode';
import { sendVerificationCode } from '@/utilities/sendVerificationCode';
import User from '@/models/user';

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {

    const { method } = req;
    const { to, username, resend } = req.body;

    if (method === 'POST') {
        await dbConnect();

        let user = await User.findOne({ email: to })

        if (user) return res.status(400).json({ error: 'Email already exists' })

        const record = await verificationCode.findOne({ email: to })

        if (!record || resend) {
            const code = generateVerificationCode()

            const salt = await bcrypt.genSalt(4)
            const hashed_code = await bcrypt.hash(code, salt)

            const new_record = new verificationCode({
                code: hashed_code,
                email: to,
                createdAt: new Date()
            })
            new_record.save();

            const { message, error } = await sendVerificationCode(to, username, code)

            if (error) return res.status(500).json({ error: 'Error in sending mail' })

            if (message) return res.status(200).json({ message: 'success' })
        }

        return res.status(200).json({ message: 'verification code already sent' })

    }

    return res.status(405).json({ error: 'method not allowed' });
}

export default handler;