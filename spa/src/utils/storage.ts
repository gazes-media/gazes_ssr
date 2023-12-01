import { AnimeWatched } from "./apiFetcher";
import { auth, database } from "./database";
import { set, ref, get, child, remove } from "firebase/database";

export async function setAnime(episode: AnimeWatched) {
    const user = auth.currentUser;
    if (user) {
        const childRef = child(ref(database), `users/${user.uid}/animeList/${episode.id}`);
        await set(childRef, episode);
    }else{
        let data = localStorage.getItem("animeList");
        let tempData: AnimeWatched[] = [];
        if (data) {
            tempData = JSON.parse(data);
            let episodeIndex = tempData.findIndex((a: AnimeWatched) => a.id === episode.id);
            if (episodeIndex !== -1) {
                tempData[episodeIndex] = episode;
            } else {
                tempData.push(episode);
            }
        }else{
            tempData = [episode];
        }
        specialSetItem("animeList", JSON.stringify(tempData));
    }
}

export function getAnime(watchListStore: AnimeWatched[], id: number, episode: number): AnimeWatched | undefined {
    return watchListStore.find((a) => a.id === id && a.episode === episode);
}

export async function removeAnime(id: number) {
    const user = auth.currentUser;
    if (user) {
        const childRef = child(ref(database), `users/${user.uid}/animeList/${id}`);
        await remove(childRef);
    }else{
        let data = localStorage.getItem("animeList");
        if (data) {
            let tempData = JSON.parse(data);
            tempData = tempData.filter((a: AnimeWatched) => a.id !== id);
            specialSetItem("animeList", JSON.stringify(tempData));
        }
    }
}


export async function getAnimeList(): Promise<AnimeWatched[]> {
    // get Anime from localStorage 

    let tempData: AnimeWatched[] = [];
    const user = auth.currentUser;
    if (user) {
        const childRef = child(ref(database), `users/${user.uid}`);
        const snapshot = await get(childRef)
        if (snapshot.exists()) {
            const data = snapshot.val();
            tempData = Object.values(data.animeList);
        }
    } else {
        let data = localStorage.getItem("animeList");
        if (data) {
            tempData = JSON.parse(data);
        }
    }    // return animeListArray
    return tempData;
}

function specialSetItem(key: string, value: string) {
    let event = new CustomEvent('animeListUpdated', { detail: value });
    window.dispatchEvent(event);

  localStorage.setItem(key, value);
};