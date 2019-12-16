export const isSessionStorageAvailable = (): boolean => !!window.sessionStorage;

export const throwIfSessionStorageUnavailable = () => {
    if (!isSessionStorageAvailable) {
        throw new Error('[tabtalk] session storage is not available.')
    }
}
