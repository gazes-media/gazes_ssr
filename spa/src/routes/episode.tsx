import 'vidstack/styles/defaults.css';
import { MediaOutlet, MediaPlayer, MediaGesture, MediaPoster, MediaBufferingIndicator, MediaTimeSlider, MediaPlayButton, MediaSeekButton, MediaPIPButton, MediaTime, MediaMenu, MediaQualityMenuButton, MediaFullscreenButton, MediaMenuItems, MediaQualityMenuItems, MediaMenuButton, MediaPlaybackRateMenuButton, MediaPlaybackRateMenuItems, MediaMuteButton } from '@vidstack/react';
import { EpisodeWithVideo, FicheAnime, getEpisodeAnimeId, getFicheAnime, seasonal, seasonalAnimes } from '../utils/apiFetcher';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../global.css';
import { IconArrowRight, IconDownload, IconHome, IconMaximize, IconMinimize, IconMovie, IconPictureInPictureOff, IconPictureInPictureOn, IconPlayerPause, IconPlayerPlay, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconPlayerStop, IconSearch, IconSettings, IconVolume, IconVolume2, IconVolumeOff } from '@tabler/icons-react';
import { Modal, ActionIcon, Button, Center, Flex, Image, Paper, Slider, Stack, Text, em, rem } from '@mantine/core';
import { MediaPlayerElement, isHLSProvider } from 'vidstack';
import { Spotlight, SpotlightActionData, spotlight } from '@mantine/spotlight';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { convertEpisodeToNumber, spliceText } from '../utils/util';
import { removeAnime, setAnime } from '../utils/storage';
import { StoreContext } from '../Context/MainContext';
import { Helmet } from 'react-helmet';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../utils/database';
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util';
function formatDuree(secondes: number) {
    const heures = Math.floor(secondes / 3600);
    const minutes = Math.floor((secondes % 3600) / 60);
    const secondesRestantes = secondes % 60;

    // Utilisation de la méthode `String.padStart` pour formater les nombres avec deux chiffres.
    const heuresFormatees = heures.toString().padStart(2, '0');
    const minutesFormatees = minutes.toString().padStart(2, '0');
    const secondesFormatees = secondesRestantes.toString().padStart(2, '0');
    if (heures == 0) {
        return `${minutesFormatees}:${secondesFormatees}`;
    } else {
        return `${heuresFormatees}:${minutesFormatees}:${secondesFormatees}`;
    }
}

let timeMoved = false;

