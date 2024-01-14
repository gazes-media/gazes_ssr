import { BackgroundImage, Center, Grid, Pagination, Paper, Text, em } from "@mantine/core"
import { Anime } from "../utils/apiFetcher"
import { useMediaQuery } from "@mantine/hooks";
import { convertEpisodeToNumber } from "../utils/util";
import { useState } from "react";

export default function AnimeList({ animes, navigator }: { animes: Anime[][], navigator: Function }) {
    let isLittleMobile = useMediaQuery(`(max-width: ${em(400)})`);
    const [page, setPage] = useState<number>(1);
    return (
        <div>
            <Grid align="flex-start" justify="center" style={{
                paddingTop: "20px"
            }}>
                {animes[(page - 1)].map((anime) => {
                    let isMovie = anime.nb_eps == "Film";
                    let epsNumbers = convertEpisodeToNumber(anime.nb_eps);
                    return (
                        <Paper key={anime.id} onClick={() => navigator("/anime/" + anime.id)} style={{ height: "100%", width: isLittleMobile ? "8rem" : "10rem", margin: 10 }} radius="sm" >
                            <BackgroundImage src={anime.url_image} radius="sm" >
                                <div style={{ height: isLittleMobile ? 150 : 180 }} />
                                <Text size="sm" truncate="end" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                                    {anime.title.length > 28 ? anime.title.substring(0, 28) + "..." : anime.title}
                                </Text>
                                <Text size="sm" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                                    {isMovie ? "Film" : epsNumbers + " épisodes"}
                                </Text>
                            </BackgroundImage>
                        </Paper>
                    )
                }
                )}
            </Grid>
            <Center>
                <Pagination total={animes.length} value={page > parseInt(Number(animes.length/40).toFixed(0)) ? 1 : page} onChange={setPage} style={{ marginTop: 20, marginBottom: 20 }} />
            </Center>
        </div>

    )
}