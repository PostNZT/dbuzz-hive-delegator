import { streamOperations, removeDelegationIfNeeded } from './services/api'
import { getDelegatedUsers } from './services/helper'
import { whenReferredUserCreated, whenReferredUserTakeActions } from './components/streamingOperations'
 
async function monitorAccountUsers() {
    console.log(`#1: Monitor new and inactive referred account users`)
    console.log(`Monitoring stream operation started!`)
    await streamOperations([whenReferredUserCreated, whenReferredUserTakeActions])
}

async function monitorDelegatedUsers() {
    console.log(`#2 Monitor delegated users status`)
    const job = async () => {
        const users = await getDelegatedUsers()
        console.log(`DBuzz have delegated to ${users.length} users`, users)
        if (users.length > 0) {
            await Promise.all(users.map(user => removeDelegationIfNeeded(user)))
            console.log(`Checked delegated users status: DONE!`)
        }
    }
}


async function main() {
    await Promise.all([
        monitorAccountUsers(),
        monitorDelegatedUsers(),
    ])
}

main()