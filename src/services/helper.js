export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export const parseNumber = (data) => {
    if (typeof data === 'string') {
        data = data.replace(/[,%$]+/g, '')
    }
    
    return parseFloat(data)
}