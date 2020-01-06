export function stringifyTagValue(value: string): string {
    return value.replace(/ /g, '\\ ').replace(/,/g, '\\,').replace(/=/g, '\\=');
}

export function stringifyValue(value: any): string {
    switch (typeof (value)) {
        case "boolean":
        case "number":
            return value.toString();
        case "string":
            return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
        default:
            throw `invalid influx value ${value}`;
    }
}

export function getLine(measurement: string, tags: { [column: string]: string } | null, values: { [column: string]: any }, timestamp_ns?: number) {
    let body = measurement;
    if (tags) {
        for (let tag in tags) {
            body += `,${tag}=${stringifyTagValue(tags[tag])}`;
        }
    }
    body += ' ';
    let first = true;
    for (let field in values) {
        let value = values[field];
        if (value == null)
            continue;

        if (!first) {
            body += ',';
        } else {
            first = false;
        }

        body += `${field}=${stringifyValue(value)}`;
    }

    if (timestamp_ns != null) {
        body += ` ${timestamp_ns}`;
    }
    return body;
}