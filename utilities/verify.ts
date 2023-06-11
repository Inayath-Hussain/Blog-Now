// import { getServerSideProps } from "@/pages/blogs";
import { jwtVerify, JWTPayload } from "jose"
import { Ipayload } from "@/interfaces"

const access_secret = process.env.ACCESS_TOKEN_SECRET
const refresh_secret = process.env.REFRESH_TOKEN_SECRET

export default async function verify(access_token: string) {
    try {
        const { payload }: { payload: Ipayload } = await jwtVerify(access_token, new TextEncoder().encode(access_secret))
        console.log(payload)

        if (payload?.email) {
            return { user: payload.email }
        }
    } catch (ex: any) {
        console.log('verify..', ex)
        return { error: ex.name }
    }
}