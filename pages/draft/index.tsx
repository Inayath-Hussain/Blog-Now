import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import authenticate from "@/utilities/authentication";
import DraftSideBar from "@/components/drafts/sidebar";
import { useRouter } from "next/router";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import dbConnect from "@/lib/mongodb";
import Draft from "@/models/draft";
import { IdraftsList } from "@/interfaces";
import user from "@/models/user";
// import Editor from "@/components/editor";
// import { CKEditor } from '@ckeditor/ckeditor5-react'
// import BalloonBlockEditor from "@ckeditor/ckeditor5-build-balloon-block";

interface Ipageprops {
    user: string,
    profilePicUrl: string,
    drafts: IdraftsList[],
    user_id: string
}

const CreateDraft = ({ user, drafts, user_id }: Ipageprops) => {
    // const [selectedDraft, setSelectedDraft] = useState(-1);
    // const [search, setSearch] = useState('');
    // const t = useRef<string>();
    // const [editorLoaded, setEditorLoaded] = useState(false);
    // const router = useRouter();

    console.log(drafts)

    // const getEditor = () => {
    //     try {
    //         return dynamic(() => import('@/components/editor'), { ssr: false })
    //     } catch (ex) {
    //         console.log(ex)
    //         router.reload()
    //     }
    // }

    // const Editor = getEditor()

    // const example = '<h1 contentEditable>Hello</h1><input type="text"/>'

    useEffect(() => {
        // setEditorLoaded(true)
        console.log('useeffect')
    }, [])

    // const deleteImg = async () => {
    //     const result = await fetch('/api/image/deleteImage', {
    //         method: 'POST',
    //         headers: new Headers({
    //             'content-type': 'application/json'
    //         }),
    //         body: JSON.stringify({
    //             key: 'test2@domain.com/1683715604894Spotify — Niya Watkins.png'
    //         })
    //     })
    // }

    return (
        <>
            <DraftSideBar id={''} user={user_id} drafts={drafts} />

            <div className="mx-10 mr-0 py-3 pt-navbar min-h-screen ml-drafts-contn pr-8 pl-11">
                <div className="flex flex-col justify-center items-center h-[75vh]">
                    <h2>Select a Draft</h2>
                    <h1>or</h1>
                    <h2>Create a New Draft</h2>
                </div>
            </div>
        </>
    );
}

export default CreateDraft;

export const getServerSideProps = async ({ req, res, resolvedUrl }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Ipageprops>> => {

    const { cookies, current_user, profilePicUrl } = await commonGetServerSidePropsFunc({ req })

    console.log('url...', resolvedUrl)

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

    await dbConnect();

    const userDetails = await user.findOne({ email: current_user })
    const draft = await Draft.find({ owner: userDetails?._id.toString() })
    const drafts: IdraftsList[] = []
    draft.forEach(v => drafts.push({ name: v.name, id: v._id.toString() }))
    console.log('server side draft', drafts)

    return {
        props: { user: current_user, profilePicUrl, drafts, user_id: userDetails?._id.toString() as string }
    }
}