// import { deleteImg, deleteImgs } from "@/utilities/s3"
// import { NextApiRequest, NextApiResponse } from "next"
// // import s3_bucket from "@/utilities/s3";

// const handler = (req: NextApiRequest, res: NextApiResponse) => {
//     if (req.method === 'POST') {
//         const { keys }: { keys: string[] } = req.body
//         console.log(keys)

//         interface Ikey {
//             Key: string
//         }

//
//         // const object_keys: Ikey[] = keys.map(key => ({ Key: key }))

//         deleteImgs(keys, (er: any, d: any) => {
//             if (er) {
//                 console.log('deleteImg error...', er)
//                 return res.status(500).json({ error: 'S3 delete error' })
//             }

//             console.log(d)
//             return res.status(200)
//         })
//         // return res.status(200)
//     }
// }

// export default handler;