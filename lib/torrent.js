const {formatSize} = require('./utils');

class Torrent {
    constructor(
        {
            author = null,
            category = null,
            categoryId = null,
            torrentId = null,
            leeches = null,
            seeds = null,
            size = null,
            state = null,
            title = null,
            downloads = null,
            registered = null,
            host = null,
            hash = null
        }
    ) {
        this.author     = author;
        this.category   = category;
        this.categoryId = categoryId;
        this.torrentId  = torrentId;
        this.leeches    = leeches;
        this.seeds      = seeds;
        this.size       = size;
        this.state      = state;
        this.title      = title;
        this.downloads  = downloads;
        this.registered = registered;
        this.host       = host;
        this.hash       = hash;
    }

    get formattedSize() {
        const {size} = this;

        return formatSize(size);
    }

    get url() {
        const {host, id} = this;

        return `${host}/forum/viewtopic.php?t=${id}`;
    }
}

Torrent.APPROVED     = 'проверено';
Torrent.NOT_APPROVED = 'не проверено';
Torrent.NEED_EDIT    = 'недооформлено';
Torrent.DUBIOUSLY    = 'сомнительно';
Torrent.CONSUMED     = 'поглощено';
Torrent.TEMPORARY    = 'временная';

module.exports = Torrent;