export default function Player() {
    const navigate = useNavigate();
    let isMobile = useMediaQuery(`(max-width: ${em(750)})`);
    let { animeId, episodeId } = useParams();
    const { historyWatched } = useContext(StoreContext);
    let [fiche, setFiche] = useState<FicheAnime | null>(null);
    let [currentLangue, setCurrentLangue] = useState<"vf" | "vostfr">("vostfr");
    let [currentTime, setCurrentTime] = useState(0);
    let [currentSeason, setCurrentSeason] = useState<seasonal | null>(null);
    let [session, setSession] = useState<cast.framework.CastSession | null>(null);
    let [player, setPlayer] = useState<MediaPlayerElement | null>(null);
    let [castPlaying, setCastPlaying] = useState(false);
    let [castDuration, setCastDuration] = useState(0);
    let [episode, setEpisode] = useState<EpisodeWithVideo | null>(null);
    let ffmpegRef = useRef<FFmpeg>(new FFmpeg());
    const [opened, { open, close }] = useDisclosure(false);
    const [dlProgress, setDlProgress] = useState("Progress...");
    function onProviderChange(event: any) {
        const provider = event.detail;
        if (isHLSProvider(provider)) {
            // Default development URL.
            provider.library = 'https://cdn.jsdelivr.net/npm/hls.js@^1.0.0/dist/hls.js';
            // Default production URL.
            provider.library = 'https://cdn.jsdelivr.net/npm/hls.js@^1.0.0/dist/hls.min.js';
        }
    }

    function downloadEpisode() {
        // create ffmpeg
        let video = document.querySelector("video");
        if (video) {
            video.pause();
        }
        open();
        const ffmpeg = ffmpegRef.current;
        const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm";
        // load ffmpeg
        if(ffmpeg.loaded) return;
        (async() => {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(
                  `${baseURL}/ffmpeg-core.wasm`,
                  "application/wasm"
                ),
                workerURL: await toBlobURL(
                  `${baseURL}/ffmpeg-core.worker.js`,
                  "text/javascript"
                ),
              });
          
        ffmpeg.on("log", (log) => setDlProgress(log.message));
        // get the video url
        const url = episode?.vostfr.videoUri;
        if (!url) return;
        fetch(url)
            .then(response => response.text())
            .then(d2 => {
                // the file is an m3u8 playlist with the video m3u8 url
                const lines = d2.split("\n");
                const m3u8Url = [];
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes("m3u8")) {
                        m3u8Url.push(line);
                    }
                }
                // get the last m3u8 url
                const lastM3u8Url = m3u8Url[m3u8Url.length - 1];
                // fetch the video m3u8 file and get the text content
                fetch(lastM3u8Url)
                    .then(response => response.text())
                    .then(async (data) => {
                        // the file is an m3u8 playlist with the video ts urls
                        let m3u8ForFFmpeg = data;
                        const lines = data.split("\n");
                        // load each ts file into ffmpeg 
                        const URLSList = [];
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            if (line.includes("https")) {
                                URLSList.push(line);
                            }
                        }
                        // push each ts file into ffmpeg
                        for (let i = 0; i < URLSList.length; i++) {

                            const url = URLSList[i];
                            ffmpeg.writeFile('video' + i + '.ts', await fetchFile(url));
                            setDlProgress(((i + 1) / URLSList.length * 100).toFixed(2) + "%" + " - " + (i + 1) + "/" + URLSList.length);
                            // replace the ts url with the local ts file
                            m3u8ForFFmpeg = m3u8ForFFmpeg.replace(url, 'video' + i + '.ts');
                        }

                        // write the m3u8 file
                        ffmpeg.writeFile('index.m3u8', m3u8ForFFmpeg);
                        // run ffmpeg
                        await ffmpeg.exec(['-i', 'index.m3u8', "-bsf:a", "aac_adtstoasc", '-c', 'copy', 'output.mp4']);
                        setDlProgress("100% - " + URLSList.length + "/" + URLSList.length + " - Transcoding...");
                        // read the result
                        const dataVideo = await ffmpeg.readFile('output.mp4');
                        // create a URL
                        const videoURL = URL.createObjectURL(new Blob([(dataVideo as { buffer: BlobPart}).buffer], { type: 'video/mp4' }));
                        // add a link that launch a download of the video
                        const a = document.createElement('a');
                        a.download = 'video.mp4';
                        a.href = videoURL;
                        a.textContent = 'Download the video';
                        a.id = 'download';
                        document.body.appendChild(a);
                        document.getElementById('download')?.click();
                        setDlProgress("Downloaded to your download folder");
                        // after we need to remove the newly added button
                        document.body.removeChild(a)
                        // release every file from the virtual file system
                        ffmpeg.unmount('output.mp4');
                        ffmpeg.unmount('index.m3u8');
                        for (let i = 0; i < URLSList.length; i++) {
                            ffmpeg.unmount('video' + i + '.ts');
                        }
                        // release ffmpeg
                        await ffmpeg.terminate();
                    });
            });
        })();
    }

    function episodeNotFound(id: string, _ep: number) {
        return navigate("/anime/" + id);
    }

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
        // try to setup the player unless it's already setup
        function setupPlayer() {
            let play = document.querySelector("media-player");
            if (play) {
                // @ts-ignore
                setPlayer(play);
            } else {
                setTimeout(setupPlayer, 100);
            }
        }

        if (window.cast) {
            window.cast.framework.CastContext.getInstance().addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
                if (event.sessionState == "SESSION_ENDED") {
                    setSession(null);
                }

                if (event.sessionState == "SESSION_STARTED") {
                    let session = window.cast.framework.CastContext.getInstance().getCurrentSession();
                    setSession(session);
                }

                if (event.sessionState == "SESSION_RESUMED") {
                    let session = window.cast.framework.CastContext.getInstance().getCurrentSession();
                    setSession(session);
                }

                if (event.sessionState == "SESSION_STARTING") {
                    let session = window.cast.framework.CastContext.getInstance().getCurrentSession();
                    setSession(session);
                }

                if (event.sessionState == "SESSION_ENDING") {
                    setSession(null);
                }
            })
        }
        (async () => {
            if (!animeId || !episodeId) return;

            if (!episode) {
                let currentFiche = await getFicheAnime(parseInt(animeId, 10));
                setFiche(currentFiche);
                let episodeToFetch = await getEpisodeAnimeId(parseInt(animeId, 10), parseInt(episodeId, 10));
                if (!episodeToFetch) return episodeNotFound(animeId, parseInt(episodeId, 10));
                setEpisode(episodeToFetch);
                let seasons = await seasonalAnimes({
                    id: parseInt(animeId, 10)
                });
                if (seasons.length > 0) {
                    setCurrentSeason(seasons[0]);
                }
                logEvent(analytics, 'load_episode', {
                    title: currentFiche.title,
                    episode: episodeToFetch.vostfr.num,
                    image_url: currentFiche.url_image,
                    url: location.href,
                });
            }
        })()

        if (window.cast && window.cast.framework.CastContext.getInstance().getCurrentSession() && episode) {
            let session = window.cast.framework.CastContext.getInstance().getCurrentSession();
            setSession(session);
            // load media 
            let mediaLang = verifyIfVfIsAvailable(episode) ? currentLangue : "vostfr" as "vostfr" | "vf";
            let RemotePlayer = new cast.framework.RemotePlayer();
            let controller = new cast.framework.RemotePlayerController(RemotePlayer);
            if (session && !session.getMediaSession()) {
                let mediaInfo = new chrome.cast.media.MediaInfo(episode[mediaLang].videoUri, 'application/vnd.apple.mpegurl');
                session?.loadMedia(new chrome.cast.media.LoadRequest(mediaInfo));
                session?.addEventListener(cast.framework.SessionEventType.MEDIA_SESSION, (event) => {
                    if (event.mediaSession) {
                        setCastDuration(event.mediaSession.media.duration);
                        if (RemotePlayer.canSeek) {
                            let seekTime = new chrome.cast.media.SeekRequest();
                            let isInHistory = historyWatched.find(e => e.id == fiche?.id && e.episode == episode?.vostfr.num);
                            seekTime.currentTime = currentTime;
                            if (isInHistory && !timeMoved) {
                                if (isInHistory.time > RemotePlayer.currentTime) {
                                    timeMoved = true;
                                    seekTime.currentTime = isInHistory.time;
                                    cast.framework.CastContext.getInstance().getCurrentSession()?.getMediaSession()?.seek(seekTime, () => {
                                        console.log("ok seeked");
                                    }, (err) => {
                                        console.log(err);
                                    });
                                }
                            } else if (currentTime != 0 && Math.round(RemotePlayer.currentTime) < Math.round(currentTime)) {
                                cast.framework.CastContext.getInstance().getCurrentSession()?.getMediaSession()?.seek(seekTime, () => {
                                    console.log("Media as been loaded and moved to the last seconds in history");
                                }, (err) => {
                                    console.log(err);
                                });
                            }
                        }

                        controller.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, () => {
                            setCurrentTime(RemotePlayer.currentTime)
                            if (fiche && episode && RemotePlayer.currentTime > 1) {
                                setCastDuration(RemotePlayer.duration);
                                setAnime({
                                    id: fiche.id,
                                    episode: episode.vostfr.num,
                                    time: RemotePlayer.currentTime,
                                    duration: RemotePlayer.duration
                                })
                            }
                            if (Math.round(RemotePlayer.duration) == Math.round(RemotePlayer.currentTime)) {
                                nextEpisode();
                            }
                        });
                    }
                })
            } else {
                let mediaInfo = session?.getMediaSession();
                if (mediaInfo) {
                    setCastDuration(mediaInfo.media.duration || 0);
                    setCurrentTime(mediaInfo.getEstimatedTime());
                    let isPlaying = mediaInfo.playerState == "PLAYING";
                    setCastPlaying(isPlaying);
                }
                if (RemotePlayer.canSeek) {
                    let seekTime = new chrome.cast.media.SeekRequest();
                    let isInHistory = historyWatched.find(e => e.id == fiche?.id && e.episode == episode?.vostfr.num);
                    seekTime.currentTime = currentTime;
                    if (isInHistory && !timeMoved) {
                        if (isInHistory.time > RemotePlayer.currentTime) {
                            timeMoved = true;
                            seekTime.currentTime = isInHistory.time;
                            cast.framework.CastContext.getInstance().getCurrentSession()?.getMediaSession()?.seek(seekTime, () => {
                                console.log("ok seeked");
                            }, (err) => {
                                console.log(err);
                            });
                        }
                    } else if (currentTime != 0 && Math.round(RemotePlayer.currentTime) < Math.round(currentTime)) {
                        cast.framework.CastContext.getInstance().getCurrentSession()?.getMediaSession()?.seek(seekTime, () => {
                            console.log("Media as been loaded and moved to the last seconds in history");
                        }, (err) => {
                            console.log(err);
                        });
                    }
                }

                controller.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, () => {

                    setCurrentTime(RemotePlayer.currentTime)
                    if (fiche && episode && RemotePlayer.currentTime > 1) {
                        setCastDuration(RemotePlayer.duration);
                        setAnime({
                            id: fiche.id,
                            episode: episode.vostfr.num,
                            time: RemotePlayer.currentTime,
                            duration: RemotePlayer.duration
                        })
                    }
                    if (Math.round(RemotePlayer.duration) == Math.round(RemotePlayer.currentTime)) {
                        nextEpisode();
                    }
                });
            }
        } else if (episode) {
            setupPlayer()
        }

        let videoPlayer = document.querySelector("video");
        const play = () => {
            if (videoPlayer && episode) {
                let isInHistory = historyWatched.find(e => e.id == fiche?.id && e.episode == episode?.vostfr.num)
                if (isInHistory) {
                    if (isInHistory.episode == episode.vostfr.num) {
                        videoPlayer.currentTime = isInHistory.time;
                    }
                }
                videoPlayer.removeEventListener("play", play);
            }
        }
        if (videoPlayer) {
            videoPlayer.addEventListener("play", play);
            videoPlayer.addEventListener("timeupdate", timeUpdate);
            videoPlayer.addEventListener("pause", paused);
        }

        return () => {
            if (videoPlayer) {
                videoPlayer.removeEventListener("timeupdate", timeUpdate);
                videoPlayer.removeEventListener("pause", paused);
            }
            if (window.cast) {
                window.cast.framework.CastContext.getInstance().getCurrentSession()?.getMediaSession()?.stop(new chrome.cast.media.StopRequest(), () => {
                    console.log("ok");
                }, err => {
                    console.log(err);
                });
            }
        }
    }, [episode])

    useEffect(() => {
        if (currentTime == 0) return;
        let videoPlayer = document.querySelector("video");
        if (!videoPlayer) return;
        videoPlayer.currentTime = currentTime;
    }, [currentLangue])

    async function paused() {
        try {
            if (fiche && episode) {
                const ipc = require('electron').ipcRenderer;
                ipc.send('episodePaused', {
                    title: fiche.title,
                    episode: episode.vostfr.num,
                    image_url: fiche.url_image,
                    url: location.href,
                });
            }
        } catch (e) {
            return false;
        }
    }

    async function timeUpdate() {
        let videoElement = document.querySelector("video");
        if (videoElement && episode) {
            setCurrentTime(videoElement.currentTime);
            if (episode && fiche && videoElement && videoElement.currentTime > 2) {
                await setAnime({
                    id: fiche.id,
                    episode: episode.vostfr.num,
                    time: videoElement.currentTime,
                    duration: videoElement.duration
                })
                try {
                    const ipc = require('electron').ipcRenderer;
                    ipc.send('episodeUpdated', {
                        title: fiche.title,
                        episode: episode.vostfr.num,
                        duration: (videoElement.duration - videoElement.currentTime) * 1000,
                        image_url: fiche.url_image,
                        url: location.href,
                    });
                } catch (e) {
                    return false;
                }

            }
        }
    }


    async function changeEpisode(episodeNumber: number, player?: MediaPlayerElement) {
        if (!fiche) return;
        let episodeToFetch = await getEpisodeAnimeId(fiche.id, episodeNumber);
        if (!episodeToFetch) return episodeNotFound(fiche.id.toString(), episodeNumber);
        setCastPlaying(true)
        verifyIfVfIsAvailable(episodeToFetch);
        setEpisode(episodeToFetch);
        setCurrentTime(0);
        logEvent(analytics, 'load_episode', {
            title: fiche.title,
            episode: episodeToFetch.vostfr.num,
            image_url: fiche.url_image,
            url: location.href,
        });
        timeMoved = true;
        if (session) {
            let mediaInfo = new chrome.cast.media.MediaInfo(episodeToFetch[currentLangue].videoUri, 'application/vnd.apple.mpegurl');
            session?.loadMedia(new chrome.cast.media.LoadRequest(mediaInfo));
            session?.getMediaSession()?.play(new chrome.cast.media.PlayRequest(), () => {
                setCastPlaying(true);
            }, (err) => {
                console.log(err);
            });
        }
        window.history.replaceState(null, "", "/anime/" + animeId + "/episode/" + episodeNumber);
        if (player) {
            // @ts-ignore
            player.enterFullscreen();
        }
    }

    function verifyIfVfIsAvailable(episode: EpisodeWithVideo) {
        if (episode.vf) {
            return true;
        } else {
            setCurrentLangue("vostfr");
            return false;
        }
    }

    async function nextEpisode() {
        if (!fiche) return;
        let idAnime = fiche.id;
        if (episode) {
            let nextEpisode = episode.vostfr.num + 1;
            let maxEpisode = fiche.nb_eps.includes("?") ? fiche.episodes.length : convertEpisodeToNumber(fiche.nb_eps);
            if (nextEpisode > maxEpisode) {
                nextEpisode = 1;
                if (currentSeason) {
                    let realSeasons = currentSeason.seasons.filter(e => e.fiche.type == "tv").map(e => e.fiche.id);
                    if (realSeasons.length > 1) {
                        let saisonToFetch = realSeasons[currentSeason.ids.findIndex(e => e == idAnime) + 1];
                        if (saisonToFetch) {
                            idAnime = saisonToFetch;
                            let ficheToFetch = await getFicheAnime(saisonToFetch);
                            setFiche(ficheToFetch);
                            let episodeToFetch = await getEpisodeAnimeId(saisonToFetch, nextEpisode);
                            if (!episodeToFetch) return episodeNotFound(saisonToFetch.toString(), nextEpisode);
                            verifyIfVfIsAvailable(episodeToFetch);
                            setEpisode(episodeToFetch);
                            if (session) {
                                let mediaInfo = new chrome.cast.media.MediaInfo(episodeToFetch[currentLangue].videoUri, 'application/vnd.apple.mpegurl');
                                session?.loadMedia(new chrome.cast.media.LoadRequest(mediaInfo));
                            }
                        } else {
                            navigate("/anime/" + idAnime);
                        }
                    } else {
                        removeAnime(idAnime);
                        navigate("/anime/" + idAnime);
                    }
                }
            } else {
                let lastEpisodeReleased = fiche.episodes.length;
                if (lastEpisodeReleased <= maxEpisode) {
                    if (nextEpisode > lastEpisodeReleased) {
                        let videoPlayer = document.querySelector("video");
                        if (videoPlayer) {
                            setAnime({
                                id: fiche.id,
                                episode: lastEpisodeReleased,
                                time: videoPlayer.duration - 30,
                                duration: videoPlayer.duration
                            })
                        }
                        return navigate("/anime/" + idAnime);
                    }
                } else {
                    removeAnime(idAnime);
                    return navigate("/anime/" + idAnime);
                }
                let episodeToFetch = await getEpisodeAnimeId(idAnime, nextEpisode);
                if (!episodeToFetch) return episodeNotFound(idAnime.toString(), nextEpisode);
                verifyIfVfIsAvailable(episodeToFetch);
                setEpisode(episodeToFetch);
                if (session) {
                    let mediaInfo = new chrome.cast.media.MediaInfo(episodeToFetch[currentLangue].videoUri, 'application/vnd.apple.mpegurl');
                    session?.loadMedia(new chrome.cast.media.LoadRequest(mediaInfo));
                }
            }
            logEvent(analytics, 'load_episode', {
                title: fiche.title,
                episode: nextEpisode,
                image_url: fiche.url_image,
                url: location.href,
            });
            window.history.replaceState(null, "", "/anime/" + idAnime + "/episode/" + nextEpisode);
        }
    }
    if (!fiche) return (<Stack align='center' justify='center'><div>Chargement des informations de l'animé...</div></Stack>)
    if (!episode) return (<Stack align='center' justify='center'><div>Chargement de l'épisode...</div></Stack>)

    let dataSpotlight: SpotlightActionData[] = fiche.episodes.map((eps) => {
        return {
            id: eps.num.toString(),
            label: "Episode " + eps.num,
            description: "Durée: " + eps.time,
            onClick: async () => await changeEpisode(eps.num, player as MediaPlayerElement)
        }
    })
    if (!session) {
        return (
            <div className='overflow-hidden'>
                <Helmet>
                    <title>{fiche.title + "- Episode " + episode.vostfr.num}</title>
                    <meta name="description" content={fiche.title + "- Episode " + episode.vostfr.num} />
                    <meta property="og:title" content={fiche.title + "- Episode " + episode.vostfr.num} />
                    <meta property="og:description" content={fiche.title + "- Episode " + episode.vostfr.num} />
                    <meta property="og:image" content={fiche.url_image} />
                    <meta property='og:keywords' content={`${fiche.others}, ${fiche.title}, ${fiche.title} ${episode.vostfr.num}, ${fiche.title} ${episode.vostfr.num} vostfr, ${fiche.title} ${episode.vostfr.num} vf`} />
                    <meta property='keywords' content={`${fiche.others}, ${fiche.title}, ${fiche.title} ${episode.vostfr.num}, ${fiche.title} ${episode.vostfr.num} vostfr, ${fiche.title} ${episode.vostfr.num} vf`} />
                </Helmet>
                <Modal opened={opened} onClose={close} title="Download Progress">
                    <Center>
                        <Text size="xl" style={{ color: 'white', fontSize: "1.5rem", marginTop: "5px", fontWeight: "bold", lineHeight: "2rem" }}>
                            Téléchargement en cours <br/> {dlProgress}
                        </Text>
                    </Center>
                    <Button onClick={close} variant="outline" color="blue" style={{ marginTop: "10px" }}>Fermer la modale</Button>
                </Modal>

                <MediaPlayer
                    onProviderChange={onProviderChange}
                    title={fiche.title + "- Episode " + episode.vostfr.num}
                    autoplay={true}
                    src={{
                        src: episode[currentLangue as "vostfr" | "vf"].videoUri,
                        type: 'application/x-mpegurl',
                    }}
                    load={"idle"}
                    onEnded={nextEpisode}
                    aspectRatio={16 / 9}
                    poster={"https://proxy.ketsuna.com?url=" + encodeURIComponent(episode.vostfr.url_image)}
                    thumbnails={"https://proxy.ketsuna.com?url=" + encodeURIComponent(episode.vostfr.url_image)}
                >
                    <MediaOutlet>
                        <MediaGesture event="pointerup" action="toggle:paused" />
                        <MediaGesture event="dblpointerup" action="toggle:fullscreen" />

                    </MediaOutlet>
                    <MediaBufferingIndicator />
                    <MediaPoster alt={fiche.title + "- Episode " + episode.vostfr.num} />


                    <div style={{ bottom: "0", width: "100%", position: "absolute" }} className='media-ui'>
                        <Spotlight
                            scrollable={true}
                            actions={dataSpotlight}
                            nothingFound="Nothing found..."
                            highlightQuery
                            limit={50}
                            onSpotlightClose={() => {
                                if (player) {
                                    // @ts-ignore
                                    player.enterFullscreen();
                                }
                            }}
                            searchProps={{
                                leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
                                placeholder: 'Search...',
                            }}
                            maxHeight={350}
                        />
                        <MediaTimeSlider keyStep={10} shiftKeyMultiplier={2}>
                        </MediaTimeSlider>
                        <Flex align="center" style={{ marginTop: -20 }}>
                            <MediaPlayButton aria-keyshortcuts="k Space">
                                {/* @ts-ignore */}
                                <IconPlayerPlay slot={"play"} />
                                {/* @ts-ignore */}
                                <IconPlayerPause slot={"pause"} />
                            </MediaPlayButton>
                            <MediaMuteButton aria-keyshortcuts="m">
                                {/* @ts-ignore */}
                                <IconVolume2 slot="volume-low" />
                                {/* @ts-ignore */}
                                <IconVolumeOff slot="volume-muted" />
                                {/* @ts-ignore */}
                                <IconVolume slot="volume-high" />
                            </MediaMuteButton>
                            <MediaSeekButton seconds={+90} >
                                {/* @ts-ignore */}
                                <IconPlayerSkipForwardFilled slot={"forward"} />
                            </MediaSeekButton>
                            <MediaTime type="current" color="white" />
                            <div> / </div>
                            <MediaTime type="duration" color="white" />
                            <Center style={{ width: "100%" }}>
                                {!isMobile && <Text size="sm" style={{ color: "white" }} truncate="end">{spliceText(fiche.title, 5) + "- Episode " + episode.vostfr.num}</Text>}
                            </Center>
                            <Button onClick={() => {
                                let newLang = (currentLangue === "vostfr" ? "vf" : "vostfr") as "vf" | "vostfr";
                                if (episode && episode[newLang as "vostfr" | "vf"]) {
                                    setCurrentLangue(newLang);
                                }
                            }}
                                style={{ fontWeight: "bold" }}
                                variant="transparent"
                            >
                                {(currentLangue === "vostfr" ? "vf" : "vostfr").toUpperCase()}
                            </Button>
                            <ActionIcon
                                variant="transparent"
                                color="white"
                                onClick={() => {
                                    if (player) {
                                        // @ts-ignore
                                        player.exitFullscreen();
                                    }
                                    spotlight.open();
                                }}
                            >
                                <IconMovie />
                            </ActionIcon>
                            <ActionIcon
                                variant="transparent"
                                color="white"
                                onClick={downloadEpisode}
                            >
                                <IconDownload />
                            </ActionIcon>
                            <ActionIcon
                                variant="transparent"
                                color="white"
                                onClick={nextEpisode}
                            >
                                <IconArrowRight />
                            </ActionIcon>

                            <MediaPIPButton>
                                {/* @ts-ignore */}
                                <IconPictureInPictureOff slot={"enter"} />
                                {/* @ts-ignore */}
                                <IconPictureInPictureOn slot={"exit"} />
                            </MediaPIPButton>
                            <MediaFullscreenButton>
                                {/* @ts-ignore */}
                                <IconMaximize slot={"enter"} />
                                {/* @ts-ignore */}
                                <IconMinimize slot={"exit"} />
                            </MediaFullscreenButton>
                        </Flex>
                    </div>
                    <Flex className='media-ui' style={{ position: "absolute", top: 0, right: 0, width: "100%", zIndex: 1000 }} justify={"space-between"} align={"center"} bg={"rgba(0,0,0,0.1)"} >
                        <ActionIcon
                            variant="transparent"
                            color="white"
                            onClick={() => { navigate("/anime/" + animeId) }}
                        >
                            <IconHome />
                        </ActionIcon>

                        <MediaMenu>
                            <MediaMenuButton label="Settings" >
                                <IconSettings />
                            </MediaMenuButton>
                            <MediaMenuItems>
                                <MediaMenu>
                                    <MediaQualityMenuButton label="Quality"></MediaQualityMenuButton>
                                    <MediaQualityMenuItems autoLabel="Auto" />
                                </MediaMenu>
                                <MediaMenu>
                                    <MediaPlaybackRateMenuButton label="Speed"></MediaPlaybackRateMenuButton>
                                    <MediaPlaybackRateMenuItems autoLabel="Auto" />
                                </MediaMenu>
                            </MediaMenuItems>
                        </MediaMenu>
                    </Flex>
                </MediaPlayer>
            </div>
        )
    } else {
        return (
            <div className='overflow-hidden'>
                <Helmet>
                    <title>{fiche.title + "- Episode " + episode.vostfr.num}</title>
                    <meta name="description" content={fiche.title + "- Episode " + episode.vostfr.num} />
                    <meta property="og:title" content={fiche.title + "- Episode " + episode.vostfr.num} />
                    <meta property="og:description" content={fiche.title + "- Episode " + episode.vostfr.num} />
                    <meta property="og:image" content={fiche.url_image} />
                    <meta property='og:keywords' content={`${fiche.others}, ${fiche.title}, ${fiche.title} ${episode.vostfr.num}, ${fiche.title} ${episode.vostfr.num} vostfr, ${fiche.title} ${episode.vostfr.num} vf`} />
                    <meta property='keywords' content={`${fiche.others}, ${fiche.title}, ${fiche.title} ${episode.vostfr.num}, ${fiche.title} ${episode.vostfr.num} vostfr, ${fiche.title} ${episode.vostfr.num} vf`} />
                </Helmet>
                <Paper style={{ height: "100vh", margin: "20px" }} radius={"md"}>
                    <Flex justify={"space-between"} align={"center"} gap={"lg"}>
                        <Button
                            leftSection={<IconHome />}
                            onClick={() => {
                                navigate("/anime/" + animeId);
                                session?.getMediaSession()?.stop(new chrome.cast.media.StopRequest(), () => {
                                    console.log("Media stopped");
                                }, err => {
                                    console.log(err);
                                });
                            }}>Retour</Button>
                        <Button onClick={spotlight.open} variant="transparent" color="white" leftSection={<IconMovie />}>
                            Episodes
                        </Button>
                    </Flex>
                    <Center>
                        <Image src={fiche.url_image} h={"100%"} w={"300px"} />
                    </Center>
                    <Center>
                        <Text size="xl" style={{ color: 'white', fontSize: "1.5rem", marginTop: "5px", fontWeight: "bold", lineHeight: "2rem" }}>
                            {fiche.title} - Episode {episode.vostfr.num}
                        </Text>
                    </Center>
                    {session ? <div>
                        <Slider onChange={(value) => {
                            let seekTime = new chrome.cast.media.SeekRequest();
                            seekTime.currentTime = value;
                            session?.getMediaSession()?.seek(seekTime, () => {
                                console.log("ok");
                            }, (err) => {
                                console.log(err);
                            });
                        }}
                            defaultValue={currentTime}
                            max={castDuration}
                            value={currentTime}
                            label={(value) => formatDuree(Math.round(value))} // @ts-ignore
                            min={0}
                            step={1}
                            style={{ width: "100%" }}
                        />
                        <div style={{ height: 10 }} />
                        <Center>
                            <Text style={{ margin: 10 }}>{formatDuree(Math.round(currentTime))} / {formatDuree(Math.round(castDuration))}</Text>
                        </Center>
                        <Flex justify={"center"} align={"center"} gap={"lg"}>
                            <ActionIcon onClick={() => {
                                session?.endSession(true);
                                navigate("/anime/" + animeId);
                            }} variant="transparent" color="white">
                                <IconPlayerStop />
                            </ActionIcon>
                            <ActionIcon
                                variant='transparent'
                                onClick={() => {
                                    let seekTime = new chrome.cast.media.SeekRequest();
                                    seekTime.currentTime = currentTime - 10;
                                    session?.getMediaSession()?.seek(seekTime, () => {
                                        console.log("ok");
                                    }, (err) => {
                                        console.log(err);
                                    });
                                }
                                }><IconPlayerSkipBackFilled /></ActionIcon>
                            {castPlaying ?
                                <ActionIcon
                                    variant='transparent'
                                    onClick={() => {
                                        session?.getMediaSession()?.pause(new chrome.cast.media.PauseRequest(), () => {
                                            setCastPlaying(false);
                                        }, (err) => {
                                            console.log(err);
                                        });
                                    }}><IconPlayerPause /></ActionIcon> : <ActionIcon
                                        variant='transparent'
                                        onClick={() => {
                                            session?.getMediaSession()?.play(new chrome.cast.media.PlayRequest(), () => {
                                                setCastPlaying(true);
                                            }, (err) => {
                                                console.log(err);
                                            });
                                        }}><IconPlayerPlay /></ActionIcon>}
                            <ActionIcon onClick={() => {
                                let seekTime = new chrome.cast.media.SeekRequest();
                                seekTime.currentTime = currentTime + 10;
                                session?.getMediaSession()?.seek(seekTime, () => {
                                    console.log("ok");
                                }, (err) => {
                                    console.log(err);
                                });
                            }}
                                variant='transparent'
                            ><IconPlayerSkipForwardFilled /></ActionIcon>
                            <ActionIcon onClick={() => {
                                nextEpisode();
                            }} variant="transparent" color="white">
                                <IconArrowRight />
                            </ActionIcon>
                        </Flex>
                        <Center>
                            <Button onClick={() => {
                                setCurrentLangue(currentLangue === "vostfr" ? "vf" : "vostfr");
                                if (session && episode) {
                                    if (verifyIfVfIsAvailable(episode)) {
                                        let mediaInfo = new chrome.cast.media.MediaInfo(episode[currentLangue === "vostfr" ? "vf" : "vostfr"].videoUri, 'application/vnd.apple.mpegurl');
                                        session?.loadMedia(new chrome.cast.media.LoadRequest(mediaInfo));
                                        setCurrentLangue(currentLangue === "vostfr" ? "vf" : "vostfr");
                                    }
                                }
                            }}
                                style={{ fontWeight: "bold" }}
                                variant="transparent"
                            >
                                {(currentLangue === "vostfr" ? "vf" : "vostfr").toUpperCase()}
                            </Button>
                        </Center>
                        <Spotlight
                            scrollable={true}
                            actions={dataSpotlight}
                            nothingFound="Nothing found..."
                            highlightQuery
                            limit={50}
                            searchProps={{
                                leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
                                placeholder: 'Search...',
                            }}
                            maxHeight={350}
                        />
                    </div> : <div>Chargement...</div>}
                </Paper>
            </div>
        )

    }

}