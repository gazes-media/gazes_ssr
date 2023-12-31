import { useState, useEffect } from "react";
import { LatestEpisode, latest } from "../utils/apiFetcher";
import Shell from "../components/Shell";
import { BackgroundImage, Grid, Paper, em, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { convertEpisodeToNumber } from "../utils/util";
import { Helmet } from "react-helmet";
import { logEvent } from "firebase/analytics";
import { analytics } from "../utils/database";
function LatestComponent() {
    const isLittleMobile = useMediaQuery(`(max-width: ${em(400)})`);
    const [animeReleased, setAnimeReleased] = useState<LatestEpisode[]>([]);
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
            if (animeReleased.length <= 0) {
                let animes = await latest();
                if (animes.length > 0) {
                    setAnimeReleased(animes);
                } 
                logEvent(analytics, 'load_latest', {
                    count: animes.length
                })
            }
        })()
    }, [])
    // as long as we scroll down, we load more animes
    return (
        <div>
             <Grid align="flex-start" justify="center" style={{
            paddingTop: "20px" }}>
            {animeReleased && animeReleased.map((anime) => {
                return (
                        <Paper key={anime.timestamp} style={{ height: "100%", width: isLittleMobile ? "8rem" : "10rem", margin:10}} radius="sm" onClick={()=>window.location.href =("/anime/"+anime.url.match(new RegExp(/\/(\d+)/,"i"))?.[1]+"/episode/"+convertEpisodeToNumber(anime.episode))}>
                            <BackgroundImage src={anime.url_image.replace("/3/","/1/")} radius="sm" style={{
                                
                            }} >
                                <div style={{ height: isLittleMobile ? 150 : 180 }} />
                                <Text size="sm" truncate="end" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                                    {anime.title.length > 28 ? anime.title.substring(0, 28) + "..." : anime.title}
                                </Text>
                                <Text size="sm" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                                   épisode {anime.episode} ({anime.lang})
                                </Text>
                            </BackgroundImage>
                        </Paper>
                )
            }
            )}       
        </Grid>
        </div>
    )
}

export default function Latest(){
    return (
        <div>
            <Helmet>
                <title>Dernières sorties</title>
            </Helmet>
        <Shell currentRoute="/latest" child={<LatestComponent/>} />
        </div>
    )
}