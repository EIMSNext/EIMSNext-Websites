export default function toCase(str) {
    const to = str.replace(/(-[a-z])/g, function (v) {
        return v.replace('-', '').toLocaleUpperCase();
    });

    return lower(to);
}

export function upper(str) {
    return str.replace(str[0], str[0].toLocaleUpperCase());
}

export function lower(str) {
    return str.replace(str[0], str[0].toLowerCase());
}
