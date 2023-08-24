import { IncomingMessage } from "http"
import { NextApiRequestCookies } from "next/dist/server/api-utils"
import authenticate from "./authentication"
import { delete_new_user_cookie } from './serialize';

interface Iparams {
    req: IncomingMessage & {
        cookies: NextApiRequestCookies
    }
}

const commonGetServerSidePropsFunc = async ({ req }: Iparams) => {
    const access_token = req.cookies['AccessToken']
    const refresh_token = req.cookies['RefreshToken']
    const profilePicUrl = req.cookies['ProfilePicture'] || ''
    const new_user = req.cookies['NewUserToken']
    let new_user_cookie = ''

    if (new_user) {

        const cookie = delete_new_user_cookie()
        new_user_cookie = cookie
    }

    const { cookies, current_user } = await authenticate({ access_token, refresh_token })
    cookies.push(new_user_cookie)

    return {
        cookies,
        current_user,
        profilePicUrl
    }
}

export default commonGetServerSidePropsFunc