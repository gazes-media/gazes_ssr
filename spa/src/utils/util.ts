export function spliceText(str: string, max: number) {
    let text = str.replace(/<[^>]*>/g, '');
    // convert every word to an array
    let words = text.split(' ');
    // create a variable to hold the final string
    let final = '';
    // loop through the array of words
    if (words.length <= max) return htmlToText(text);
    for (let i = 0; i < words.length; i++) {
        // if the length of the final string is less than the max
        if (final.split(' ').length < max) {
            // add the word to the final string
            final += words[i] + ' ';
        }
    }
    // return the final string
    return htmlToText(final) + '...';
}

export function chunkify<T>(arr: T[], size: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size));
    }
    return res;
}

export function upscaleImage(url: string) {
    return url.replace("/3/", "/1/")
}

export function replaceUrlToGazesURL(url: string, episode: string) {
    return "/anime/" + url.match(new RegExp(/\/(\d+)/, "i"))?.[1] + "/episode/" + convertEpisodeToNumber(episode);
}

export function convertEpisodeToNumber(episode: string) {
    return Number(episode.match(/\d+/g));
}

export function htmlToText(html: string) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || html;
}