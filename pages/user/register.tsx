import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import authenticate from "@/utilities/authentication";
import styles from '@/styles/user.module.css';
import Image from "next/image";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import { jwtVerify } from "jose";

interface IPageProps {
    callbackURL: string,
    new_user?: boolean,
    current_user?: string
}

const Register = ({ callbackURL, new_user, current_user }: IPageProps): JSX.Element => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(current_user || '');
    const [password, setPassword] = useState('');
    const imageRef = useRef<HTMLInputElement>()
    const [profilePic, setProfilePic] = useState<File>();
    const [preview, setPreview] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [registered, setRegistered] = useState(new_user || false);
    const router = useRouter()

    const register = async () => {
        setErrorMsg('');
        console.log('submit')
        const result = await fetch('/api/auth/register', {
            method: 'POST',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                username,
                email,
                password
            })
        })

        console.log(result)
        const data = await result.json();
        console.log(data)
        if (data.error) {
            setErrorMsg(data.error)
            return
        }
        // router.push(callbackURL)
        setRegistered(true)
    }

    const selectImg = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            console.log(e.target.files)
            setProfilePic(e.target.files[0])
            setPreview(URL.createObjectURL(e.target.files[0]))
        }
    }

    const submit = async () => {
        if (profilePic) {
            console.log('pofile pic chosen', profilePic)
            const file = new FormData()

            file.append('image', profilePic)
            file.append('user', email)

            const result = await fetch('/api/image/uploadProfilePicture', {
                method: 'POST',
                body: file
            })
            const data = await result.json()
            if (data.error) {
                setErrorMsg('Error Occurred! Please try to set your profile picture later')
                setTimeout(() => {
                    router.push(callbackURL)
                }, 3000)
            }

            router.push(callbackURL)
            console.log(data)


            // upload photo and then redirect - API call where uploads to s3 and then
            // on error display msg
        }
    }

    const skip = async () => {
        console.log('skip')
        router.push(callbackURL)
    }

    return (
        <div className={styles.register_flex}>
            {registered ?
                <div className={styles.register_container}>

                    <h2 className={styles.h2}>Choose Profile Picture</h2>

                    <Image src={preview ? preview : '/Profile_Picture.svg'} alt="" width='300' height='300' className={styles.img} />

                    {/* <svg role="img" height="150" width="150" aria-hidden="true" viewBox="0 0 15 25" data-encore-id="icon"><path d="M6.233.371a4.388 4.388 0 0 1 5.002 1.052c.421.459.713.992.904 1.554.143.421.263 1.173.22 1.894-.078 1.322-.638 2.408-1.399 3.316l-.127.152a.75.75 0 0 0 .201 1.13l2.209 1.275a4.75 4.75 0 0 1 2.375 4.114V16H.382v-1.143a4.75 4.75 0 0 1 2.375-4.113l2.209-1.275a.75.75 0 0 0 .201-1.13l-.126-.152c-.761-.908-1.322-1.994-1.4-3.316-.043-.721.077-1.473.22-1.894a4.346 4.346 0 0 1 .904-1.554c.411-.448.91-.807 1.468-1.052zM8 1.5a2.888 2.888 0 0 0-2.13.937 2.85 2.85 0 0 0-.588 1.022c-.077.226-.175.783-.143 1.323.054.921.44 1.712 1.051 2.442l.002.001.127.153a2.25 2.25 0 0 1-.603 3.39l-2.209 1.275A3.25 3.25 0 0 0 1.902 14.5h12.196a3.25 3.25 0 0 0-1.605-2.457l-2.209-1.275a2.25 2.25 0 0 1-.603-3.39l.127-.153.002-.001c.612-.73.997-1.52 1.052-2.442.032-.54-.067-1.097-.144-1.323a2.85 2.85 0 0 0-.588-1.022A2.888 2.888 0 0 0 8 1.5z"></path></svg> */}

                    <input type="file" accept="image/*" onChange={(e) => selectImg(e)} />

                    <div className={styles.flex}>
                        <button onClick={submit} className={styles.submit}>Submit</button>
                        <button onClick={skip} className={styles.skip_now}> Skip for now</button>
                    </div>
                </div>

                :

                <div className={styles.register_container}>

                    {errorMsg && <div className={styles.register_error_container}>
                        <p className={styles.register_error}>{errorMsg}</p>
                    </div>}

                    <label htmlFor="username">Username</label>
                    <input maxLength={32} type="text" name='username' placeholder='username' value={username} onChange={(e) => setUsername(e.target.value)} />



                    <label htmlFor="email">Email</label>
                    <input type="email" name='email' placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />



                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {/* <p>Error</p> */}

                    <span className={styles.link_container}>
                        <Link href={`/user/login?callback=${callbackURL}`}>LogIn ?</Link>
                    </span>

                    <button style={username && email && password ? undefined : { cursor: 'not-allowed' }}
                        onClick={register} disabled={username && email && password ? false : true}>Register</button>
                </div>
            }
        </div>
    );
}

export default Register;


export const getServerSideProps = async ({ req, res, query }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<IPageProps>> => {
    const callbackURL = query.callback as string || '/';
    const access_token = req.cookies['AccessToken'];
    const refresh_token = req.cookies['RefreshToken'];
    const new_user_token = req.cookies['NewUserToken'];
    const new_user_secret = process.env.NEW_USER_SECRET

    const verify_new_user_token = async (new_user_token: string) => {
        try {
            const res = await jwtVerify(new_user_token, new TextEncoder().encode(new_user_secret))
            if (res) {
                return true
            }
        } catch (ex) {
            console.log('register...verify new user....', ex)
            return false
        }
    }

    const { cookies, current_user } = await authenticate({ access_token, refresh_token })

    if (cookies.length > 0) {
        console.log('index...', [...cookies])
        res.setHeader('Set-Cookie', [...cookies])
    }

    if (current_user) {
        if (new_user_token && await verify_new_user_token(new_user_token)) {
            return {
                props: {
                    callbackURL,
                    new_user: true,
                    current_user
                }
            }
        }
        return {
            redirect: {
                permanent: false,
                destination: callbackURL,
            }
        };
    }

    return {
        props: {
            callbackURL
        },
    }
}