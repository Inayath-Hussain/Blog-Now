import FollowIcon from "@/components/icons/follow";
import SaveIcon from "@/components/icons/save";
import dbConnect from "@/lib/mongodb";
import blog, { IBlogSchema } from "@/models/blog";
import user, { IUserSchema } from "@/models/user";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import { convertToPlainText } from "@/utilities/convertToPlainText";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

interface IBlogsList extends Omit<IBlogSchema, 'owner' | '_id' | 'posted_on' | '_doc'> {
    posted_on: string,
    _id: string
}

interface IUserDetails extends Omit<IUserSchema, 'password' | '_doc' | 'joined_on'> {
    _id: string,
    joined_on: string
}

interface Ipageprops {
    user: string,
    email: string,
    profilePicUrl: string,
    blogs: IBlogsList[],
    profileDetails: IUserDetails,
    following: boolean,
    user_id: string,
    saved_blogs: string[]
}

const UserInfo = ({ user, profilePicUrl, email, blogs, profileDetails, following, user_id, saved_blogs }: Ipageprops) => {
    const [user_saved_blogs, setUserSavedBlogs] = useState(saved_blogs)
    const [user_following, setUserFollowing] = useState(following);
    const [followers, setFollowers] = useState(profileDetails.followers)
    const router = useRouter();


    const follow = async () => {
        if (!user) {
            return router.push(`/user/login?callback=/userInfo/${email}`)
        }

        // follow api
        const res = await fetch(`/api/user/${user_following ? 'unfollow' : 'follow'}`, {
            method: 'PUT',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                user_id,
                blogger_id: profileDetails._id
            })
        })
        if (res.status === 200) {
            if (!user_following) {
                setFollowers(value => value + 1)
            }
            else {
                setFollowers(value => value - 1)
            }
            setUserFollowing(!user_following)
        }
    }

    const save = async (blog_id: string) => {
        if (!user) {
            return router.push(`/user/login?callback=/userInfo/${email}`)
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

    return (
        <div className="pt-navbar flex flex-col justify-start items-center h-full min-h-screen">

            <div className="mb-8 w-[1000px] h-60 shadow-info-card rounded-xl flex flex-col justify-between items-stretch my-8 p-4">
                {/*top  container */}
                <div className="flex flex-row justify-between items-start">
                    <div className="flex flex-row justify-start items-start">
                        <Image src={profileDetails.profilePicture?.url || '/Profile_Picture.svg'} alt="Profile Picture" height={160} width={160} className="mr-3 rounded-half object-cover" />

                        <div className="flex flex-col h-[160px] justify-start">
                            <h3 className="mt-7 cursor-default">{profileDetails.username}</h3>

                            <div className="flex flex=row justify-between items-end w-full">
                                <h4 className="mt-6 mr-12 cursor-default"> <span className="text-base font-semibold"><strong>Email:</strong></span> {profileDetails.email}</h4>
                            </div>


                        </div>

                    </div>


                    <button onClick={follow} title={user_following ? 'Unfollow' : 'Follow'} className='px-4 h-11 flex flex-row items-center font-semibold bg-search border-none p-2 text-base rounded-xl text-black cursor-pointer'>
                        {/* <Image src='/add.svg' alt="" className="mr-3" height={20} width={20} /> */}
                        <FollowIcon following={user_following} />
                        <span className="ml-3">{user_following ? 'Unfollow' : 'Follow'}</span></button>


                </div>
                <div className="flex flex-row justify-around items-center mt-8">
                    <h4 className="cursor-default">Followers: {followers}</h4>

                    <div className="flex flex-row justify-start items-center cursor-default">
                        <Image src='/calender.svg' alt='' height={16} width={16} className="mr-2" />
                        <p>Joined {profileDetails.joined_on}</p>
                    </div>
                </div>

            </div>

            <h2 className="mb-4">Blogs</h2>

            {/* map fucntion */}

            {blogs.length > 0 && blogs.map(b => (
                <div className='mb-5 p-5 flex flex-col border border-solid rounded-lg w-[900px] h-72 bg-white'>
                    {/* image name and follow button */}
                    <div className='flex flex-row justify-between mb-4'>
                        <div className='flex flex-row justify-start items-center'>
                            <Image src="/Profile_Picture.svg" alt="profile picture" height={48} width={48} className='rounded-half mr-2' />
                            <div>
                                <h4>{profileDetails.username}</h4>
                                <div className='flex flex-row justify-between items-center'>
                                    <h5>{profileDetails.email}</h5>
                                    <h5 className='ml-3'>{b.posted_on}</h5>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* title content and cover image */}
                    <div className='w-full flex flex-row justify-start items-start mb-4'>
                        {/* title and desc */}
                        <div>
                            <Link href={`/blog/${b._id}`}>
                                <h2 title={b.title} className='w-[600px] h-16 text-ellipsis-2'>{b.title}</h2>

                                {/* func to replace all html tags and space tags => .replaceAll(/(<([^>]+)>)/ig, '').replaceAll(/(&([^>]+);)/ig, "") */}
                                <p className='w-[600px] text-ellipsis-4'>{convertToPlainText(b.content)}</p>
                            </Link>
                        </div>

                        {b.coverImage?.url && <Link href={`/blog/${b._id}`}>
                            <img src={b.coverImage.url} alt="" className='rounded-lg h-[135px] w-[255px] object-contain' />
                        </Link>}
                    </div>
                    <SaveIcon onClick={() => save(b._id)} saved={user_saved_blogs.find(v => v === b._id) ? true : false} height='20px' width='20px' />

                </div>

            ))}
        </div>
    );
}

export default UserInfo;


export const getServerSideProps = async ({ req, res, resolvedUrl, params }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Ipageprops>> => {
    const { cookies, current_user, profilePicUrl } = await commonGetServerSidePropsFunc({ req })
    const email = params?.email as string
    let following = false;
    let user_id = '';
    let saved_blogs: string[] = [];

    await dbConnect();
    const profileDetails = await user.findOne({ email }).select({ password: 0, saved_blogs: 0 })

    if (current_user) {
        if (current_user === email) {
            return {
                redirect: {
                    permanent: false,
                    destination: '/userInfo/me'
                }
            }
        }

        const userDetails = await user.findOne({ email: current_user })
        user_id = userDetails?._id.toString() || ''
        saved_blogs = userDetails?.saved_blogs || []
        following = userDetails?.following.find(v => v === profileDetails?._id.toString()) ? true : false
    }

    if (!profileDetails) {
        return {
            redirect: {
                permanent: false,
                destination: '/'
            }
        }
    }

    const serializable_profileDetails: IUserDetails = { ...profileDetails._doc, joined_on: profileDetails?._doc.joined_on.toDateString().slice(4) as string, _id: profileDetails?._id.toString() as string }


    const blogs = await blog.find({ owner: profileDetails?._id }).select({ owner: 0, __v: 0 })
    const serializable_blogs: IBlogsList[] = []
    blogs.forEach(v => {
        const posted_on = v.posted_on.toDateString().slice(4)
        serializable_blogs.push({ ...v._doc, posted_on, _id: v._id.toString(), coverImage: { key: v.coverImage?.key as string, url: v.coverImage?.url as string } })
    })



    if (cookies.length > 0) {

        res.setHeader('Set-Cookie', [...cookies])
    }

    return {
        props: { user: current_user, email, profilePicUrl, blogs: serializable_blogs, profileDetails: serializable_profileDetails, following, user_id, saved_blogs }
    }
}