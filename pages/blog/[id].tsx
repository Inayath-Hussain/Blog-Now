import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dbConnect from "@/lib/mongodb";
import blog from "@/models/blog";
import user, { IUserSchema } from "@/models/user";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import SaveIcon from "@/components/icons/save";

interface Ipageprops {
    id: string,
    user: string,
    user_id: string,
    profilePicUrl: string,
    saved: boolean,
    details: {
        title: string,
        content: string,
        posted_on: string,
        coverImage: {
            key: string,
            url: string
        }
    },
    ownerDetails: {
        email: string,
        name: string,
        profilePicUrl: string
    }
}

const Blog = ({ id, user, profilePicUrl, details, ownerDetails, saved, user_id }: Ipageprops) => {
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [blogSaved, setBlogSaved] = useState(saved);
    const router = useRouter();

    const getEditor = () => {
        try {
            return dynamic(() => import('@/components/editor'), { ssr: false })
        } catch (ex) {
            console.log(ex)
            router.reload()
        }
    }

    let Editor = null

    if (!Editor) {
        Editor = getEditor()
    }

    useEffect(() => {
        setEditorLoaded(true)
    }, [])


    const save = async () => {
        if (!user) {
            return router.push(`/user/login?callback=/`)
        }

        const res = await fetch(`/api/blog/${blogSaved ? 'unsave' : 'save'}`, {
            method: 'PUT',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                user_id,
                blog_id: id
            })
        })

        if (res.status === 200) {
            setBlogSaved(!blogSaved)
        }
    }

    return (
        <>
            <div className="pt-navbar h-auto px-48">
                <div className="fixed top-navbar right-4">
                    <button onClick={save} className="bg-primary-btn m-2 text-white p-2 rounded-md cursor-pointer">{blogSaved ? 'Unsave' : 'Save'}</button>
                </div>

                <div className="mt-6 mb-10">
                    {details.coverImage.url && <div className="flex flex-row justify-center items-center w-full mb-7">
                        <img src={details.coverImage.url} alt="" width={1000} height={600} className="rounded-lg object-contain" />
                    </div>}
                    {/* title */}
                    <h2 className="text-center">{details.title}</h2>

                    <div className="mt-9 flex flex-row w-full justify-center items-center">
                        <a href={`/userInfo/${ownerDetails.email}`} className="flex flex-row justify-center items-center">
                            <img src={ownerDetails.profilePicUrl || '/Profile_Picture.svg'} alt="" width={48} height={48} className="rounded-half mr-2" />
                            <h4>{ownerDetails.name}</h4>
                        </a>
                        <span className="mx-3 pb-2 font-bold text-base">.</span>
                        <p>{details.posted_on}</p>
                        <span className="mx-3 pb-2 font-bold text-base">.</span>
                        <img className="mx-2" src="/book.svg" alt="" width={20} height={20} />
                        <p>min read</p>
                    </div>

                </div>
            </div>
            <div className="pl-36 pr-[184px]">
                {Editor && <Editor disable={true} draft_id={id} name="Blog" user={user} editorLoaded={editorLoaded} onChange={(data: any) => { }} value={details.content} />}
            </div>
        </>
    );
}

export default Blog;


export const getServerSideProps = async ({ req, res, resolvedUrl, params, query }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Ipageprops>> => {

    const { cookies, current_user, profilePicUrl } = await commonGetServerSidePropsFunc({ req })
    const id = params?.id as string

    if (cookies.length > 0) {
        console.log('index...', [...cookies])
        res.setHeader('Set-Cookie', [...cookies])
    }

    await dbConnect();

    // const d = await draft.find({ owner: current_user })
    const details = await blog.findById(id).populate({ path: 'owner', select: ['username', 'profilePicture', 'saved_blogs', 'email'] })
    // const test = await blog.findById(id).populate({ path: 'owner', select: ['username', 'profilePicture', 'saved_blogs'] })
    console.log('Test...........................................', details?.owner._id)

    // const ownerDetails = { username: '', profilePicture: { url: '' } }

    let saved = false;
    let user_id = ''
    if (current_user) {
        const userDetails = await user.findOne({ email: current_user })
        console.log('saved.....', userDetails?.saved_blogs)
        saved = userDetails?.saved_blogs.find(v => v === id) ? true : false
        user_id = userDetails?._id.toString() || ''
    }
    // ownerDetails?.profilePicture?.url


    if (!details) {
        return {
            redirect: {
                permanent: false,
                destination: '/draft'
            }
        }
    }

    delete details?.__v
    // delete details._id
    const { title, coverImage, content } = details
    const { username, profilePicture, email } = details.owner
    const posted_on = details.posted_on.toDateString().slice(4)
    console.log('details...', details)

    return {
        props: {
            user: current_user, profilePicUrl, id, saved, user_id,
            details: {
                content, posted_on,
                coverImage: { key: coverImage?.key || '', url: coverImage?.url || '' }, title
            },
            ownerDetails: {
                email,
                name: username,
                profilePicUrl: profilePicture?.url || ''
            }
        }
    }
}