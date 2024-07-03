import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
// import authenticate from '@/utilities/authentication';
import Image from 'next/image';
import SaveIcon from '@/components/icons/save';
import Link from 'next/link';
import commonGetServerSidePropsFunc from '@/utilities/commonGetServerSideProps';
import dbConnect from '@/lib/mongodb';
import blog, { IBlogSchema } from '@/models/blog';
import user from '@/models/user';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { convertToPlainText } from '@/utilities/convertToPlainText';

interface Ipageprops {
    user: string,
    profilePicUrl: string,
    serializable_blogs: IBlogs[],
    saved_blogs: string[],
    user_id: string,
    following: string[]
}

interface IBlogs extends Omit<IBlogSchema, '_doc' | 'posted_on' | 'coverImage' | 'owner'> {
    id: string,
    posted_on: string,
    coverImage: string,
    owner: {
        id: string,
        username: string,
        profilePicture: string,
        email: string
    }
}

const Blog = ({ user, profilePicUrl, serializable_blogs, saved_blogs, user_id, following }: Ipageprops) => {
    const [user_saved_blogs, setUserSavedBlogs] = useState(saved_blogs);
    const [user_following, setUserFollowing] = useState(following)
    const router = useRouter();


    const save = async (blog_id: string) => {
        if (!user) {
            return router.push(`/user/login?callback=/`)
        }

        const if_saved = user_saved_blogs.find(v => v === blog_id) ? true : false
        const res = await fetch(`/api/blog/${if_saved ? 'unsave' : 'save'}`, {
            method: 'PUT',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                user_id,
                blog_id
            })
        })

        if (res.status === 200) {
            if (if_saved) {
                const new_user_saved_blogs = user_saved_blogs.filter(v => v !== blog_id);
                setUserSavedBlogs(new_user_saved_blogs);
            }
            else {
                const new_user_saved_blogs = [...user_saved_blogs, blog_id];
                setUserSavedBlogs(new_user_saved_blogs)
            }
        }
    }

    const follow = async (id: string) => {
        if (!user) {
            return router.push(`/user/login?callback=/`)
        }

        // follow api
        const res = await fetch(`/api/user/${user_following.find(v => v === id) ? 'unfollow' : 'follow'}`, {
            method: 'PUT',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                user_id,
                blogger_id: id
            })
        })
        if (res.status === 200) {
            if (user_following.find(v => v === id)) {
                const new_user_following = user_following.filter(v => v !== id)
                setUserFollowing(new_user_following)
            }
            else {
                const new_user_following = [...user_following, id]
                setUserFollowing(new_user_following)
            }
        }
    }

    return (
        <div className='pt-navbar bg-slate-200 h-full min-h-screen'>
            <div className='flex flex-col justify-start items-center w-screen h-full py-8'>
                {/* map func here */}

                {serializable_blogs.map(b => (
                    <div key={b.id} className='mb-5 p-5 flex flex-col border border-solid rounded-lg w-[900px] h-72 bg-white'>
                        {/* image name and follow button */}
                        <div className='flex flex-row justify-between mb-4'>
                            <Link href={`userInfo/${b.owner.email}`}>
                                <div className='flex flex-row justify-start items-center'>
                                    <Image src={b.owner.profilePicture || "/Profile_Picture.svg"} alt="profile picture" height={48} width={48} className='rounded-half mr-2' />
                                    <div>
                                        <h4>{b.owner.username}</h4>
                                        <div className='flex flex-row justify-between items-center'>
                                            <h5>{b.owner.email}</h5>
                                            <h5 className='ml-3'>{b.posted_on}</h5>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            {user_id !== b.owner.id && <button onClick={() => follow(b.owner.id)} title={user_following.find(v => v === b.owner.id) ? 'following' : 'follow'} className='h-8 bg-search border-none p-2 rounded text-black cursor-pointer'>{user_following.find(v => v === b.owner.id) ? 'following' : 'follow'}</button>}
                        </div>

                        {/* title content and cover image */}
                        <div className='w-full flex flex-row justify-start items-start mb-4'>
                            {/* title and desc */}
                            <div>
                                <Link href={`/blog/${b.id}`}>
                                    <h2 title={b.title} className='w-auto min-w-[600px] h-16 text-ellipsis-2'>{b.title}</h2>

                                    <p className='w-auto min-w-[600px] text-ellipsis-4'>{convertToPlainText(b.content)}</p>
                                </Link>
                            </div>

                            {b.coverImage && <Link href={`/blog/${b.id}`}>
                                <img src={b.coverImage} alt="" className='rounded-lg h-[135px] w-[255px] object-contain' />
                            </Link>}
                        </div>
                        <SaveIcon onClick={() => save(b.id)} saved={user_saved_blogs.find(v => v === b.id) ? true : false} height='20px' width='20px' />
                    </div>
                ))}


            </div>

        </div>
    );
}


export async function getServerSideProps({ req, res }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Ipageprops>> {
    const { cookies, current_user, profilePicUrl } = await commonGetServerSidePropsFunc({ req })

    if (cookies.length > 0) {
        res.setHeader('Set-Cookie', [...cookies])
    }

    await dbConnect();

    let saved_blogs: string[] = []
    let user_id = ''
    let following: string[] = []
    if (current_user) {
        const userDetails = await user.findOne({ email: current_user })
        if (userDetails) {
            saved_blogs = userDetails.saved_blogs
            user_id = userDetails._id.toString()
            following = userDetails.following
        }
    }

    const blogs = await blog.find({}).populate({ path: 'owner', select: ['username', '_id', 'profilePicture', 'email'] })
    const serializable_blogs: IBlogs[] = []
    blogs.forEach(v => {
        serializable_blogs.push({
            owner: {
                id: v.owner._id.toString(),
                username: v.owner.username,
                profilePicture: v.owner.profilePicture?.url || '',
                email: v.owner.email

            },
            title: v.title,
            content: v.content,
            posted_on: v.posted_on.toDateString().slice(4),
            coverImage: v.coverImage?.url || '',
            id: v._id.toString()
        })
    })

    return {
        props: { user: current_user, profilePicUrl, serializable_blogs, saved_blogs, user_id, following }
    }
}

export default Blog;