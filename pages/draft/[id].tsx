import { ChangeEvent, useEffect, useRef, useState } from "react";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import authenticate from "@/utilities/authentication";
import DraftSideBar from "@/components/drafts/sidebar";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import ImageIcon from "@/components/icons/image";
import dbConnect from "@/lib/mongodb";
import draft from "@/models/draft";
import { IdraftsList } from "@/interfaces";
import { IDraftSchema } from "@/models/draft";
import PublishButton from "@/components/button/publish";
import { headers } from "next/dist/client/components/headers";
import user from "@/models/user";

interface IDetails extends Omit<IDraftSchema, 'owner'> {
    owner: string
}

interface Ipageprops {
    user: string,
    profilePicUrl: string,
    drafts: IdraftsList[],
    id: string,
    details: IDetails,
    user_id: string
}

const Draft = ({ user, drafts, id, details, user_id }: Ipageprops) => {

    console.log(id)
    const [coverImg, setCoverImg] = useState<File | null>()
    const [previewImg, setPreviewImg] = useState(details.coverImage?.url || '')
    const coverImgRef = useRef<HTMLInputElement>(null)
    const contentRef = useRef<string>(details.content || '');
    const titleRef = useRef<string>(details.title || '');
    const savedRef = useRef<boolean>(true)
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [showPreview, setShowPreview] = useState(false)
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

    const handleLeaving = (ev: BeforeUnloadEvent) => {
        if (savedRef.current) {
            return
        }
        ev.returnValue = ''
    }

    useEffect(() => {
        window.addEventListener('beforeunload', handleLeaving)
        setEditorLoaded(true)

        return () => { window.removeEventListener('beforeunload', handleLeaving) }
    }, [])

    const selectImg = (e: ChangeEvent<HTMLInputElement>) => {
        console.log('select img')
        if (e.target.files && e.target.files.length > 0) {
            console.log(e.target.files)
            console.log(coverImg)
            setCoverImg(e.target.files[0])
            setPreviewImg(URL.createObjectURL(e.target.files[0]))
            savedRef.current = false
        }
    }

    const removeCoverImage = () => {
        if (coverImgRef.current) {
            coverImgRef.current.value = ''
        }
        setCoverImg(null);
        setPreviewImg('');
    }

    const appendForm = () => {
        const form = new FormData()
        form.append('draft_id', id)
        form.append('owner', user)
        titleRef.current !== details.title && form.append('title', titleRef.current || '')
        contentRef.current !== details.content && form.append('content', contentRef.current || '')
        previewImg !== details.coverImage?.url && form.append('coverImage', coverImg || '')
        console.log(previewImg !== details.coverImage?.url)

        return form;
    }

    const save = async () => {
        // const form = new FormData()
        // form.append('draft_id', id)
        // form.append('owner', user)
        // titleRef.current !== details.title && form.append('title', titleRef.current || '')
        // contentRef.current !== details.content && form.append('content', contentRef.current || '')
        // previewImg !== details.coverImage?.url && form.append('coverImage', coverImg || '')
        // console.log(previewImg !== details.coverImage?.url)
        const form = appendForm()

        // form.append('coverImage', '')

        const result = await fetch('/api/draft/update', {
            method: 'PUT',
            body: form
        })

        console.log(result)
        if (result) {
            savedRef.current = true
            details = { ...details, title: titleRef.current, }
            router.reload()
        }
    }

    const publish = async () => {
        if (!titleRef.current || !contentRef.current) {
            // cfe7e7, 76cad4
            return toast(`${!titleRef.current ? 'Title' : 'Content'} is required`, { style: { backgroundColor: '#76cad4', color: 'black' }, type: 'error' })
        }
        if (!savedRef.current) {
            return toast('Draft is not Saved', { style: { backgroundColor: '#76cad4', color: 'black' }, type: 'error' })
        }

        const blog = await fetch('/api/blog', {
            method: 'POST',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                owner: user_id,
                title: titleRef.current,
                coverImage: details.coverImage,
                content: contentRef.current
            })
        })
        const data = await blog.json()
        if (data) {
            console.log(data.id)
            router.push(`/blog/${data.id}`)
        }
        console.log('publish')
    }

    if (showPreview) {
        return (
            <>
                <div className="pt-navbar min-h-screen h-full px-48">
                    <div className="fixed top-navbar right-4">
                        <button onClick={() => setShowPreview(false)} className="bg-primary-btn m-2 text-white p-2 rounded-md cursor-pointer">Close Preview</button>

                        {/* <button onClick={publish} className='bg-primary-btn m-2 text-white p-2 rounded-md cursor-pointer'>Save & Publish</button>
                        <PublishButton disabled={!savedRef.current} publish={publish}/>
                        <button onClick={save} className="bg-primary-btn m-2 text-white cursor-pointer p-2 rounded-md">Save</button> */}
                    </div>

                    <div className="mt-6 mb-10">
                        <div className="flex flex-row justify-center items-center w-full mb-7">
                            {/* cover image here */}
                            {previewImg && <img src={previewImg} alt="" width={1000} height={600} className="rounded-lg object-contain" />}
                        </div>

                        {/* title here */}
                        <h2 className="text-center">{titleRef.current}</h2>

                        <div className="mt-9 flex flex-row w-full justify-center items-center">
                            <img src={'/Profile_Picture.svg'} alt="" width={48} height={48} className="rounded-half mr-2" />
                            <h4>Name</h4>
                            <span className="mx-3 pb-2 font-bold text-base">.</span>
                            <p>Jun 2, 2023</p>
                            <span className="mx-3 pb-2 font-bold text-base">.</span>
                            <img className="mx-2" src="/book.svg" alt="" width={20} height={20} />
                            <p>min read</p>
                        </div>

                    </div>
                </div>
                <div className="pl-36 pr-[184px]">
                    {Editor && <Editor disable={true} draft_id={id} name="Blog" user={user} editorLoaded={editorLoaded} onChange={(data) => { contentRef.current = data; savedRef.current = false; console.log(contentRef.current); }} value={contentRef.current || ''} />}
                </div>
            </>
        )
    }

    return (
        <>
            <ToastContainer position="bottom-right" />
            <DraftSideBar id={id} drafts={drafts} user={user} />

            <div className="fixed top-navbar right-4 z-[100]">
                <button onClick={() => setShowPreview(true)} className="bg-primary-btn m-2 text-white p-2 rounded-md cursor-pointer">Preview</button>

                <button onClick={publish} className='bg-primary-btn m-2 text-white p-2 rounded-md cursor-pointer'>Publish</button>
                {/* <PublishButton disabled={!savedRef.current} publish={publish}/> */}
                <button onClick={save} className="bg-primary-btn m-2 text-white cursor-pointer p-2 rounded-md">Save</button>
            </div>

            <div className="pt-navbar ml-drafts-contn">
                <div className="mt-2 flex flex-row">
                    <label className="flex flex-row justify-center items-center w-48 mx-10 mr-5 mt-0 my-6 cursor-pointer font-bold bg-secondary-btn p-3 rounded-lg" htmlFor="coverImg">
                        <ImageIcon />
                        Add Cover Image</label>
                    <input ref={coverImgRef} className="mt-4" id='coverImg' type="file" accept="image/*" onChange={(e) => selectImg(e)} style={{ display: 'none' }} />

                    <button onClick={removeCoverImage} className="border-none text-base w-48 mx-10 ml-5 mt-0 my-6 cursor-pointer font-bold bg-secondary-btn p-3 rounded-lg">Remove Cover Image</button>
                </div>

                {previewImg &&
                    <div className="flex flex-row justify-center items-center">
                        <img src={previewImg} alt="" width={900} height={475} className="rounded-lg object-contain" />
                    </div>}

                <div className="pl-10 pr-16">
                    <textarea defaultValue={titleRef.current || ''} onChange={(e) => { titleRef.current = e.target.value; savedRef.current = false; console.log(titleRef.current) }} className="resize font-semibold border-none outline-none text-2xl h-36 mt-14 w-full mr-[74px] pl-6" data-limit-row-len={true} cols={30} rows={4} maxLength={220} placeholder="Add Title Here" />
                </div>


                {Editor && <Editor disable={false} draft_id={id} name="Blog" user={user} editorLoaded={editorLoaded} onChange={(data, plainText) => { contentRef.current = data; savedRef.current = false; console.log(contentRef.current); }} value={contentRef.current || ''} />}
            </div>
        </>
    );
}

export default Draft;


export const getServerSideProps = async ({ req, res, resolvedUrl, params, query }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Ipageprops>> => {

    const { cookies, current_user, profilePicUrl } = await commonGetServerSidePropsFunc({ req })
    const id = params?.id as string
    // console.log('url...', resolvedUrl)

    // const { cookies, current_user } = await authenticate({ access_token, refresh_token })

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

    if (!id) {
        return {
            redirect: {
                permanent: false,
                destination: '/draft'
            }
        }
    }

    await dbConnect();

    const userDetails = await user.findOne({ email: current_user })
    const d = await draft.find({ owner: userDetails?._id })
    const drafts: IdraftsList[] = []
    d.forEach(v => drafts.push({ name: v.name, id: v._id.toString() }))
    console.log('server side draft', drafts)
    let details = d.find(v => v._id.toString() === id)

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
    const { name, owner, title, coverImage, content } = details
    console.log('details...', details)

    return {
        props: {
            user: current_user, profilePicUrl, drafts, id, user_id: userDetails?._id.toString() as string,
            details: {
                name, owner: owner._id.toString(), content: content || '',
                coverImage: { key: coverImage?.key || '', url: coverImage?.url || '' }, title: title || ''
            }
        }
    }
}