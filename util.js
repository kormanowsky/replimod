function camelCaseToHyphen(input) {
    for (let i = 0; i < input.length; ++i) {
        if (input[i].toUpperCase() === input[i] && i > 0) {
            input = input.replace(input[i], "-" + input[i].toLowerCase());
        }
    }
    return input.toLowerCase();
}


export {
    camelCaseToHyphen
}