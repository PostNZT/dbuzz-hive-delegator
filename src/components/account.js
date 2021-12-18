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