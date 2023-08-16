import SaveIcon from "@/components/icons/save";
import authenticate from "@/utilities/authentication";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Image from "next/image";
import Link from "next/link";
import user, { IUserSchema } from '@/models/user'
import blog, { IBlogSchema } from "@/models/blog";
import draft from "@/models/draft";
import { convertToPlainText } from "@/utilities/convertToPlainText";

interface Ipageprops {
    user: string,
    profilePicUrl: string
    draftCount: number
    serializable_blogs: IBlogs[]
    userInfo: IUserInfo
}

interface IUserInfo extends Omit<IUserSchema, '_doc' | 'password' | 'following' | 'saved_blogs' | 'profilePicture' | 'joined_on'> {
    joined_on: string,
}

interface IBlogs extends Omit<IBlogSchema, '_doc' | 'posted_on' | 'coverImage' | 'owner'> {
    id: string,
    posted_on: string,
    coverImage: string,
}

const UserInfo = ({ user, profilePicUrl, serializable_blogs, userInfo, draftCount }: Ipageprops) => {
    return (
        <div className="pt-navbar flex flex-col justify-start items-center h-full min-h-screen">

            <div className="mb-8 shadow-info-card-all-sides border border-solid w-[1000px] h-72 rounded-xl flex flex-col justify-between items-stretch my-8 p-4">
                {/*top  container */}
                <div className="flex flex-row justify-between items-start">
                    <div className="flex flex-row justify-start items-start">

                        <Image src={profilePicUrl || '/Profile_Picture.svg'} alt="Profile Picture" height={160} width={160} className="mr-3 rounded-half object-cover" />

                        <div className="flex flex-col h-[160px] justify-start">
                            <h3 className="mt-7">{userInfo.username}</h3>
                            <h4 className="mt-6">Email: {userInfo.email}</h4>
                        </div>

                    </div>

                    <button className="p-3 rounded-lg flex flex-row justify-center items-center h-8 border-none bg-secondary-btn text-base cursor-pointer">
                        <Image src='/edit.svg' alt="" height={16} width={16} className="mr-2" />
                        Edit</button>

                </div>

                <div className="flex flex-row justify-around items-center">
                    <a href="/draft" target="_blank">
                        <div className="flex flex-row justify-center items-center">
                            <Image src='/link.svg' alt='' height={16} width={16} />
                            <h5 className="ml-2">Drafts: {draftCount}</h5>
                        </div>
                    </a>

                    <div>
                        <h5 className="cursor-default">Followers: {userInfo.followers}</h5>


                    </div>

                    <div className="flex flex-row justify-start items-center">
                        <Image src='/calender.svg' alt='' height={16} width={16} className="mr-2" />
                        <p className="cursor-default font-medium"><span className="font-normal">Joined on</span> {userInfo.joined_on}</p>
                    </div>

                </div>




            </div>

            <h2 className="mb-4">Blogs</h2>

            {/* map fucntion */}
            {serializable_blogs.map(i => (

                <div className='mb-5 p-5 flex flex-col border border-solid rounded-lg w-[900px] h-72 bg-white'>
                    {/* image name and follow button */}
                    <div className='flex flex-row justify-between mb-4'>
                        <div className='flex flex-row justify-start items-center'>
                            <Image src={profilePicUrl || "/Profile_Picture.svg"} alt="profile picture" height={48} width={48} className='rounded-half mr-2' />
                            <div>
                                <h4>{userInfo.username}</h4>
                                <div className='flex flex-row justify-between items-center'>
                                    <h5>{userInfo.email}</h5>
                                    <h5 className='ml-3'>{i.posted_on}</h5>

                                </div>
                            </div>

                        </div>

                    </div>

                    {/* title content and cover image */}
                    <div className='w-full flex flex-row justify-start items-start mb-4'>
                        {/* title and desc */}
                        <div>
                            <Link href={`/blog/${i.id}`}>
                                <h2 title={i.title} className='w-auto min-w-[600px] h-16 text-ellipsis-2'>{i.title}</h2>

                                <p className='w-auto min-w-[600px] text-ellipsis-4'>{convertToPlainText(i.content)}</p>
                            </Link>
                        </div>

                        {i.coverImage &&
                            <Link href={`/blog/${i.id}`}>
                                <img src={i.coverImage} alt="" className='rounded-lg h-[135px] w-[255px] object-contain' />
                            </Link>}
                    </div>

                </div>
            ))}
        </div>
    );
}

export default UserInfo;


export const getServerSideProps = async ({ req, res, resolvedUrl }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Ipageprops>> => {
    const { cookies, current_user, profilePicUrl } = await commonGetServerSidePropsFunc({ req })

    if (cookies.length > 0) {
        console.log('index...', [...cookies])
        res.setHeader('Set-Cookie', [...cookies])
    }

    if (current_user === '') {
        return {
            redirect: {
                permanent: false,
                destination: `/user/login?callback=${resolvedUrl}`,
            }
        };
    }

    const userData = await user.findOne({ email: current_user }).select({ password: 0 })
    if (!userData) return {
        redirect: {
            permanent: false,
            destination: `/user/login?callback=${resolvedUrl}`,
        }
    }


    const draftCount = await draft.where({ owner: userData.id }).count()


    const serializable_userInfo: IUserInfo = {
        email: userData.email,
        username: userData.username,
        followers: userData.followers,
        joined_on: userData.joined_on.toDateString().slice(4)
    }
    console.log('serializable_userInfo..........', serializable_userInfo)

    const userBlogs = await blog.find({ owner: userData?._id })
    const serializable_blogs: IBlogs[] = []

    userBlogs.forEach(v => {
        serializable_blogs.push({
            title: v.title,
            content: v.content,
            posted_on: v.posted_on.toDateString().slice(4),
            coverImage: v.coverImage?.url || '',
            id: v._id.toString()
        })
    })

    console.log('userData...', userData)
    console.log('userBlogs...', userBlogs)
    console.log('userInfo/me/ serializable_blogs...', serializable_blogs)

    return {
        props: { user: current_user, profilePicUrl, serializable_blogs, draftCount, userInfo: serializable_userInfo }
    }
}