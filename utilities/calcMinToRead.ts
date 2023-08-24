import { convertToPlainText } from "./convertToPlainText"

export const calculateMinToRead = (content: string) => {
    const wpm = 250 // words per minute
    const cleanContent = convertToPlainText(content)
    const wordCount = cleanContent.trim().split(/\s+/).length;
    const time = Math.ceil(wordCount / wpm)

    return time;
}