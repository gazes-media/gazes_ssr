import { EpisodeWithVideo, FicheAnime } from '../utils/apiFetcher';
import { IconArrowRight, IconHome, IconMovie, IconPlayerPause, IconPlayerPlay, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconPlayerStop, IconSearch } from '@tabler/icons-react';
import { ActionIcon, Button, Center, Flex, Image, Paper, Slider, Text, rem } from '@mantine/core';
import { Spotlight, SpotlightActionData, spotlight } from '@mantine/spotlight';
type Props = {
    animeId: string;
    session: cast.framework.CastSession | null;
    navigate: Function;
    currentTime: number;
    setCastPlaying: Function;
    fiche: FicheAnime;
    episode: EpisodeWithVideo;
    castDuration: number;
    nextEpisode: Function;
    currentLangue: "vf" | "vostfr";
    setCurrentLangue: Function;
    dataSpotlight: SpotlightActionData[];
    castPlaying: boolean;
}

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

export default function ChromeCastPlayer({ animeId, session, navigate, currentTime, setCastPlaying, fiche, episode, castDuration, nextEpisode, currentLangue, setCurrentLangue, dataSpotlight, castPlaying}: Props) {
    return (
        <div className='overflow-hidden'>
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