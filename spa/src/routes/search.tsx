import { useState, useEffect, useContext } from "react";
import { Anime, getAnimes } from "../utils/apiFetcher";
import AnimeList from "../components/AnimeList";
import { Flex, Input } from "@mantine/core";
import Shell from "../components/Shell";
import { StoreContext } from "../Context/MainContext";
import { chunkify } from "../utils/util";
import { IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { logEvent } from "firebase/analytics";
import { analytics } from "../utils/database";
function SearchComponent() {
    const {animes } = useContext(StoreContext);
    const [anime, setAnimes] = useState<Anime[][]>(chunkify(animes,40));
    const [search, setSearch] = useState<string>("");
    const navigate = useNavigate();
    const [error, setError] = useState<string>("");
    useEffect(() => {
        setTimeout(() => {
            logEvent(analytics,'page_view',{
               page_title: document.title,
               page_location: location.href,
               page_path: location.pathname
            })
        }, 700);
    }, [])
    useEffect(() => {
        (async () => {
            if (search.length > 0) {
                let animes = await getAnimes({
                    title: search
                });
                if (animes.length > 0) {
                    setAnimes(chunkify(animes,40));
                } else {
                    setError("Aucun anime trouvé");
                }
            }else{
                let animes = await getAnimes();
                if (animes.length > 0) {
                    setAnimes(chunkify(animes,40));
                } else {
                    setError("Aucun anime trouvé");
                }
            }
        })()
    }, [search])
    // as long as we scroll down, we load more animes
    return (
        <div>
            <Helmet>
                <title>Rechercher un anime</title>
            </Helmet>
            <Flex align="center" //they just need to be center on the same line
        justify="space-between"
        >
            <Input
                placeholder="Rechercher un anime"
                value={search}
                onInput={(event) => { setSearch(event.currentTarget.value); logEvent(analytics, 'search', {
                    search_term: event.currentTarget.value
                })
                 }}
                style={{ width: "100%" }}
                leftSection={<IconSearch size={20} />}
            />
            </Flex>
            {error && <div>{error}</div>}
            {anime.length > 0 && <AnimeList animes={anime} navigator={navigate} />}
        </div>
    )
}

export default function Search(){
    return (
        <Shell currentRoute="/search" child={<SearchComponent/>} />
    )
}