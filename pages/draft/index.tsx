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


    // const { cookies, current_user } = await authenticate({ access_token, refresh_token })

    if (cookies.length > 0) {
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


    return {
        props: { user: current_user, profilePicUrl, drafts, user_id: userDetails?._id.toString() as string }
    }
}