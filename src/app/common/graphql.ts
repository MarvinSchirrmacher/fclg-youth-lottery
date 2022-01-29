export function toGraphQL(object: any): string {
    var json = JSON.stringify(object, (key, value) => {
        if (Number.isNaN(value) || value === '')
            return undefined;

        if (value instanceof Date)
            return value.toISOString();

        return value;
    });

    return json.replace(/\"(\w*)\":/g, "$1:");
}