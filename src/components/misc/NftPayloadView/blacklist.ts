export const URLBLacklist = [`avax-reward.su`]

/***
 * Checks if the given URL partially matches anything in the blacklist.
 * @param url
 */
export function isUrlBanned(url: string) {
    for (var i = 0; i < URLBLacklist.length; i++) {
        if (url.includes(URLBLacklist[i])) {
            return true
        }
    }
    return false
}
