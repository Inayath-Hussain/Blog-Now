import { delete_access, delete_refresh, delete_profilePicUrl } from "@/utilities/serialize";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = <string[]>[]
    cookies.push(delete_access())
    cookies.push(delete_refresh())
    cookies.push(delete_profilePicUrl())

    res.setHeader('Set-Cookie', [...cookies])
    return res.status(200).json({ message: 'success' })
}

export default handler;