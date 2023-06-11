import verify from "./verify"
import refresh from "./refresh"

interface Isuccess {
    new_access_token: string,
    new_refresh_token: string,
    user: string
}

const currentUser = async (access_token: string, refresh_token: string) => {

    const result = await verify(access_token)

    if (result?.user) return { user: result.user }

    console.log('currentUser...', result?.error)
    if (result?.error === 'JWTExpired') {

        const refresh_result = await refresh(refresh_token)

        if (refresh_result?.error) return { error: 'Invalid Refresh Token' }

        if (refresh_result?.new_access_token && refresh_result?.user) {

            if (refresh_result?.new_refresh_token) {
                return {
                    new_access_token: refresh_result.new_access_token,
                    new_refresh_token: refresh_result.new_refresh_token,
                    user: refresh_result.user
                }
            }
            else {
                return {
                    new_access_token: refresh_result.new_access_token,
                    user: refresh_result.user
                }
            }
        }
    }

    return { error: 'Invalid Access Token' }
}

export default currentUser;