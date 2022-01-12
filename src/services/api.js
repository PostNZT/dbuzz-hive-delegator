import fs from 'fs'
import config from '../../config.json'
import hiveInterface from '../config/hiveInterface'
import { 
    hasDelegatedTo, 
    hasEnoughHP,
    getUser,
    hasNoRC,
    isMuted,
    isTrue,
    hasSetBeneficiary,
    notifyUser,
    notifyAdmin,
    hasExceededDelegationLength,
    hasBeneficiarySetting,
    notify
} from '../services/helper'
import { delegatePower } from '../components/profile'
import { STATUS } from './constants'
import { updateUser } from '../components/profile'

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

export function loadReferredUsers() {
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
    if (!await hasDelegatedTo(username) && !await hasEnoughHP(username) 
        && await hasNoRC(username) && !await isMuted(username) 
        && (!isTrue(config.beneficiaryRemoval) || await hasSetBeneficiary(username))) 
    {
        console.log(`Delege ${config.delegationAmount} HP to @${username}`)
        try {
            await delegatePower(process.env.ACTIVE_KEY, config.delegationAccount, username, parseFloat(config.delegationAmount))
        } catch (e) {
            notifyAdmin(`Delegation Manager: Failed to delegate Hive Power to @${username}. Error = ${e.message}`)
        }

        const user = getUser(username)
        if (user) {
            user.status = STATUS.DELEGATED
            user.delegatedAt = Date.now()
            user.delegatedAmount = parseFloat(config.delegationAmount)
            updateUser(user)
        }

        await notifyUser(username, config.delegationMessage)
    }
}


export async function removeDelegationIfNeeded(username) {
    const user = getUser(username)
    if (!user) {
        console.log(`\tuser @${username} not found!`)
    }

    async function removeDelegation(status, message) {
        await delegatePower(process.env.ACTIVE_KEY, config.delegationAccount, username, 0)
        user.status = status 
        user.delegationRemovedAt = Date.now()
        updateUser(user)
        console.log(`\tremoved delegation to @${username}; changed status to ${status}`)
        await notifyUser(username, message)
    }

    if (await hasEnoughHP(username)) {
        await removeDelegation(STATUS.GRADUATED, config.delegationMaximumMessage)
    } else if (await isMuted(username)) {
        await removeDelegation(STATUS.MUTED, config.delegationMuteMessage)
    } else if (await hasExceededDelegationLength(username)) {
        await removeDelegation(STATUS.EXPIRED, config.delegationLengthMessage)
    } else if (isTrue(config.benefeciaryRemoval) && !await hasBeneficiarySetting(username)) {
        await removeDelegation(STATUS.BENEFICIARY_REMOVED, config.delegationBenefeciaryMessage)
    } else {
        console.log(`\t Keeped the delegation to @${username}`)
    }
}