import { Dispatch, SetStateAction } from "react"

interface Iparams {
    to: string
    username: string
    setErrorMsg: Dispatch<SetStateAction<string>>
    setShowVerification: Dispatch<SetStateAction<boolean>>
}

export const sendMail = async ({ to, username, setErrorMsg, setShowVerification }: Iparams) => {


    const result = await fetch('/api/auth/sendCode', {
        method: 'POST',
        headers: new Headers({
            'content-type': 'application/json'
        }),
        body: JSON.stringify({ to, username })
    })
    const data = await result.json()


    if (data.error) {
        setErrorMsg(data.error)
        return
    }
    setShowVerification(true)
}