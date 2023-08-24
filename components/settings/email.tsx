import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react";
import SettingInput from "./input";
import { IUserSchema } from "@/models/user";
import { useRouter } from "next/router";
import { sendMail } from "@/utilities/sendMail";
import { toast } from "react-toastify";

interface IUserInfo extends Omit<IUserSchema, '_doc' | 'password' | 'following' | 'saved_blogs' | 'profilePicture' | 'joined_on'> {
    joined_on: string,
}

interface Iprops {
    userInfo: IUserInfo
    setErrorMsg: Dispatch<SetStateAction<string>>
}

const SettingsEmail: React.FC<Iprops> = ({ userInfo, setErrorMsg }) => {
    const [email, setEmail] = useState(userInfo.email);

    const [showVerification, setShowVerification] = useState(false);
    const [disabled, setDisabled] = useState(true);
    // @ts-ignore
    const inputRefs = Array.from({ length: 4 }, () => useRef<null | HTMLInputElement>(null))

    const router = useRouter();

    const getCode = () => {
        let code = '';
        inputRefs.forEach((ref) => {
            code = code + ref.current?.value
        })
        return code.toUpperCase()
    }

    const checkDisabled = () => {

        inputRefs.every(ref => {
            ref.current?.value
        })

        let local_disabled = false;
        inputRefs.forEach(ref => {

            if (ref.current?.value === '') {
                local_disabled = true
            }
        })


        setDisabled(local_disabled)
    }

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        if (e.target.value === userInfo.email) {
            return setShowVerification(false)
        }
    }

    const handleEmailUpdation = async () => {
        if (!showVerification) {
            // api call to send verification code
            await sendMail({ to: email, username: userInfo.username, setErrorMsg, setShowVerification })
            return setShowVerification(true)
        }
        else {

            // api call to change email in db
            const code = getCode()

            const response = await fetch('/api/user/changeEmail', {
                method: 'PUT',
                headers: new Headers({
                    'content-type': 'application/json'
                }),
                body: JSON.stringify({
                    new_email: email,
                    old_email: userInfo.email,
                    code
                })
            })

            const data = await response.json()

            if (response.status === 200) {
                return router.reload()
            }
            else toast(data.error, { type: 'error' })
        }

    }

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        const input = inputRefs[index].current
        const prevInput = inputRefs[index - 1 >= 0 ? index - 1 : 0].current
        const nextInput = inputRefs[index + 1 <= inputRefs.length - 1 ? index + 1 : index].current
        const value = event.currentTarget.value;
        const key = event.key


        if (!input || !prevInput || !nextInput) return console.warn('inputRef is null')

        // use regex to see if key is a-z or 0-9 if true move ref forward
        const regex_expr = /^[A-Za-z0-9]$/

        if (regex_expr.test(key)) {
            // @ts-ignore
            event.target.value = key
            checkDisabled()

            if (index < inputRefs.length - 1) {
                nextInput.focus();
            }

            event.preventDefault()
        }
        // if key is Backspace and value is already empty before Backspace move ref backward
        else if (event.key === 'Backspace') {
            setDisabled(true)

            if (value === '' && index > 0) {
                prevInput.focus();
            }
        }

    }


    return (
        <>
            <div>
                <SettingInput label={'Email'} value={email} onChange={handleEmailChange} />
            </div>


            {(showVerification) &&
                <div className="flex flex-col justify-start items-center">
                    <div>
                        <p className="font-semibold">To update, Enter Verification code sent to</p>
                        <p className="font-semibold text-base text-emerald-600">{email}</p>
                    </div>

                    <div className='flex flex-row gap-2 pt-3 pb-3 w-full justify-center items-center'>
                        {inputRefs.map((i, index) => (
                            <input type="text"
                                key={index}
                                ref={i}
                                maxLength={1}
                                onKeyDown={(event) => handleKeyDown(index, event)}
                                style={{ textTransform: 'uppercase' }} className='w-8 h-8 text-center' />
                        ))}

                    </div>

                </div>
            }
            {userInfo.email !== email && <button className="bg-primary-btn p-2 hover:cursor-pointer hover:text-white
                        rounded-lg" disabled={showVerification && disabled} onClick={handleEmailUpdation}
            > {showVerification ? 'Verify & Save' : 'Change'} </button>}
        </>
    );
}

export default SettingsEmail;