import Cookies from 'cookie';

export const serialize_access = (access_token: string) => {
    return Cookies.serialize('AccessToken', access_token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60,
        secure: process.env.NODE_ENV !== 'development',
        path: '/'
    })
}

export const serialize_refresh = (refresh_token: string) => {
    return Cookies.serialize('RefreshToken', refresh_token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV !== 'development',
        path: '/'
    })
}

export const serialize_new_user = (new_user_token: string) => {
    return Cookies.serialize('NewUserToken', new_user_token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30 * 12,
        secure: process.env.NODE_ENV !== 'development',
        path: '/'
    })
}

export const serialize_profilePicUrl = (url_token: string) => {
    return Cookies.serialize('ProfilePicture', url_token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV !== 'development',
        path: '/'
    })
}

export const delete_access = () => {
    return Cookies.serialize('AccessToken', '', {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: -1,
        secure: process.env.NODE_ENV !== 'development',
        path: '/'
    })
}

export const delete_refresh = () => {
    return Cookies.serialize('RefreshToken', '', {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: -1,
        secure: process.env.NODE_ENV !== 'development',
        path: '/'
    })
}

export const delete_new_user_cookie = () => {
    return Cookies.serialize('NewUserToken', '', {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: -1,
        secure: process.env.NODE_ENV !== 'development',
        path: '/'
    })
}

export const delete_profilePicUrl = () => {
    return Cookies.serialize('ProfilePicture', '', {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: -1,
        secure: process.env.NODE_ENV !== 'development',
        path: '/'
    })
}