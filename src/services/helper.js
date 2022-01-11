import { STATUS } from '../services/constants'
import { getAccount } from '../components/profile'
import dHiveClient from '../config/dHive'
import config from '../../config.json'
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

export function hasBeneficiarySetting(account, referrer) {
    let jsonMetadata = account.json_metadata
    if (jsonMetadata) {
        jsonMetadata = JSON.parse(jsonMetadata)
        const beneficiaries = jsonMetadata.beneficiaries
        if (beneficiaries && beneficiaries.length > 0) {
            const referred = beneficiaries.filter(b => b.name === referrer)
            if (referred && referred.length > 0 && referred[0].label === 'referrer') {
                return referred[0]
            }
        }
    }

    return false
}

export async function ownedPower(username) {
    const account = await getAccount(username) 
    const avail = parseFloat(account.vesting_shares)

    const props =  await dHiveClient.database.getDynamicGlobalProperties()
    const vestHive = parseFloat(parseFloat(props.total_vesting_fund_hive) * (parseFloat(avail) / parseFloat(props.total_vesting_shares)), 6)
    return vestHive
}

export  async function getDelegatedUsers() {
    const users = Object.values(referredUsers)
    return users.filter(user => user.status === STATUS.DELEGATED).map(user => user.account)
}

export async function hasDelegatedTo(username) {
    const delegated = await getDelegatedUsers()
    if (delegated.includes(username)) {
        return true
    } else {
        return false
    }
}

export async function hasEnoughHP(username) {
    const hp = await ownedPower(username)
    const maxHP = parseFloat(config.maximumUserHivePower) || 30
    return hp >= maxHP
}

export async function delegatePower(wif, username, receiver, hp) {
    const account = await getAccount(username) 
    const avail = parseFloat(account.vesting_shares) - (parseFloat(account.to_withdraw)) - (parseFloat(account.withdrawn)) / 1e6 - parseFloat(account.delegated_vesting_shares)
    const props = await dHiveClient.database.getDynamicGlobalProperties()
    const vesting_shares = parseFloat(hp * parseFloat(props.total_vesting_shares) / parseFloat(props.total_vesting_fund_hive))
    if (avail > vesting_shares) {
        const ops = [[
            'delegate_vesting_shares',
            {
                delegator: username,
                delegatee: receiver,
                vesting_shares: Number(vesting_shares).toFixed(6) + ' VESTS'
            }
        ]]
        wif = PrivateKey.fromString(wif)
        dHiveClient.broadcast.sendOperations(ops, wif)
    } else {
        console.log(`Not enough Hive Power for Delegation!`)
    }

}

export async function hasNoRC(username) {
    const rc = await getAccountRC(username)
    const minComments = parseFloat(config.minimumPostRC) || 3

    return rc && rc < minComments * commentRcCost
}

export async function isMuted(username) {
    if (config.muteAccount) {
        const blacklist = await getMutedAccounts(config.muteAccount)
        return blacklist.includes(username)
    } else {
        return false
    }
}

export function isTrue(setting) {
    return setting && ('' + setting).toLowerCase() === 'true'
}

export async function hasSetBeneficiary(username) {
    const account = await getAccount(username)
    return hasBeneficiarySetting(account, config.referrerAccount)
}

export async function notifyUser(user, message) {
    if (isTrue(config.notifyUser)) {
        await notify(user, message)
    }
}

export async function notify(receiver, message) {
    await sendMessage(process.env.ACTIVE_KEY, config.delegationAccount, receiver, message)
}