export const getNumberTextSync = () => {
    let ret = "";
    for (let i = 0; i < 10; i++) {
        ret += i;
    }
    return ret;
};

export const getNumberTextAsync = (induceError?: boolean) => {
    return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
            if (induceError) {
                reject("error.");
            } else {
                resolve(getNumberTextSync());
            }
        }, 1000);
    });
};