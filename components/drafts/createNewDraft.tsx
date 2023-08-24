import { IdraftsList } from "@/interfaces";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface IpageProps {
    close: () => void,
    owner: string,
    setDrafts: Dispatch<SetStateAction<IdraftsList[]>>
}

const CreateNewDraft = ({ close, owner, setDrafts }: IpageProps) => {
    // const modalRef = useRef<HTMLDivElement>(null);
    const [name, setName] = useState('')

    useEffect(() => {

        const modal = document.getElementById('modal')
        if (!modal) {
            console.warn('Unable to get Modal')
            return
        }
        const query = modal.querySelectorAll('button')
        const firstElement = query[0]
        const lastElement = query[query?.length - 1]

        // when shift+tab is used to focus on buttons in reverse direction and when the focus is on first button, focus will be shifted to last button in modal
        const handleReverseFocusDirection = (e: KeyboardEvent) => {
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault()
                lastElement.focus()
            }
        }

        // when focus is on last button of modal component, the next focus will be shifted to first button
        const handleFocusDirection = (e: KeyboardEvent) => {

            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault()
                firstElement.focus()
            }
        }


        // when shift+tab is pressed the last element in modal will receive focus
        const handleReverseFocus = (e: KeyboardEvent) => {
            if (e.key === 'Tab' && e.shiftKey) {
                if (!modal.contains(e.target as Node)) {
                    e.preventDefault()
                    lastElement.focus()
                    return
                }
            }
        }

        document.addEventListener('keydown', handleReverseFocus)
        firstElement.addEventListener('keydown', handleReverseFocusDirection)
        lastElement.addEventListener('keydown', handleFocusDirection)

        return () => {
            document.removeEventListener('keydown', handleReverseFocus)
            firstElement.removeEventListener('keydown', handleReverseFocusDirection)
            lastElement.removeEventListener('keydown', handleFocusDirection)
        }
    }, [])

    // useEffect(() => {
    //     const closeModal = (e: any) => {
    //         if (e.target === modalRef.current) {
    //             close();
    //         }
    //     }

    //     document.body.addEventListener('click', closeModal)

    //     return () => {
    //         document.body.removeEventListener('click', closeModal)
    //     }
    // }, [])

    const save = async () => {
        const result = await fetch('/api/draft/new', {
            method: 'POST',
            headers: new Headers({
                'content-type': 'application/json'
            }),
            body: JSON.stringify({
                owner,
                name
            })
        })

        if (result) {

            const data = await result.json()
            setDrafts(value => { value.push({ id: data.id, name }); return value })
            close()
        }
    }

    return (

        <div role="dialog" onClick={close} style={{ backdropFilter: 'blur(5px)' }} className="fixed inset-0 bg-black bg-opacity-70 z-[200] flex flex-row pt-navbar justify-center items-center">
            <div onClick={(e) => e.stopPropagation()} className="relative mt-5 flex flex-col justify-around items-center bg-white rounded-lg p-2 h-1/3 w-1/4 z-20">

                <h3>Enter Draft Name</h3>
                <button onClick={close} className="parent-btn absolute top-3 right-3 hover:cursor-pointer border-0 outline-0 rounded-[50%]">
                    <img className="rounded-[50%]" src="/close.svg" alt="" />
                </button>

                <input type="text" placeholder="Draft Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl w-3/4 p-2 text-lg border" />
                <button className={`px-4 rounded-2xl p-2 mt-3 text-xl cursor-pointer border 
                ${name === '' ? 'cursor-not-allowed' : 'hover:bg-yellow-300 cursor-default'}
                      border-gray-400 outline-0 bg-primary-btn`} disabled={name === '' ? true : false}
                    onClick={save} >Create</button>
            </div>
        </div>
    );
}

export default CreateNewDraft;