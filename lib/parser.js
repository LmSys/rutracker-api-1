const cheerio = require("cheerio");
const Torrent = require("./torrent");

class Parser {
    constructor() {
        this.host = "http://rutracker.org";
    }

    parseSearch(rawHtml) {
        const $       = cheerio.load(rawHtml, {decodeEntities: false});
        const results = [];

        let tracks     = $("#tor-tbl tbody").find("tr");
        const {length} = tracks;

        for (let i = 0; i < length; i += 1) {
            // Ah-m... Couldn't find any better method
            const document   = tracks.find("td");
            const state      = document.next();
            const category   = state.next();
            const title      = category.next();
            const author     = title.next();
            const size       = author.next();
            const seeds      = size.next();
            const leeches    = seeds.next();
            const downloads  = leeches.next();
            const registered = downloads.next();

            const id = title.find("div a").attr("data-topic_id");

            // Handle case where search has no results
            if (id) {
                const torrent = new Torrent({
                    state:      state.attr("title"),
                    id:         title.find("div a").attr("data-topic_id"),
                    category:   category.find(".f-name a").html(),
                    categoryId: category.find('.f-name a').attr('href').replace(/.*?f=([0-9]*)$/g, '$1'),
                    title:      title.find("div a ").html(),
                    author:     author.find("div a ").html(),
                    size:       Number(size.find("*").html()),
                    seeds:      Number(seeds.find("b").html()),
                    leeches:    Number(leeches.find("b").html()),
                    downloads:  Number(downloads.html()),
                    registered: new Date(Number(registered.find("u").html()) * 1000),
                    host:       this.host
                });

                results.push(torrent);
            }

            tracks = tracks.next();
        }

        return results;
    }

    parseMagnetLink(rawHtml) {
        const $ = cheerio.load(rawHtml, {decodeEntities: false});

        return $(".magnet-link").attr("href");
    }

    parsePage(rawHtml) {
        const $ = cheerio.load(rawHtml, {decodeEntities: false});

        const img        = $('var.postImg').attr('title');
        const body       = $('.post_body .post-font-serif1').text();
        const categories = $('.nav.w100.pad_2 a').map((index, a) => $(a).text()).get();
        const seed       = $('.seed > b').text();
        const leech      = $('.leech > b').text();
        const hash       = $('#tor-hash').text();

        return {img, body, categories, seed, leech, hash};
    }

    parseContent(rawHtml) {
        rawHtml = rawHtml.replace(new RegExp('<b>|</b>|<s>|</s>|<i>|</i>|<div>|</div>', 'g'), '');

        const $ = cheerio.load(rawHtml, {decodeEntities: false});
        const data = [];

        $('li').each((index, element) => {
            const length = $(element).parents().length;

            data.push({
               level: length-2,
               data:  element.children[0].data
            });
        });

        return data;
    }
}

module.exports = Parser;
