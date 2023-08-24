import styles from '@/styles/user.module.css';
import { sendVerificationCode } from '@/utilities/sendVerificationCode';
import { ChangeEvent, useRef, useState } from 'react';

interface Iprops {
    email: string
    register: (code: string) => Promise<void>
}

const VerificationCard = ({ email, register }: Iprops) => {

    const [disabled, setDisabled] = useState(true);
    const inputRefs = Array.from({ length: 4 }, () => useRef<null | HTMLInputElement>(null))

    // user entered code
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
        const inputs = document.querySelectorAll('input')
        let local_disabled = false;

        inputs.forEach(input => {

            if (input.value === '') {
                local_disabled = true
            }
        })

        setDisabled(local_disabled)
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
        <div className={`${styles.register_container} py-8`}>
            <h2 className={`${styles.h2} py-3`}>Verification</h2>

            <h4 className='pt-2 pb-8'>Verification Code has been sent to {email} </h4>

            <h4>Enter Code Below:</h4>
            <div className='flex flex-row gap-4 pt-6 pb-8 w-full justify-center items-center'>
                {inputRefs.map((i, index) => (
                    <input type="text"
                        ref={i}
                        maxLength={1}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        style={{ textTransform: 'uppercase' }} className='w-8 h-8 text-center' />
                ))}

            </div>

            <button disabled={disabled} onClick={() => register(getCode())} style={disabled ? { cursor: 'not-allowed' } : {}} className={`p-3 rounded-lg ${!disabled && 'bg-primary-btn text-white'}`}>Verify</button>
        </div>
    );
}

export default VerificationCard;