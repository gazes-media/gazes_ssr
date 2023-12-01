import { useContext, useEffect, useState } from "react";
import Shell from "../components/Shell";
import { BackgroundImage, Grid, Paper, em, Text, Center, Button, Badge } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { StoreContext } from "../Context/MainContext";
import { Anime, LatestEpisode, latest } from "../utils/apiFetcher";
import { analytics } from "../utils/database";
import { getAnimeList, removeAnime } from "../utils/storage";
import { convertEpisodeToNumber } from "../utils/util";
import { logEvent } from "firebase/analytics";
function LatestComponent() {
    const isLittleMobile = useMediaQuery(`(max-width: ${em(400)})`);
    const { animes, historyWatched, setHistoryWatched } = useContext(StoreContext);
    let [LatestEpisode, setlatest] = useState<LatestEpisode[]>([]);

    const navigate = useNavigate();
    useEffect(() => {
        setTimeout(() => {
            logEvent(analytics, 'page_view', {
                page_title: document.title,
                page_location: location.href,
                page_path: location.pathname
            })
        }, 700);
    }, [])
    useEffect(() => {
        (async () => {
            let last = await latest();
            setlatest(last);
            logEvent(analytics, 'load_latest', {
                count: last.length
            })
        })();
    }, []);

    useEffect(() => {
        (async () => {
            let animesWatched = await getAnimeList();
            setHistoryWatched(animesWatched);
        })();
    }
        , [localStorage.getItem("animeList")])

    if (animes.length > 0) {
        return (
            <div>
                <Grid align="flex-start" justify="center" style={{
                    paddingTop: "20px"
                }}>
                    {historyWatched && historyWatched.map((anime) => {
                        let currentAnime = animes.find(e => e.id == anime.id) as Anime;
                        let last = LatestEpisode.find(e => e.anime_url == currentAnime.url);
                        let reduce = last && convertEpisodeToNumber(last.episode) > anime.episode ? 25 : 0;
                        return (
                            <Paper key={anime.id} style={{ height: "100%", width: isLittleMobile ? "8rem" : "10rem", margin: 10 }} radius="sm" >

                                <BackgroundImage src={currentAnime.url_image} radius="sm" onClick={() => navigate("/anime/" + anime.id + "/episode/" + anime.episode)}>
                                    {last && convertEpisodeToNumber(last.episode) > anime.episode && <Badge style={{ position: "relative", top: 0, right: 0 }} color="red">Nouveau</Badge>}
                                    <div style={{ height: (isLittleMobile ? 150 : 180) - reduce }} />
                                    <Text size="sm" truncate="end" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                                        {currentAnime.title.length > 28 ? currentAnime.title.substring(0, 28) + "..." : currentAnime.title}
                                    </Text>
                                    <Text size="sm" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                                        épisode {anime.episode}
                                    </Text>
                                </BackgroundImage>
                                <div style={{ width: anime.time / anime.duration * 100 + "%", height: 4, backgroundColor: "#00a8ff", transition: "width 0.5s" }} />
                                <div style={{ height: 3 }} />
                                <Button onClick={async () => {
                                    await removeAnime(anime.id);
                                }}
                                    size="compact-xs"
                                    fullWidth
                                >Supprimer</Button>
                            </Paper>
                        )
                    }
                    )}
                </Grid>
            </div>
        )
    } else {
        return (
            <Center style={{ height: "100%" }}>
                <Text size="xl" style={{ color: 'white', fontSize: "1.5rem", marginTop: "5px", fontWeight: "bold", lineHeight: "2rem" }}>
                    Connectez-vous pour voir votre historique
                </Text>
            </Center>
        )
    }

}

export default function History() {
    let currentRoute = useLocation().pathname;
    return (
        <div>
            <Shell currentRoute={currentRoute} child={<LatestComponent />} />
        </div>
    )
}