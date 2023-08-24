export const convertToPlainText = (content: string) => {
    return content.replaceAll(/(<([^>]+)>)/ig, '').replaceAll(/(&([^>]+);)/ig, "")
}