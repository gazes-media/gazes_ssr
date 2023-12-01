import { BackgroundImage, Center, Grid, Pagination, Paper, Text, em } from "@mantine/core"
import { seasonal } from "../utils/apiFetcher"
import { useMediaQuery } from "@mantine/hooks";
import { convertEpisodeToNumber } from "../utils/util";
import { useState } from "react";

export default function AnimeList({ animes, navigator }: { animes: seasonal[][], navigator: Function }) {
    let isLittleMobile = useMediaQuery(`(max-width: ${em(400)})`);
    const [page, setPage] = useState<number>(1);
    return (
        <div>
            <Grid align="flex-start" justify="center" style={{
                paddingTop: "20px"
            }}>
                {animes[(page - 1)].map((anime) => {
                    let seasons = anime.seasons.filter(e => e.fiche.nb_eps != "Film" && e.fiche.type !== "ova" && e.fiche.type !== "special");
                    let ovaOrSpecial = anime.seasons.filter(e => e.fiche.type === "ova" || e.fiche.type === "special");
                    let epsOvaOrSpecial = ovaOrSpecial.map(e => convertEpisodeToNumber(e.fiche.nb_eps)).reduce((a, b) => a + b, 0);
                    let movies = anime.seasons.filter(e => e.fiche.nb_eps === "Film");
                    let epsNumbers = seasons.map(e => convertEpisodeToNumber(e.fiche.nb_eps)).reduce((a, b) => a + b, 0);
                    return (
                        <Paper key={anime.ids[0]} onClick={() => navigator("/anime/" + anime.ids[0])} style={{ height: "100%", width: isLittleMobile ? "8rem" : "10rem", margin: 10 }} radius="sm" >
                            <BackgroundImage src={anime.cover_url} radius="sm" style={{

                            }} >
                                <div style={{ height: isLittleMobile ? 150 : 180 }} />
                                <Text size="sm" truncate="end" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                                    {anime.title.length > 28 ? anime.title.substring(0, 28) + "..." : anime.title}
                                </Text>
                                <Text size="sm" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                                    {epsNumbers > 0 ? (epsNumbers + epsOvaOrSpecial + movies.length) + " épisodes" : "? épisodes"}
                                </Text>
                            </BackgroundImage>
                        </Paper>
                    )
                }
                )}
            </Grid>
            <Center>
                <Pagination total={animes.length} value={page} onChange={setPage} style={{ marginTop: 20, marginBottom: 20 }} />
            </Center>
        </div>

    )
}