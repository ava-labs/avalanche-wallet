/**
 * Does `action` at every `interval` until `timeout`. Emits `callback` when finished.
 * @param action Function to call on every interval. If action returns `true` the interval will cancel.
 * @param interval in ms
 * @param timeout in ms
 * @param callback
 */
export async function setTimeoutInterval(
    action: () => Promise<boolean>,
    interval: number,
    timeout: number
): Promise<void> {
    const start = performance.now()
    const end = start + timeout

    return new Promise((resolve, reject) => {
        const intervalID = setInterval(() => {
            try {
                const now = performance.now()

                if (now > end) {
                    clearInterval(intervalID)
                    reject(new Error('Timeout'))
                    return
                }

                // Do action every interval
                action()
                    .then((res) => {
                        // If action returns true, stop interval
                        if (res) {
                            clearInterval(intervalID)
                            resolve()
                        }
                    })
                    .catch((err) => {
                        clearInterval(intervalID)
                        reject(err)
                    })
            } catch (e) {
                clearInterval(intervalID)
                reject(e)
            }
        }, interval)
    })
}
