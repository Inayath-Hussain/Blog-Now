import { useState } from "react";
import Image from "next/image";
import NewDraftIcon from "../icons/newDraft";
import DraftIcon from "../icons/draft";
import Link from "next/link";
import CreateNewDraft from "./createNewDraft";
import { IdraftsList } from "@/interfaces";
import { createPortal } from "react-dom";

interface IpageProps {
    id: string,
    drafts: IdraftsList[],
    user: string
}

const DraftSideBar = ({ drafts, user, id }: IpageProps) => {
    const [draftsState, setDrafts] = useState(drafts || []);
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false)

    return (
        <div className="p-4 pr-0 fixed top-navbar w-drafts-contn left-0 h-screen border-x-0 border-y-0 border-gray-400 border-r-2 border-solid">
            <h2 className="mb-6">My Drafts</h2>

            <input type="text" className="border outline-none rounded-2xl mb-3 bg-white py-1 pl-6 pr-4 bg-search-url bg-no-repeat bg-left
                     mr-1 text-base w-[95%]" value={search} onChange={(e) => setSearch(e.target.value)} />

            <div className="grid grid-flow-row grid-cols-single grid-rows-drafts h-3/4">

                <div className="flex flex-col overflow-y-scroll scrollbar-draft">

                    {draftsState.length > 0 && draftsState.map(v => (
                        <a onClick={() => console.log(v.id)} href={`/draft/${v.id}`} key={v.id}>
                            <div className={`w-[95%] p-1 cursor-pointer rounded-lg flex flex-row justify-start items-center my-2 ${id === v.id ? 'bg-navbar-bg hover:bg-navbar-bg text-white' : 'hover:bg-search'}`}>
                                {/* <Image src='/draft.svg' alt="draft" className="pl-2" width={20} height={20} /> */}
                                <DraftIcon selected={id === v.id ? true : false} />
                                <p className="whitespace-nowrap overflow-x-hidden w-[260px] text-ellipsis ml-2">{v.name}</p>
                            </div>
                        </a>
                    ))}

                </div>
                <button onClick={() => { setOpenModal(true) }} className="w-[95%] flex flex-row justify-center items-center rounded-2xl p-2 mt-3 text-xl border-none cursor-pointer
                     hover:bg-yellow-300 border-gray-400 outline-0 bg-accent">
                    <NewDraftIcon />
                    {/* <img src="/newDraft.svg" alt="" /> */}
                    New Draft</button>
            </div>
            {openModal && createPortal(<CreateNewDraft setDrafts={setDrafts} owner={user} close={() => setOpenModal(false)} />, document.getElementById('modal') as Element)}
        </div>
    );
}

export default DraftSideBar;