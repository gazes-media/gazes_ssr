import { AppShell, Burger, Flex, Text, Input, Image, rem, Kbd, NavLink as NavButton, Avatar, Badge } from "@mantine/core";
import NavLink from "../components/NavLinkNew";
import { useDisclosure, } from '@mantine/hooks';
import { IconCalendar, IconHistory, IconHome, IconSearch, IconUser } from "@tabler/icons-react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '@mantine/spotlight/styles.css';
import { Spotlight, SpotlightActionData, spotlight } from '@mantine/spotlight';
import { StoreContext } from "../Context/MainContext";
import { auth } from "../utils/database";
import { GoogleAuthProvider, signInWithPopup, signOut } from '@firebase/auth';
import { Anime, AnimeWatched, latest } from "../utils/apiFetcher";
import { getAnimeList } from "../utils/storage";
import { convertEpisodeToNumber } from "../utils/util";

export default function Shell({ child, currentRoute}: { child: React.ReactNode, currentRoute:string }) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const [animeSearched, setAnimes] = useState<SpotlightActionData[]>([]);
  let [historyUpdated, setHistoryUpdated] = useState<AnimeWatched[]>([]);
  const { animes } = useContext(StoreContext);
  function signIn() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  }

  function signOutUser() {
    signOut(auth);
  }

  useEffect(() => {
    // concat all seasons in one array
      let animesWithImage: SpotlightActionData[] = animes.map((anime) => {
        return {
            id:anime.id.toString(),
            label: anime.title,
            description: anime.title_english,
            onClick: () => { navigate("/anime/"+anime.id) },
            leftSection: <Image src={anime.url_image} width={20} height={20} radius="xl" />,
        }
    });

      (async () => {
        let last = await latest();
        let history = await getAnimeList();
        let filtered = history.filter((anime) => {
          let currentAnime = animes.find(e => e.id == anime.id) as Anime;
          let recent = last.find(e => e.anime_url == currentAnime.url);
          return recent && convertEpisodeToNumber(recent.episode) > anime.episode;
        })
        setHistoryUpdated(filtered);

      })();
      setAnimes(animesWithImage);
  }, [])
      
  return <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center" //they just need to be center on the same line
        justify="space-between" //they just need to be center on the same line
        style={{ height: 60 }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="md" />
        {currentRoute !== "/search" && <Input
          value="Rechercher"
          style={{ maxWidth: "1000px", width: "200px" }}
          type="button"
          radius={"md"}
          onClick={spotlight.open}
          leftSection={<IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}
          rightSection={<Kbd style={{ marginLeft: -30}}>Ctrl+K</Kbd>}
          pointer
        />}
        <Text size="xl" style={{ color: 'white', fontSize: "1.5rem", fontWeight: "bold", lineHeight: "2rem" }}>
          Gazes
        </Text>
        <button is="google-cast-button" style={{
          width: 40,
          height: 40,
        }}></button>
        </Flex>
        <Spotlight
        actions={animeSearched}
        nothingFound="Nothing found..."
        highlightQuery
        limit={50}
        searchProps={{
          leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
          placeholder: 'Search...',
        }}
        scrollable
        maxHeight={350}
      />
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink label="Accueil" leftSection={<IconHome />} navigate={navigate} location="/"  />
        <NavLink label="Chercher" leftSection={<IconSearch />} navigate={navigate} location="/search" />
        <NavLink label="Dernières sorties" leftSection={<IconCalendar />} navigate={navigate} location="/latest" />
        <NavLink label="Historique" leftSection={<IconHistory />} navigate={navigate} location="/history" rightSection={historyUpdated.length > 0 && <DisplayBadgeAnimeToWatch animewatched={historyUpdated} />} />
        {!auth.currentUser ? <NavButton label={"Connexion"} onClick={signIn} leftSection={<IconUser/>} /> : <NavButton label={"Déconnexion"} onClick={signOutUser} leftSection={<Avatar src={auth.currentUser.photoURL}/>} />}
      </AppShell.Navbar>
      <AppShell.Main>
        {child}
      </AppShell.Main>
    </AppShell>  
}

function DisplayBadgeAnimeToWatch({animewatched}: {animewatched: AnimeWatched[]}) {
    if(animewatched.length > 0){
      return (
        <Badge style={{ position: "relative", top: 0, right: 0 }} color="red">+{animewatched.length}</Badge>
      )
    }else{
      return (<></>)
    }
  }