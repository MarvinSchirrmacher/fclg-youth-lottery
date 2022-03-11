export function toGraphQL(object: any, formats?: Map<string, string>): string {
    var json = JSON.stringify(object, (key, value) => {
        if (Number.isNaN(value) || value === '')
            return undefined;

        if (value instanceof Date)
            return value.toISOString();

        if (formats && formats.has(key))
            return formats.get(key)?.replace('%s', value)

        return value;
    });

    return json.replace(/\"(\w*)\":/g, "$1:");
}