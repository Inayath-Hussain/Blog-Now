import user from '@/models/user';
import verificationCode from '@/models/verificationCode';
import { serialize_access, serialize_refresh } from '@/utilities/serialize';
import { compareSync } from 'bcrypt';
import { SignJWT } from 'jose';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

const access_secret = process.env.ACCESS_TOKEN_SECRET
const refresh_secret = process.env.REFRESH_TOKEN_SECRET

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'PUT') {
        const { new_email, old_email, code } = req.body;

        const codeDoc = await verificationCode.findOne({ email: new_email })

        if (!codeDoc) return res.status(400).json({ error: 'code expired' })


        const validate = compareSync(code, codeDoc.code)

        if (!validate) return res.status(400).json({ error: 'Invalid Code' })

        await codeDoc.deleteOne()

        const userDetails = await user.findOne({ email: old_email })

        if (!userDetails) return res.status(400).json({ error: 'user not found' })

        try {
            userDetails.email = new_email;
            const saved = await userDetails.save()
            if (saved) {
                const access_token = await new SignJWT({
                    email: userDetails.email
                }).setIssuedAt().setExpirationTime('1min').setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(access_secret))
                const access_serialized = serialize_access(access_token)

                const refresh_token = await new SignJWT({
                    email: userDetails.email
                }).setIssuedAt().setExpirationTime('30d').setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(refresh_secret))
                const refresh_serialized = serialize_refresh(refresh_token)

                res.setHeader('Set-Cookie', [access_serialized, refresh_serialized])
                return res.status(200).json({ message: 'Email Updated' })
            }

        }
        catch (ex) {
            console.log(ex)
            return res.status(500).json({ error: 'Server error' })
        }

    }
    return res.status(405).json({ error: 'Method not allowed' })
}

export default handler;