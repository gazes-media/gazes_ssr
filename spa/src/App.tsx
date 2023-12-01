import { useEffect, useState } from "react";
import { Anime, AnimeWatched, Hilhlighted, animes, seasonal, seasonalAnimes } from "./utils/apiFetcher";
import {  onAuthStateChanged } from "firebase/auth";
import { analytics, auth, database } from "./utils/database";
import { chunkify } from "./utils/util";
import { StoreContext } from "./Context/MainContext";
import { theme } from "./theme";
import { MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Latest from "./routes/latest";
import Fiche from "./routes/fiche";
import Player from "./routes/episode";
import History from "./routes/history";
import Index from "./routes";
import Search from "./routes/search";
import { child, onValue, ref } from "firebase/database";
import { logEvent, setUserId } from "firebase/analytics";
import { getAnimeList } from "./utils/storage";
const BrowserRouter = createBrowserRouter([
    { path: "/", element: <Index/> },
    { path: "/search", element: <Search/>},
    { path: "/latest", element: <Latest/>},
    { path: "/anime/:id", element: <Fiche/>},
    { path: "/anime/:animeId/episode/:episodeId", element: <Player/>},
    { path: "/history", element: <History/>}
  ]);



export default function App() {
  const [seasonal, setSeasonal] = useState<seasonal[][]>([]); 
  const [trendings, setTrendings] = useState<Anime[]>([]);
  const [hilghted, setHilghted] = useState<Hilhlighted | null>(null);
  const [historyWatched, setHistoryWatched] = useState<AnimeWatched[]>([]);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  useEffect(() => {
    (async () => {
      onAuthStateChanged(auth, async(user) => {
        if (user) {
            const childRef = child(ref(database), `users/${user.uid}/animeList`);
            onValue(childRef, async (snapshot) => {
                if(snapshot.exists()){
                    setHistoryWatched(Object.values(snapshot.val()) as AnimeWatched[]);
                }
            });
            setUserId(analytics, user.uid);
            logEvent(analytics, 'login', {
              method: user.providerData[0].providerId,
            });
        }else{
          setUserId(analytics, Date.now().toString());
          logEvent(analytics, 'login', {
            method: "anonymous",
          });
          setHistoryWatched(await getAnimeList());
          window.addEventListener('animeListUpdated', async () => {
            setHistoryWatched(await getAnimeList());
          });

        }
      });
      if(animeList.length <= 0){
        let aList = await animes();
        if(aList.length >= 1){
          setAnimeList(aList);
          logEvent(analytics, 'load_animes', {
            count: aList.length
          });
        }
      }
      if(seasonal.length <= 0){
      let animes = await seasonalAnimes();
      if(seasonal.length === 0){
              setSeasonal(chunkify(animes,40));
              logEvent(analytics, 'load_seasonal', {
                count: animes.length
              });
      }
      }
    })()
  }, [])
    return (
        <MantineProvider theme={theme} forceColorScheme="dark">
        <StoreContext.Provider 
        value={{
          seasonal,
          setSeasonal,
          trends:trendings,
          setTrends: setTrendings,
          highlight: hilghted,
          setHighlight: setHilghted,
          historyWatched,
          setHistoryWatched,
          animes:animeList,
          setAnimes:setAnimeList
        }}>
                  <RouterProvider router={BrowserRouter} />
        </StoreContext.Provider>
        </MantineProvider>
    )
}