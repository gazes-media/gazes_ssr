let fetcher = <T>(uri: string): Promise<T> => {
    return fetch("https://api.gazes.fr/anime"+uri).then((res) => res.json()) as Promise<T>;
}

export enum statusEnum {
    ongoing  = 1,
    inprogress,
}

export enum langEnum {
    vf = "vf",
    vostfr = "vostfr",
}

export interface AnimeWatched {
  id: number;
  episode: number;
  time: number;
  duration: number;
}

export enum genres {
    action = "action",
    adventure= "adventure",
    battleroyale= "battle royale",
    comedy = "c0m1dy",
    cyberpunk = "cyberpunk",
    drama ="drama",
    ecchi = "ecchi",
    fantasy = "fantasy",
    hentai = "hentai",
    horror = "horror",
    isekai = "isekai",
    mafia = "mafia",
    magic ="magic",
    mahoushoujo = "mahou shoujo",
    mecha = "mecha",
    military = "military",
    music ="music",
    mystery=  "mystery",
    psychological = "psychological",
    romance = "romance",
    scifi = "sci-fi",
    shoujo=  "shoujo",
    shounen = "shounen",
    sliceoflife = "slice of life",
    sport ="sports",
    supernatural = "supernatural",
    thriller ="thriller",
    yuri="yuri"
}
export const genreEnums = {
    action : "action",
    adventure: "adventure",
    "battle royale": "battle royale",
    "c0m1dy": "comedy",
    cyberpunk: "cyberpunk",
    drama :"drama",
    ecchi: "ecchi",
    fantasy: "fantasy",
    hentai: "hentai",
    horror: "horror",
    isekai: "isekai",
    mafia: "mafia",
    magic :"magic",
    "mahou shoujo": "mahou shoujo",
    mecha: "mecha",
    military: "military",
    music :"music",
    mystery:  "mystery",
    psychological: "psychological",
    romance: "romance",
    "sci-fi": "sci-fi",
    shoujo:  "shoujo",
    shounen: "shounen",
    "slice of life": "slice of life",
    sports :"sports",
    supernatural: "supernatural",
    thriller :"thriller",
    yuri:"yuri"
}
export type AnimesFilter = {
    year?: number,
    status?: statusEnum,
    genres?: genres[],
    lang?: langEnum,
    title?: string,
}

export interface ResponseApi<T> {
    success: boolean
    data: T
  }
  

export interface Hilhlighted {
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
    synopsis: string
    coverUrl: string
    episodes: Episode[]
  }
  
export interface Episode {
    time: string
    episode: string
    num: number
    title: string
    url: string
    url_image: string
  }
  
export type seasons = {
    year: number,
    fiche: Anime
}

export type seasonal = {
  title: string,
  title_english: string,
  title_romanji: string,
  genres: string[],
  cover_url: string,
  ids: number[],
  seasons: seasons[]
}


  export interface Anime {
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
  
  export interface LatestEpisode {
    anime_url: string;
    episode: string;
    icons: string;
    lang: string;
    time: string;
    timestamp: number;
    title: string;
    url: string;
    url_bg: string;
    url_image: string;
  }

  export interface EpisodeWithVideo {
    vostfr: Vostfr
    vf: Vf
  }
  
  export interface Vostfr {
    videoUri: string
    videoVtt: any[]
    videoBaseUrl: string
    time: string
    episode: string
    num: number
    title: string
    url: string
    url_image: string
  }
  
  export interface Vf {
    videoUri: string
    videoVtt: any[]
    videoBaseUrl: string
    time: string
    episode: string
    num: number
    title: string
    url: string
    url_image: string
  }
  
  export interface FicheAnime {
    id: number
    title: string
    title_english: string
    title_romanji: string
    title_french: any
    others: string
    type: string
    status: string
    popularity: number
    url: string
    genres: string[]
    url_image: string
    score: string
    start_date_year: string
    nb_eps: string
    synopsis: string
    coverUrl: string
    episodes: Episode[]
  }
  
  export interface Episode {
    time: string
    episode: string
    num: number
    title: string
    url: string
    url_image: string
  }
  
export async function animes(filter?: AnimesFilter): Promise<Anime[]>{
    let filterBuild = new URLSearchParams();
    if(filter?.year) filterBuild.append("year", filter.year.toString());
    if(filter?.status) filterBuild.append("status", filter.status.toString());
    if(filter?.genres) filterBuild.append("genres", filter.genres.join(","));
    if(filter?.lang) filterBuild.append("lang", filter.lang);
    if(filter?.title) filterBuild.append("title", filter.title);
    let res = await fetcher<ResponseApi<Anime[]>>("/animes?"+filterBuild.toString());
    return res.data;
}

export async function highlighted() : Promise<Hilhlighted>{
    let res = await fetcher<ResponseApi<Hilhlighted>>("/animes/highlighted");
    return res.data;
}

export async function trends(): Promise<Anime[]>{
    let res = await fetcher<Anime[]>("/animes/trends");
    return res;
}

export async function seasonalAnimes(props?:{
  title?: string,
  id?: number
  page?: number
}): Promise<seasonal[]>{
    let filterBuild = new URLSearchParams();
    if(props){
    if(props.title) filterBuild.append("title", props.title);
    if(props.id) filterBuild.append("id", props.id.toString());
    if(props.page) filterBuild.append("page", props.page.toString());
    }
    let res = await fetcher<ResponseApi<seasonal[]>>("/animes/seasons?"+filterBuild.toString());
    return res.data;
}

export async function latest(): Promise<LatestEpisode[]>{
    let res = await fetcher<ResponseApi<LatestEpisode[]>>("/animes/latest");
    return res.data;

}

export async function getEpisodeAnimeId(animeId: number, episode: number){
    let res = await fetcher<ResponseApi<EpisodeWithVideo>>("/animes/"+animeId+"/"+episode);
    return res.success ? res.data : undefined;
}

export async function getFicheAnime(animeId: number){
    let res = await fetcher<ResponseApi<FicheAnime>>("/animes/"+animeId);
    return res.data;
}