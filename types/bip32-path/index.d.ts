declare module 'bip32-path' {
    export interface Bip32Path {
        toString(noRoot?: boolean, oldStyle?: boolean): string
        toPathArray()
    }

    /**
     * Creates an instance from a path written as text.
     * @param val
     * @param reqRoot Set to true if the m/ prefix is mandatory.
     */
    export function fromString(val: string, reqRoot?: boolean): Bip32Path

    /**
     * Returns true if the input is a valid path string
     * @param path
     * @param reqRoot
     */
    export function validateString(path: string, reqRoot: boolean)

    /**
     * returns true if the input is a valid binary path array
     * @param path
     */
    export function validatePathArray(path: string)
}
