const Parser       = require("./lib/parser");
const PageProvider = require("./lib/page-provider");

class RutrackerApi {
    constructor() {
        this.parser       = new Parser();
        this.pageProvider = new PageProvider();
    }

    login({username, password}) {
        return this.pageProvider.login(username, password);
    }

    search({query, sort, order}) {
        return this.pageProvider
            .search({query, sort, order})
            .then(html => this.parser.parseSearch(html));
    }

    download(id) {
        return this.pageProvider.torrentFile(id);
    }

    getMagnetLink(id) {
        return this.pageProvider
            .thread(id)
            .then(html => this.parser.parseMagnetLink(html));
    }

    get(id) {
        return this.pageProvider
            .thread(id)
            .then(html => this.parser.parsePage(html));
    }

    url(url) {
        return this.pageProvider
            .url(url)
            .then(html => this.parser.parsePage(html));
    }

    content(id) {
        return this.pageProvider
            .content(id)
            .then(html => this.parser.parseContent(html));
    }
}

module.exports = RutrackerApi;
