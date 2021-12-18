import config from '../config/config'
import { hasBeneficiarySetting } from './account'

export function whenReferredUserCreated(op) {
    const name = op.op[0]
    if ([`create_claimed_account`, 'account_create'].includes(name)) {
        const account = op.op[1]
        const referred = hasBeneficiarySetting(account, config.referrerAccount)
    }
}