import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import WriteIcon from "./icons/write";

interface Iprops {
    user: string,
    profilePicUrl: string
}

const NavBar = (props: Iprops) => {
    const router = useRouter();
    const [search, setSearch] = useState('');

    if (router.pathname === '/user/login' || router.pathname === '/user/register') return null

    const logout = async () => {
        const result = await fetch('/api/auth/logout')
        if (result.status === 200) {
            router.reload()
        }
    }

    const callback_url = () => {
        const url = router.pathname
        const start_index = url.indexOf('[')
        if (start_index === -1) {
            return url
        }
        const end_index = url.indexOf(']')
        const query = router.query[url.slice(start_index + 1, end_index) || ''] as string
        return url.replace(/\[(.*?)\]/gi, query)

    }

    return (
        <nav className='overflow-hidden z-20 bg-navbar-bg flex flex-row justify-between items-center h-navbar w-full fixed pr-5 py-4'>
            {/* <div className={styles.navbar_flex}> */}

            <div className='flex flex-row justify-center items-center'>
                <a href="https://github.com/Inayath-Hussain/Blog-Now" target="_blank">
                    <div className="mt-[-32px] ml-[-60px] w-[136px] h-[60px] pl-[10px] pb-[6px] flex items-end justify-center bg-[#24292F] rotate-315 mr-9">
                        <img src="/github-mark-white.svg" alt="" className="h-7 w-7" />
                    </div>
                </a>
                <input type="text"
                    className={`border-none outline-0 rounded-2xl bg-white py-1 pl-6 pr-4 bg-search-url bg-no-repeat bg-left
                     mr-1 text-base ${search ? 'w-52' : 'w-0 transition-all duration-5s ease focus:w-52'}`} value={search} onChange={e => setSearch(e.target.value)} />
                <button className='p-1 border-none outline-none rounded bg-search cursor-pointer'>Search</button>
            </div>

            {!router.pathname.includes('/draft') &&
                <Link className='font-medium hover:cursor-pointer'
                    href='/draft'>
                    <div className="flex flex-row justify-center items-center hover:text-white fill-black hover:fill-white">
                        <WriteIcon />
                        Write
                    </div>
                </Link>
            }

            {router.pathname !== '/' &&
                <Link className='font-medium hover:cursor-pointer hover:text-white transition-all
                 duration-200' href='/'>Home</Link>
            }

            {props.user ?
                <div className="flex flex-row justify-center items-center">

                    {router.pathname !== '/userInfo/me' &&
                        <>
                            <Link href={'/userInfo/me'}>
                                <img src={props.profilePicUrl || '/Profile_picture.svg'} alt="profile picture" height={40} width={40} className="mr-2 rounded-half object-cover" />
                            </Link>
                            <Link href={'/userInfo/me'}>
                                <h5>{props.user}</h5>
                            </Link>
                        </>
                    }

                    <button className="ml-5 rounded-lg border-none p-2 bg-secondary-btn cursor-pointer 
                hover:shadow-logout hover:mb-1 ease-in-out" onClick={logout}>Log Out</button>
                </div>
                :
                <>
                    <Link className="font-medium hover:cursor-pointer hover:text-secondary-btn transition-all duration-200"
                        href={`/user/login?callback=${callback_url()}`}>Log In</Link>

                    <Link className="font-medium hover:cursor-pointer hover:text-secondary-btn transition-all duration-200"
                        href={`/user/register?callback=${callback_url()}`}>Register</Link>
                </>
            }
            {/* </div> */}
        </nav>
    )
}

export default NavBar;