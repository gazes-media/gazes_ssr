export function spliceText(str: string, max: number) {
    let text = str.replace(/<[^>]*>/g, '');
    // convert every word to an array
    let words = text.split(' ');
    // create a variable to hold the final string
    let final = '';
    // loop through the array of words
    if(words.length <= max) return strToUtf8(text);
    for (let i = 0; i < words.length; i++) {
        // if the length of the final string is less than the max
        if(final.split(' ').length < max) {
            // add the word to the final string
            final += words[i] + ' ';
        }
    }
    // return the final string
    return strToUtf8(final) + '...';
}

export function strToUtf8(html: string) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";    
}
export function convertEpisodeToNumber(episode: string) {
    return Number(episode.match(/\d+/g));
}

export function chunkify<T>(array: Array<T>, chunkSize: number): Array<Array<T>> {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
    }