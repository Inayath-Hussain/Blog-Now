import React, { ChangeEvent, useState } from "react";
import { useRouter } from 'next/router'
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import commonGetServerSidePropsFunc from "@/utilities/commonGetServerSideProps";
import user, { IUserSchema } from '@/models/user'
import SettingInput from "@/components/settings/input";
import SettingsProfilePic from "@/components/settings/profilePic";
import SettingsEmail from "@/components/settings/email";
import dbConnect from "@/lib/mongodb";

interface Ipageprops {
    user: string,
    profilePicUrl: string
    userInfo: IUserInfo
}

interface IUserInfo extends Omit<IUserSchema, '_doc' | 'password' | 'following' | 'saved_blogs' | 'profilePicture' | 'joined_on'> {
    joined_on: string,
}


const EditUserInfo: React.FC<Ipageprops> = ({ user, userInfo, profilePicUrl }) => {
    const [username, setUsername] = useState(userInfo.username);
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [preview, setPreview] = useState(profilePicUrl);

    const [usernameChanged, setUsernameChanged] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [errorMsg, setErrorMsg] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [changePassword, setChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const selectImg = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            console.log(e.target.files)
            setProfilePic(e.target.files[0])
            setPreview(URL.createObjectURL(e.target.files[0]))
        }
    }

    const handleProfilePicSave = async () => {
        const file = new FormData()

        file.append('image', profilePic || '')
        file.append('user', userInfo.email)

        const result = await fetch('/api/image/changeProfilePicture', {
            method: 'POST',
            body: file
        })

        if (result.status === 200) return router.reload()

        const data = await result.json()
        console.log(data)
    }


    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        let local_disabled = false
        let local_usernameChanged = true
        setUsername(e.target.value)
        if (userInfo.username === e.target.value) local_usernameChanged = false

        if (e.target.value === '') local_disabled = true
        setUsernameChanged(local_usernameChanged)
        setDisabled(local_disabled)
    }

    const handleUsernameSave = async () => {
        // api call to save username
        const response = await fetch('/api/user/changeUsername', {
            method: 'PUT',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                email: userInfo.email,
                username
            })
        })

        if (response.status === 200) return router.reload()
        else {
            const data = await response.json()
            console.log(data)
            return //toast
        }
    }

    const handleCancel = () => {
        setCurrentPassword('')
        setNewPassword('')
        setChangePassword(false)
    }

    const handleChangePassword = async () => {
        if (!changePassword) return setChangePassword(true)

        if (!currentPassword || !newPassword) return // toast here saying password cannot be null

        // api to call to change password
        const response = await fetch('/api/user/changePassword', {
            method: 'PUT',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                email: userInfo.email,
                currentPassword,
                newPassword
            })
        })

        const data = await response.json()
        console.log(data)
        if (response.status === 200) return router.reload()
        else return // error toast

    }

    const handleDelete = async () => {
        const response = await fetch(`/api/user/delete/${userInfo.email}`, {
            method: 'DELETE',
            headers: new Headers({
                'content-type': 'application/json'
            }),
        })

        if (response.status === 200) return router.reload()
        const data = await response.json()
        console.log(data)
    }

    return (
        <div className="pt-navbar">
            <div className="flex flex-col justify-start items-center">
                {/* card here */}
                <div className="mb-8 shadow-info-card-all-sides border border-solid w-[900px] h-auto rounded-xl flex flex-row justify-around items-around my-8 p-4">

                    {/* profile photo */}
                    <SettingsProfilePic preview={preview} profilePicUrl={profilePicUrl} setPreview={setPreview}
                        selectImg={selectImg} handleProfilePicSave={handleProfilePicSave} />

                    <div className="flex flex-col justify-start gap-3 items-start">

                        {/* Email */}
                        <SettingsEmail userInfo={userInfo} setErrorMsg={setErrorMsg} />


                        {/* username */}
                        <div className="mt-12">
                            <SettingInput label="Username" value={username} onChange={handleUsernameChange} />
                        </div>

                        {usernameChanged && <button disabled={disabled}
                            className="bg-primary-btn p-2 rounded-lg hover:cursor-pointer hover:text-white"
                            onClick={handleUsernameSave} > Save </button>}

                    </div>
                </div>


                <div className="flex w-[900px] flex-row justify-between px-16 items-start">
                    {/* Password */}
                    <div>
                        {changePassword &&
                            <>
                                <SettingInput type={showPassword ? "text" : "password"} label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                <SettingInput type={showPassword ? "text" : "password"} label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

                                <input className="h-4 w-4 mr-2 mt-2" type="checkbox" id="show password" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                                <label className="text-base" htmlFor="show password">Show Password</label>
                            </>
                        }

                        <div className="flex flex-row justify-around items-center mt-4">
                            <button onClick={handleChangePassword} className="bg-primary-btn p-2 rounded-lg hover:text-white hover:cursor-pointer"
                            > {changePassword ? 'Save' : 'Change Password'} </button>

                            {changePassword && <button onClick={handleCancel}
                                className="bg-secondary-btn p-2 hover:cursor-pointer rounded-lg">Cancel</button>}
                        </div>

                    </div>


                    {/* delete account */}
                    <button className="hover:bg-red-500 hover:cursor-pointer hover:text-white text-red-700 font-semibold
                     p-2 rounded-lg" onClick={handleDelete}>Delete Account</button>
                </div>

            </div>
        </div>
    );
}

export default EditUserInfo;



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

    await dbConnect();
    const userData = await user.findOne({ email: current_user }).select({ password: 0 })
    if (!userData) return {
        redirect: {
            permanent: false,
            destination: `/user/login?callback=${resolvedUrl}`,
        }
    }


    const serializable_userInfo: IUserInfo = {
        email: userData.email,
        username: userData.username,
        followers: userData.followers,
        joined_on: userData.joined_on.toDateString().slice(4)
    }
    console.log('serializable_userInfo..........', serializable_userInfo)

    console.log('userData...', userData)

    return {
        props: { user: current_user, profilePicUrl, userInfo: serializable_userInfo }
    }
}