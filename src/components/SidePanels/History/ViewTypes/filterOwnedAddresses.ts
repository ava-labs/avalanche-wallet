/**
 * Filter out addresses not in the given myAddresses array
 * @param myAddresses Owned addresses to filter against
 * @param addresses Array of addresses to filter
 */
export function filterOwnedAddresses(myAddresses: string[], addresses: string[]) {
    myAddresses = myAddresses.map((addr) => addr.split('-')[1] || addr)
    addresses = addresses.map((addr) => addr.split('-')[1] || addr)

    return addresses.filter((addr) => {
        return myAddresses.includes(addr)
    })
}
