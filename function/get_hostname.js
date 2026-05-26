function get_hostname(url){
    try {
        const { hostname } = new URL(url)
        .hostname
        .replace('www.', '')
        .toLocaleLowerCase();
        return hostname;
    }catch (error) {
        return null;
    }
}

module.exports = get_hostname;