import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { genSalt, hash } from 'bcrypt';
import User from '@/models/user';
import dbConnect from "@/lib/mongodb";
import { SignJWT } from "jose";
import { serialize_access, serialize_refresh, serialize_new_user, serialize_profilePicUrl } from "@/utilities/serialize";

const access_secret = process.env.ACCESS_TOKEN_SECRET
const refresh_secret = process.env.REFRESH_TOKEN_SECRET
const new_user_secret = process.env.NEW_USER_SECRET

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;
    const { username, email, password } = req.body;
    const profilePicture = {
        key: '',
        url: ''
    }

    switch (method) {
        case 'POST':
            await dbConnect();

            let user = await User.findOne({ email })

            if (user) return res.status(400).json({ error: 'Email already exists' })

            user = new User({
                username,
                email,
                password,
                profilePicture,
                joined_on: Date.now(),
                followers: 0
            })

            const salt = await genSalt(10);
            user.password = await hash(user.password, salt);

            try {
                console.log(user)
                const r = await user.save()

                if (r) {
                    const access_token = await new SignJWT({
                        email: user.email
                    }).setIssuedAt().setExpirationTime('1min').setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(access_secret))
                    const access_serialized = serialize_access(access_token)

                    const refresh_token = await new SignJWT({
                        email: user.email
                    }).setIssuedAt().setExpirationTime('30d').setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(refresh_secret))
                    const refresh_serialized = serialize_refresh(refresh_token)

                    const new_user_token = await new SignJWT({
                        new_user_email: user.email
                    }).setIssuedAt().setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(new_user_secret))
                    const new_user_serialized = serialize_new_user(new_user_token)


                    res.setHeader('Set-Cookie', [access_serialized, refresh_serialized, new_user_serialized])
                    return res.status(200).json({ message: 'Success' })
                }

            } catch (ex) {
                console.log(ex)
                return res.status(500).json({ error: 'Something went wrong try again later' })
            }

    }
}

export default handler;