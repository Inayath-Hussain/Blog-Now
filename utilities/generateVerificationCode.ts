import crypto from 'crypto'

export const generateVerificationCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase().slice(4)
}