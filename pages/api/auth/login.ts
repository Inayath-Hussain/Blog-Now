import { compare, genSalt, hash } from 'bcrypt'
import { SignJWT } from 'jose';
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { serialize_access, serialize_profilePicUrl, serialize_refresh } from '@/utilities/serialize';

const access_secret = process.env.ACCESS_TOKEN_SECRET
const refresh_secret = process.env.REFRESH_TOKEN_SECRET

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {

    const { method } = req;
    const { email, password } = req.body;
    const cookies: string[] = []

    await dbConnect();

    switch (method) {
        case 'POST':
            await dbConnect();

            let user = await User.findOne({ email })

            if (!user) return res.status(400).json({ error: "Email doesn't exists" })

            const validate = await compare(password, user.password)

            if (!validate) return res.status(400).json({ error: "Password doesn't match" })

            const access_token = await new SignJWT({
                email: user.email
            }).setIssuedAt().setExpirationTime('1min').setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(access_secret))
            const access_serialized = serialize_access(access_token)
            cookies.push(access_serialized)

            const refresh_token = await new SignJWT({
                email: user.email
            }).setIssuedAt().setExpirationTime('30d').setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(refresh_secret))
            const refresh_serialized = serialize_refresh(refresh_token)
            cookies.push(refresh_serialized)

            if (user.profilePicture?.url) {
                const profilePicUrl_serialized = serialize_profilePicUrl(user.profilePicture.url)
                cookies.push(profilePicUrl_serialized)
            }

            res.setHeader('Set-Cookie', cookies)

            return res.status(200).json({ message: 'Success' })

        // try {
        //     const users = await User.find()
        //     console.log(users)
        //     res.status(200).json(users)
        // }
        // catch (error) {
        //     console.log(error)
        //     res.status(400).json({ error: true })
        // }
    }
}

export default handler;