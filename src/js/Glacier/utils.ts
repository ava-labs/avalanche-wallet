export function cleanAddrs(addresses: string[]) {
    return addresses.map((addr) => addr.split('-')[1] || addr)
}

export function splitToParts<ArrayType>(array: ArrayType[], size: number) {
    if (!size) return [array]
    const parts = []
    const copy = [...array]
    while (copy.length) {
        parts.push(copy.splice(0, size))
    }
    return parts
}
