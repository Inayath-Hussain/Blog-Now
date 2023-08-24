import { SignJWT, jwtVerify } from "jose";
import { Ipayload } from "@/interfaces";

const access_secret = process.env.ACCESS_TOKEN_SECRET
const refresh_secret = process.env.REFRESH_TOKEN_SECRET

export default async function refresh(refresh_token: string) {

    try {
        const { payload }: { payload: Ipayload } = await jwtVerify(refresh_token, new TextEncoder().encode(refresh_secret))
        if (payload.iat) {
            const issuedAt = new Date(payload.iat * 1000)
            const user = payload.email

            try {

                const new_access_token = await new SignJWT({
                    email: user
                }).setIssuedAt().setExpirationTime('1min').setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(access_secret))


                if (issuedAt.getDate() !== new Date().getDate()) {
                    try {

                        const new_refresh_token = await new SignJWT({ email: user }).setIssuedAt().setExpirationTime('30d').setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(refresh_secret))

                        return { new_refresh_token, new_access_token, user }
                    } catch (ex) {
                        console.log("Couldn't generate refresh token", ex)
                        return { error: "Couldn't generate refresh token" }
                    }
                }

                return { new_access_token, user }
            } catch (ex) {
                console.log("Couldn't generate access token", ex)
                return { error: "Couldn't generate access token" }
            }
        }

    } catch (ex) {
        console.log('refresh...', ex)
        return { error: 'Invalid Token' }
    }
}