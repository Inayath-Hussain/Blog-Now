import { IdraftsList } from "@/interfaces";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface IpageProps {
    close: () => void,
    owner: string,
    setDrafts: Dispatch<SetStateAction<IdraftsList[]>>
}

const CreateNewDraft = ({ close, owner, setDrafts }: IpageProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [name, setName] = useState('')

    useEffect(() => {
        const closeModal = (e: any) => {
            if (e.target === modalRef.current) {
                close();
            }
        }

        document.body.addEventListener('click', closeModal)

        return () => {
            document.body.removeEventListener('click', closeModal)
        }
    })

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

        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-25 bg- backdrop-blur-sm z-20 flex flex-row pt-navbar justify-center items-start">
            <div className="mt-5 flex flex-col justify-around items-center bg-white rounded-lg p-2 h-1/3 w-1/4 z-20">

                <h3>Enter Draft Name</h3>

                <input type="text" placeholder="Draft Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl w-3/4 p-2 text-lg" />
                <button className={`px-4 rounded-2xl p-2 mt-3 text-xl border-none cursor-pointer 
                ${name === '' ? 'cursor-not-allowed' : 'hover:bg-yellow-300 cursor-default'}
                      border-gray-400 outline-0 bg-primary-btn`} disabled={name === '' ? true : false}
                    onClick={save} >Create</button>
            </div>
        </div>
    );
}

export default CreateNewDraft;