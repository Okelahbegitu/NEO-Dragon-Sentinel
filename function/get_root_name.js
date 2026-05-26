function get_root_name(hostname) {

    if (!hostname) return null;

    const parts =
        hostname.split('.');

    return parts[0];
}

module.exports = get_root_name;