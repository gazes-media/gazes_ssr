// build the sitemap.xml file

import { writeFileSync } from 'node:fs';
import { SitemapStream, streamToPromise } from 'sitemap';

enum statusEnum {
    ongoing = 1,
    inprogress,
}

enum genres {
    action = "action",
    adventure = "adventure",
    battleroyale = "battle royale",
    comedy = "c0m1dy",
    cyberpunk = "cyberpunk",
    drama = "drama",
    ecchi = "ecchi",
    fantasy = "fantasy",
    hentai = "hentai",
    horror = "horror",
    isekai = "isekai",
    mafia = "mafia",
    magic = "magic",
    mahoushoujo = "mahou shoujo",
    mecha = "mecha",
    military = "military",
    music = "music",
    mystery = "mystery",
    psychological = "psychological",
    romance = "romance",
    scifi = "sci-fi",
    shoujo = "shoujo",
    shounen = "shounen",
    sliceoflife = "slice of life",
    sport = "sports",
    supernatural = "supernatural",
    thriller = "thriller",
    yuri = "yuri"
}


interface ResponseApi<T> {
    success: boolean
    data: T
}

interface Anime {
    id: number
    title: string
    title_english: string
    title_romanji: string
    title_french: any
    others: string
    type: string
    status: statusEnum
    popularity: number
    url: string
    genres: genres[]
    url_image: string
    score: string
    start_date_year: string
    nb_eps: string
}

async function animes(): Promise<Anime[]> {
    let res = await fetch("https://api.gazes.fr/anime/animes");
    let json: ResponseApi<Anime[]> = await res.json();
    console.log(json.success);
    return json.data;
}

(async () => {


    let animeList: Anime[] = await animes();
    let siteMap = new SitemapStream({
        hostname: "https://gazes.fr",
    })

    siteMap.write({
        url: '/',
        changefreq: 'monthly',
        priority: 1,
    })
    siteMap.write({
        url: '/latest',
        changefreq: 'monthly',
        priority: 1,
    })
    siteMap.write({
        url: '/search',
        changefreq: 'monthly',
        priority: 1,
    })
    if (animeList.length > 0) {
        animeList.forEach((anime) => {
            siteMap.write({
                url: `/anime/${anime.id}`,
                changefreq: 'daily',
                priority: 0.8,
                lastmod: new Date().toISOString(),
                img: [
                    {
                        url: anime.url_image,
                    }
                ]
            })
        })
    }
    siteMap.end();
    const sitemap = await streamToPromise(siteMap).then((sm) => {
        return sm.toString();
    })

    writeFileSync("./public/sitemap.xml", sitemap,{
        encoding: "utf-8",
        flag:"w+"
    });
    console.log("sitemap.xml generated");
})();