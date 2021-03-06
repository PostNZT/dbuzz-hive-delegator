import hiveClient from '../config/hive'
import dHiveClient from '../config/dHive'
import axios from 'axios'
import { SCOT_API_HOST, HIVE_ENGINE_API_HOST } from '../config/config'
import { parseNumber } from '../services/helper'
import { PrivateKey } from '@hiveio/dhive'
import { addToReferredUsers } from '../services/api'

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

export async function getAccountRC(username) {
    return new Promise((resolve, reject) => {
        hiveClient.api.call(
            'rc_api.find_rc_accounts',
            { accounts: [username] },
            function (err, res) {
                if (err) {
                    reject(err)
                } else {
                    if (res.rc_accounts && res.rc_accounts.length > 0) {
                        const rc = res.rc_accounts[0]
                        const CURRENT_UNIX_TIMESTAMP = parseInt((Date.now() / 1000).toFixed(0))
                        const elapsed = CURRENT_UNIX_TIMESTAMP - rc.rc_manabar.last_update_time
                        const maxMana = rc.max_rc
                        // calculate current mana for the 5 day period (432000 sec = 5 days)
                        let currentMana = parseFloat(rc.rc_manabar.current_mana) + (elapsed * maxMana) / 432000
                        if (currentMana > maxMana) {
                            currentMana = maxMana
                        }
                        resolve(currentMana)
                    } else {
                        resolve(null)
                    }
                }
            }
        )
    })
}

export async function getMutedAccounts(account, limit = 200) {
    return new Promise((resolve, reject) => {
        hiveClient.api.getFollowing(account, '', 'ignore', limit, function (err, res) {
            if (err) {
                reject(err)
            } else {
                const accounts = res.map(item => item.following)
                resolve(accounts)
            }
        })
    })
}


export async function sendMessage(wif, from, to, message) {
    await dHiveClient.broadcast.transfer({
        from,
        to,
        amount: '0.001 HIVE',
        memo: message
    }, PrivateKey.fromString(wif))
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

export function updateUser(user) {
    referredUsers = addToReferredUsers([user])
    console.log(`Updated user data for ${user.account}`)
}