import { STATUS } from '../services/constants'
import hiveClient from '../config/hive'
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

export async function getAccount(account) {
    return new Promise((resolve, reject) => {
        hiveClient.api.getAccounts([account], function (err, res) {
            if (err) {
                reject(err)
            } else {
                if (res && res.length > 0) {
                    resolve(res[0])
                } else {
                    resolve({})
                }
            }
        })
    })
}

export async function ownedPower(username) {
    const account = await getAccount(username) 
    const avail = parseFloat(account.vesting_shares)

    const props =  await dHiveClient.database.getDynamicGlobalProperties()
    const vestHive = parseFloat(parseFloat(props.total_vesting_fund_hive) * (parseFloat(avail) / parseFloat(props.total_vesting_shares)), 6)
    return vestHive
}

async function getDelegatedUsers() {
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