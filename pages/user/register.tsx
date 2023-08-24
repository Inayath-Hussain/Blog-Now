import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import authenticate from "@/utilities/authentication";
import styles from '@/styles/user.module.css';
import Image from "next/image";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import { sendMail } from '@/utilities/sendMail'
import { jwtVerify } from "jose";
import ProfilePictureCard from "@/components/register/profilePic";
import VerificationCard from "@/components/register/verification";

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
    const [showVerification, setShowVerification] = useState(false);
    const [registered, setRegistered] = useState(new_user || false);
    const router = useRouter();

    // use this for register here
    // const sendMail = async () => {
    //     console.log('verify mf.')

    //     const result = await fetch('/api/auth/sendCode', {
    //         method: 'POST',
    //         headers: new Headers({
    //             'content-type': 'application/json'
    //         }),
    //         body: JSON.stringify({ to: email, username })
    //     })
    //     const data = await result.json()

    //     console.log('result...', result)
    //     console.log('data....', data)

    //     if (data.error) {
    //         setErrorMsg(data.error)
    //         return
    //     }
    //     setShowVerification(true)
    // }

    // pass this to verificationCard component
    const register = async (code: string) => {
        if (code.length !== 4) return console.log(code)
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
                password,
                code
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
                <ProfilePictureCard preview={preview} selectImg={selectImg} skip={skip} submit={submit} />
                :

                showVerification ?
                    <VerificationCard email={email} register={register} />

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
                            onClick={() => sendMail({ to: email, username, setErrorMsg, setShowVerification })}
                            disabled={username && email && password ? false : true}>Register</button>
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