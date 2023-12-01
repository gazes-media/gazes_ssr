import { MediaOutlet, MediaPlayer, MediaGesture, MediaPoster, MediaBufferingIndicator, MediaTimeSlider, MediaPlayButton, MediaSeekButton, MediaPIPButton, MediaTime, MediaMenu, MediaQualityMenuButton, MediaFullscreenButton, MediaMenuItems, MediaQualityMenuItems, MediaMenuButton, MediaPlaybackRateMenuButton, MediaPlaybackRateMenuItems, MediaMuteButton } from '@vidstack/react';
import { EpisodeWithVideo, FicheAnime } from '../utils/apiFetcher';
import { MouseEventHandler } from 'react';
import { IconArrowRight, IconHome, IconMaximize, IconMinimize, IconMovie, IconPictureInPictureOff, IconPictureInPictureOn, IconPlayerPause, IconPlayerPlay, IconPlayerSkipForwardFilled, IconSearch, IconSettings, IconVolume, IconVolume2, IconVolumeOff } from '@tabler/icons-react';
import { ActionIcon, Button, Center, Flex, Text, rem } from '@mantine/core';
import { MediaPlayerElement } from 'vidstack';
import { Spotlight, SpotlightActionData, spotlight } from '@mantine/spotlight';
import { spliceText } from '../utils/util';

type Props = {
    animeId: string;
    onProviderChange: Function;
    fiche: FicheAnime;
    episode: EpisodeWithVideo;
    currentLangue: "vostfr" | "vf";
    onTimeUpdate: Function;
    nextEpisode: MouseEventHandler<HTMLButtonElement>;
    dataSpotlight: SpotlightActionData[];
    isMobile: boolean;
    player: MediaPlayerElement | null;
    setCurrentLangue: Function;
    navigate: Function;
}

export default function PlayerCustom({ navigate, animeId, onProviderChange, fiche, episode, currentLangue,onTimeUpdate, nextEpisode, dataSpotlight, isMobile, player, setCurrentLangue}: Props) {
    return (
        <div className='overflow-hidden'>
                <MediaPlayer
                    onProviderChange={onProviderChange}
                    title={fiche.title + "- Episode " + episode.vostfr.num}
                    autoplay={true}
                    src={{
                        src: episode[currentLangue].videoUri,
                        type: 'application/x-mpegurl',
                    }}
                    onTimeUpdate={onTimeUpdate}
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
                        <Flex align="center" bg={"rgba(0,0,0,0.1)"} style={{ marginTop: -20 }}>
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
                                let newLang = currentLangue === "vostfr" ? "vf" : "vostfr";
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
}