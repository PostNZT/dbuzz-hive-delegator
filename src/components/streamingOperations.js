import config from '../../config.json'
import { containsUser, updateUser } from '../services/helper'
import { hasBeneficiarySetting } from './account'

/**
 * @description => Streaming operation and listen to account creation operation 
 */

export function whenReferredUserCreated(op) {
    const name = op.op[0]
    if ([`create_claimed_account`, 'account_create'].includes(name)) {
        const account = op.op[1]
        const referred = hasBeneficiarySetting(account, config.referrerAccount)
        if (referred) {
            const username = account.new_account_name
            console.log(`Referred user has been created: `, username)
            if (!containsUser(username)) {
                updateUser({
                    account: username,
                    weight: referred.weight,
                    timestamp: new Date(op.timestamp + 'Z').getTime()
                })
            } else {
                console.log(`Referred user @${username} already exists, skip.`)
            }
        }
    }
}