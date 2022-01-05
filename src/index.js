import { streamOperations } from './services/api'
import { whenReferredUserCreated, whenReferredUserTakeActions } from './components/streamingOperations'
 
async function monitorAccountUsers() {
    console.log(`#1: Monitor new and inactive referred account users`)
    console.log(`Monitoring stream operation started!`)
    await streamOperations([whenReferredUserCreated, whenReferredUserTakeActions])

}


async function main() {
    await Promise.all([
        monitorAccountUsers(),
    ])
}

main()