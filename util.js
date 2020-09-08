/**
 * Returns all methods of given class (static and object)
 * @param klass A class to get methods of.
 * @returns {string[]} An array of all method names.
 * @author Mikhail Kormanowsky
 * @since 2.1.0
 */
function allMethodsOf(klass) {
    let objectMethods = Object.getOwnPropertyNames(klass.prototype).filter(method => typeof klass.prototype[method] === "function"),
        staticMethods = Object.getOwnPropertyNames(klass).filter(method => typeof klass[method] === "function");
    return objectMethods.concat(staticMethods);
}

/**
 * Converts input in camelCase to kebab-case.
 * @param input The input string.
 * @returns {string} The converted string.
 * @author Mikhail Kormanowsky
 * @since 2.1.0
 */
function camelToKebab(input) {
    for (let i = 0; i < input.length; ++i) {
        if (input[i].toUpperCase() === input[i] && i > 0) {
            input = input.replace(input[i], "-" + input[i].toLowerCase());
        }
    }
    return input.toLowerCase();
}

export {
    allMethodsOf, camelToKebab
}