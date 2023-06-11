import { JWTPayload } from "jose";

// export interface Ipayload extends JWTPayload {
//     exp: number,
//     iat: number
// }

export interface Ipayload extends JWTPayload {
    email?: string
}

export interface IdraftsList {
    name: string,
    id: string
}