import currentUser from "./CurrentUser"
import refresh from "./refresh"
import { delete_access, delete_refresh, serialize_access, serialize_refresh } from './serialize';

interface Iparams {
    access_token: string | undefined,
    refresh_token: string | undefined
}

const authenticate = async ({ access_token, refresh_token }: Iparams) => {
    let current_user = ''
    let cookies = []
    if (refresh_token) {
        if (access_token) {
            const { new_access_token, error, new_refresh_token, user } = await currentUser(access_token, refresh_token)
            if (error) {
                if (new_access_token) {
                    const access_serialized = delete_access()
                    cookies.push(access_serialized)
                }
                if (new_refresh_token) {
                    const refresh_serialized = delete_refresh()
                    cookies.push(refresh_serialized)
                }
            }

            if (user) {
                current_user = user;

                if (new_access_token) {
                    const access_serialized = serialize_access(new_access_token)
                    cookies.push(access_serialized)
                }
                if (new_refresh_token) {
                    const refresh_serialized = serialize_refresh(new_refresh_token)
                    cookies.push(refresh_serialized)
                }
            }
        }
        else {
            const refresh_result = await refresh(refresh_token);
            if (refresh_result?.error) {
                console.log(refresh_result.error)
            }

            if (refresh_result?.new_access_token && refresh_result?.user) {
                current_user = refresh_result.user

                const access_serialized = serialize_access(refresh_result.new_access_token)
                cookies.push(access_serialized)

                if (refresh_result?.new_refresh_token) {
                    const refresh_serialized = serialize_refresh(refresh_result.new_refresh_token)
                    cookies.push(refresh_serialized)
                }
            }
        }
    }
    return {
        cookies,
        current_user
    }
}

export default authenticate;