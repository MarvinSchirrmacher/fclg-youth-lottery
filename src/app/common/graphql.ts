export function toGraphQL(object: any, formats?: Map<string, string>): string {
  var json = JSON.stringify(object, (key, value) => {
    if (formats && formats.has(key))
      return formats.get(key)?.replace('%s', value)

    if (isEmpty(value))
      return undefined;

    if (isDate(value))
      return value.toISOString();

    return value;
  });

  return json.replace(/\"(\w*)\":/g, "$1:");
}

function isEmpty(value: any): boolean {
  return Number.isNaN(value) || value === ''
}

function isDate(value: any): boolean {
  return value instanceof Date
}