import { parseFromString } from 'dom-parser';

export function chunkify<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

export function upscaleImage(url: string){
    return url.replace("/3/","/1/")
}

export function replaceUrlToGazesURL(url: string, episode: string){
    return "/anime/"+url.match(new RegExp(/\/(\d+)/,"i"))?.[1]+"/episode/"+convertEpisodeToNumber(episode);
}

export function convertEpisodeToNumber(episode: string){
    return Number(episode.match(/\d+/g));
}

export function htmlToText(html: string){
    const doc = parseFromString("<body>"+html+"</body>");
    return doc.getElementsByTagName("body")[0].textContent;
}