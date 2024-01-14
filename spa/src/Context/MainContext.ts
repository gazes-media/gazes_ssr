import { createContext } from "react";
import { Anime, AnimeWatched, HighLighted, seasonal } from "../utils/apiFetcher";

type StoreContextType = {
    seasonal: seasonal[][];
    setSeasonal: (seasonal: seasonal[][]) => void;
    trends: Anime[];
    setTrends: (trends: Anime[]) => void;
    animes: Anime[];
    setAnimes: (animes: Anime[]) => void;
    highlight: HighLighted|null;
    setHighlight: (highlight: HighLighted) => void;
    historyWatched: AnimeWatched[];
    setHistoryWatched: (historyWatched: AnimeWatched[]) => void;
}

export const StoreContext = createContext<StoreContextType>({
    seasonal: [],
    setSeasonal: () => {},
    trends: [],
    setTrends: () => {},
    animes: [],
    setAnimes: () => {},
    highlight: {} as HighLighted,
    setHighlight: () => {},
    historyWatched: [],
    setHistoryWatched: () => {}
});