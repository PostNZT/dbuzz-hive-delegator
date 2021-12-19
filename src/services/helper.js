import { addToReferredUsers } from '../services/api'

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export const parseNumber = (data) => {
    if (typeof data === 'string') {
        data = data.replace(/[,%$]+/g, '')
    }
    
    return parseFloat(data)
}

let referredUsers = {}

export function getUser(username) {
    return referredUsers[username]
}

export function updateUser(user) {
    referredUsers = addToReferredUsers([user])
    console.log(`Updated user data for ${user.account}`)
}

export function containsUser(username) {
    const usernames = Object.keys(referredUsers)
    return usernames.includes(username)
}