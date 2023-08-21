import { useRef, useState } from "react";
import Link from 'next/link';
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import authenticate from "@/utilities/authentication";
import styles from '@/styles/user.module.css';

interface pageProps {
    callbackURL: string
}

const Login = ({ callbackURL }: pageProps): JSX.Element => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const submit = async () => {
        setErrorMsg('');
        const result = await fetch('/api/auth/login', {
            method: 'POST',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                email,
                password
            })
        })

        console.log(result)
        setIsLoading(true)
        const data = await result.json();
        console.log(data)
        if (data.error) {
            setIsLoading(false)
            setErrorMsg(data.error)
            return
        }
        if (data.message) {
            setIsLoading(false)
            router.push(callbackURL)
        }

    }

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') buttonRef.current?.click()
    }

    return (
        <div className={styles.register_flex}>
            <div className={styles.register_container}>

                {errorMsg && <div className={styles.register_error_container}>
                    <p className="register-error p-2">{errorMsg}</p>
                </div>}



                <label htmlFor="email">Email</label>
                <input type="email" name='email' placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />



                <label htmlFor="password">Password</label>
                <input type="password" name="password" placeholder="password" onKeyDown={e => handleEnter(e)} value={password} onChange={(e) => setPassword(e.target.value)} />

                <span className={styles.link_container}>
                    <Link href={`/user/register?callback=${callbackURL}`}>Register ?</Link>
                </span>

                <button ref={buttonRef} style={email && password ? undefined : { cursor: 'not-allowed' }}
                    onClick={submit} disabled={email && password ? false : true}>{isLoading ? 'loading...' : 'Login'}</button>
            </div>
        </div>
    );
}

export default Login;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const callbackURL = context.query.callback || '/';
    console.log(callbackURL)
    const access_token = context.req.cookies['AccessToken'];
    const refresh_token = context.req.cookies['RefreshToken'];

    const { cookies, current_user } = await authenticate({ access_token, refresh_token })

    if (cookies.length > 0) {
        console.log('index...', [...cookies])
        context.res.setHeader('Set-Cookie', [...cookies])
    }

    if (current_user) {
        return {
            redirect: {
                permanent: false,
                destination: callbackURL,
            },
            props: {
                user: current_user
            },
        };
    }
    return {
        props: {
            user: '',
            callbackURL
        }
    }
}