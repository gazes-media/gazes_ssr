import { BackgroundImage, Box, Paper, em, Text, Divider, Grid, GridCol, Group, Button, Flex } from "@mantine/core";
import { useContext, useEffect } from "react";
import { highlighted, trends as trendings } from "../utils/apiFetcher";
import { useMediaQuery } from "@mantine/hooks";
import { Carousel } from '@mantine/carousel';
import { spliceText } from "../utils/util";
import Shell from "../components/Shell";
import { StoreContext } from "../Context/MainContext";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { logEvent } from "firebase/analytics";
import { analytics } from "../utils/database";
function Main() {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const { trends, setTrends, highlight, setHighlight} = useContext(StoreContext);
  const navigate = useNavigate();
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
      if (!highlight) {
        let banner = await highlighted();
        setHighlight(banner);
        let trendsAnimes = await trendings();
        setTrends(trendsAnimes);
        logEvent(analytics, 'load_highlight', {
          count: 1
        })
        logEvent(analytics, 'load_trends', {
          count: trendsAnimes.length
        })
      }
    })()

  }, [highlight])


  if (!highlight) {
    return <div>Chargement...</div>
  } else {
    return (<Paper>
      <Box maw={2000} mb="md" mah={600}>
        <BackgroundImage src={isMobile ? highlight?.url_image : highlight?.coverUrl} radius={"xs"}  >
          <Paper bg={"rgba(0,0,0,0.6)"} style={{ padding: 10 }}>
            <div style={{ height: "8rem" }}></div>
            <Flex style={{ height: "25rem" }} >
              <Grid >
                <div style={{ padding: 20, height: "100%" }}>
                  <Text size="xl" style={{ color: 'white', fontSize: "1.5rem", fontWeight: "bold", lineHeight: "2rem" }}>
                    {highlight?.title}
                  </Text>
                  <Text size="md" style={{ color: 'green', fontSize: "1rem" }}>
                    Recommandé à {(parseInt(highlight?.score,10)/5*100).toFixed(1) + "%"}
                  </Text>
                  <div style={{ height: 15 }} />
                  <Text size="sm" style={{ color: 'white' }}>
                    {isMobile ? spliceText(highlight?.synopsis, 30) : spliceText(highlight?.synopsis, 70)}
                  </Text>
                </div>
                <GridCol span={12} >
                  <Group right={"xs"}>
                    <Button radius={"sm"} style={{
                      marginRight: 10,
                    }} 
                      onClick={() => {navigate("/anime/"+highlight?.id)} }
                    >Regarder</Button>
                    <Button radius={"sm"} >Ajouter</Button>
                  </Group>
                </GridCol>
              </Grid>
            </Flex>
          </Paper>
        </BackgroundImage>
      </Box>
      <Divider size={"sm"} />
      <Text size="xl" style={{ color: 'white', fontSize: "1.5rem", marginTop: "5px", fontWeight: "bold", lineHeight: "2rem" }}>
        Tendances
      </Text>
      <Carousel
        height={300}
        slideSize={"13rem"}
        slideGap="lg"
        loop
        align="start"
        slidesToScroll={2}
        style={{ marginTop: 10 }}
      >
        {trends.map((anime) => (
          <Carousel.Slide key={anime.id}>
            <BackgroundImage src={anime.url_image} radius="xs" onClick={() => { navigate("/anime/" + anime.id) }} style={{ height: 300 }} >
              <Box style={{ height: 300 }}>
                <div style={{ height: 270 }} />
                <Text size="sm" truncate="end" style={{ color: 'white', fontSize: "0.8rem", fontWeight: "bold", lineHeight: "2rem" }} bg={"rgba(0,0,0,0.5)"}>
                  {anime.title.length > 28 ? anime.title.substring(0, 28) + "..." : anime.title}
                </Text>
              </Box>

            </BackgroundImage>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Paper>
    )
  }
}

export default function index() {
  return (
    <div>
      <Helmet>
        <title>Accueil</title>
      </Helmet>
      <Shell currentRoute="/" child={<Main />} />
    </div>
  );
}
