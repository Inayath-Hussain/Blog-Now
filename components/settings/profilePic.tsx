import Image from "next/image";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface Iprops {
    preview: string
    setPreview: Dispatch<SetStateAction<string>>
    profilePicUrl: string
    selectImg: (e: ChangeEvent<HTMLInputElement>) => void
    handleProfilePicSave: () => Promise<void>
}

const SettingsProfilePic: React.FC<Iprops> = ({ preview, setPreview, profilePicUrl, selectImg, handleProfilePicSave }) => {
    return (
        <div className="w-min">
            <label htmlFor="profile pic" className="font-semibold text-2xl">Profile Picture</label>
            {preview ?
                <div className="flex flex-col justify-around items-center">

                    <div className="relative">
                        <a href="#" target="_blank">
                            <img width={300} height={300} src={preview} className="rounded-half" alt="" />
                        </a>
                        <button onClick={() => setPreview('')} className="rounded-half p-2 outline-0 border-none bg-slate-300 absolute top-0 right-10">
                            <Image width={20} height={20} className="hover:cursor-pointer z-10" src="/trash.svg" alt="" />
                        </button>
                    </div>

                </div>
                :
                <label className="bg-slate-300 hover:cursor-pointer w-[300px] h-[300px] flex flex-col justify-center items-center p-8 rounded-half">
                    <Image width={80} height={80} src="/upload.svg" alt="" />
                    <p className="font-semibold text-lg">Upload Photo</p>
                    <input type="file" accept="image/*" className="hidden" id="profile pic" onChange={selectImg} />
                </label>
            }
            {(preview !== profilePicUrl) &&
                <div className="flex flex-col justify-around items-center">
                    <button onClick={handleProfilePicSave} className="p-2 mt-4 rounded-lg hover:cursor-pointer hover:text-white bg-primary-btn"
                    >Save Pic</button>
                </div>
            }
        </div>
    );
}

export default SettingsProfilePic;