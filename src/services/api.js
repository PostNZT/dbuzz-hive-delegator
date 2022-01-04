import fs from 'fs'
import hiveInterface from '../config/hiveInterface'
import { hasDelegatedTo, hasEnoughHP } from '../services/helper'

const userDataFile = 'users.json'

export async function streamOperations(callbacks, options = {}) {
    return await hiveInterface.stream({
        on_op: (op, block_num, block_id, previous_block, trx_id, timestamp) => {
            const operation = {
                trx_id,
                timestamp,
                op,
            }

            if (callbacks && callbacks.length > 0) {
                callbacks.forEach(callback => {
                    callback(operation)
                })
            }
        }
    })
}

export function getOperationWorker(op) {
    const name = op.op[0]
    const params = op.op[1]

    switch(name) {
        case 'vote':
            return params.voter
        case 'comment':
            return params.author
        case 'transfer':
            return params.from
        case 'custom_json':
            if (params.required_auths && params.required_auths.length > 0) {
                return params.required_auths[0]
            } else if (params.required_posting_auths && params.required_posting_auths.length > 0) {
                return params.required_posting_auths[0]
            } else {
                return null
            }
        default: 
            return null
    }
}

export function saveReferredUsers(users) {
    /**
     * @description => Save referred accounts into file.
     */
    fs.writeFileSync(userDataFile, JSON.stringify(users, null, 2))
    console.log(`Saved user data to: `, userDataFile)
}

function loadReferredUsers() {
    let users = {}
    if (fs.existsSync(userDataFile)) {
        const text = fs.readFileSync(userDataFile)
        if (text && text.length > 0) {
            users = JSON.parse(text)
        }
    }

    return users
}


export function addToReferredUsers(users) {
    let usersMap = {}
    for (let user of users) {
        usersMap[user.account] = user
    }

    const loaded = loadReferredUsers()
    const newUsers = { ...loaded, ...usersMap }
    saveReferredUsers(newUsers)

    return newUsers
}

/**
 * @description delegate to user
 */
export async function delegateToUser(username) {
    if (!await hasDelegatedTo(username) && !await hasEnoughHP(username)) {
        
    }
}