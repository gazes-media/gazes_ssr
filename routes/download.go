package routes

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"time"
)

func DownloadHandler(w http.ResponseWriter, r *http.Request, id, ep string) {
	// before returning the html, we need to replace the {{meta}} with the actual metadata
	datas, err := getAnime(id)
	if err != nil {
		log.Println("Anime not found: " + id)
		NotFoundHandler(w, r)
		return
	}
	episode, err := getJsonEpisode(datas.Data, ep)
	if err != nil {
		log.Println("Episode not found: " + ep)
		NotFoundHandler(w, r)
		return
	}

	w.Header().Set("Content-Type", "video/mp4")
	videoIsReady, err := downloadEpisode(episode)
	if err != nil {
		fmt.Println("DownloadStatus: " + err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else {
		http.ServeFile(w, r, videoIsReady)
	}
}

func downloadEpisode(episode EpisodeJson) (string, error) {
	// check if the video is already in the folder, and if it is, put it in the cache and return it
	episodeName := episode.Vostfr.Title + "- Episode " + strconv.Itoa(episode.Vostfr.Num)
	if _, err := os.Stat(episodeName + ".mp4"); err == nil {
		return episodeName + ".mp4", nil
	}
	fmt.Println("Downloading " + episodeName)
	cmd := exec.Command("ffmpeg", "-i", episode.Vostfr.VideoUri, "-c", "copy", "-bsf:a", "aac_adtstoasc", episodeName+".mp4")
	stderr, err := cmd.StderrPipe()
	if err != nil {
		fmt.Println("Error creating stderr pipe:", err)
		return "", err
	}

	if err := cmd.Start(); err != nil {
		fmt.Println("Error starting ffmpeg:", err)
		return "", err
	}

	scanner := bufio.NewScanner(stderr)
	for scanner.Scan() {
	}
	fmt.Println("Downloaded " + episodeName)
	if err := cmd.Wait(); err != nil {
		return "", err
	}
	go func() {
		// remove the video after 1 hour
		time.Sleep(1 * time.Hour)
		os.Remove(episodeName + ".mp4")
	}()

	return episode.Vostfr.Title + ".mp4", nil

}

func getJsonEpisode(anime Fiche, episodeId string) (EpisodeJson, error) {
	_, err := getEpisode(anime, episodeId)
	if err != nil {
		log.Println("Episode not found: " + episodeId)
		return EpisodeJson{}, err
	}

	datas, err := client.Get("https://api.gazes.fr/anime/animes/" + strconv.Itoa(anime.Id) + "/" + episodeId)
	if err != nil {
		log.Println("Error while getting episode json: " + err.Error())
		return EpisodeJson{}, err
	}
	defer datas.Body.Close()
	var episode JsonResponseEpisode
	err = json.NewDecoder(datas.Body).Decode(&episode)
	if err != nil {
		log.Println("Error while decoding episode json: " + err.Error())
		return EpisodeJson{}, err
	}
	if !episode.Success {
		log.Println("Error while getting episode json: " + err.Error())
		return EpisodeJson{}, err
	}
	return episode.Data, nil
}

type JsonResponseEpisode struct {
	Success bool        `json:"success"`
	Data    EpisodeJson `json:"data"`
}

type EpisodeJson struct {
	Vostfr LangEpisode `json:"vostfr"`
	Vf     LangEpisode `json:"vf"`
}

type LangEpisode struct {
	VideoUri     string   `json:"videoUri"`
	VideoVtt     []string `json:"videoVtt"`
	VideoBaseUrl string   `json:"videoBaseUrl"`
	Time         string   `json:"time"`
	Episode      string   `json:"episode"`
	Num          int      `json:"num"`
	Title        string   `json:"title"`
	Url          string   `json:"url"`
	UrlImage     string   `json:"url_image"`
}
