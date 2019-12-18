export const isSessionStorageAvailable = (): boolean => !!window.sessionStorage;

export const throwIfSessionStorageUnavailable = () => {

    if (!isSessionStorageAvailable()) {
        throw new Error('[tabtalk] session storage is not available.')
    }
}

/**
 * Returns a pseudo-random uuid.
 */
export const generateUuid = () => {
    let uuid = '';

    for(let i = 0; i < 10; i++) {
        uuid = uuid.concat(getRandomLetter());
    }
    
    return `${uuid}-${Date.now()}`;
}

/**
 * Returns a random letter ranging from a to z.
 * @param isUpperCase (default true) Determines whether the random letter should be upper case.
 */
export const getRandomLetter = (isUpperCase = true) => {
    const letter = String.fromCharCode(97 + getRandomInteger(25));
    return isUpperCase ? letter.toUpperCase() : letter;
}

export const getRandomInteger = (maxInteger: number) => {
    return Math.round(Math.random() * Math.floor(maxInteger));
}