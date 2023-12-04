package routes

import (
	"bufio"
	"encoding/json"
	"fmt"
	"gazes_ssr/functions"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
)

func DownloadHandler(w http.ResponseWriter, r *http.Request, id, ep string, cache *functions.Cache) {
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
	downloadEpisode(episode, cache)
	episodeName := episode.Vostfr.Title + "- Episode " + strconv.Itoa(episode.Vostfr.Num)
	videoIsReady, found := cache.Get(episodeName)
	if found {
		if videoIsReady.(string) == "downloading" {
			http.ServeFile(w, r, "public/encoding.mp4")
			return
		} else {
			http.ServeFile(w, r, "videos/"+videoIsReady.(string))
			return
		}
	}
}

func downloadEpisode(episode EpisodeJson, cache *functions.Cache) (string, error) {
	// check if the video is already in the folder, and if it is, put it in the cache and return it
	episodeName := episode.Vostfr.Title + "- Episode " + strconv.Itoa(episode.Vostfr.Num)
	// check if the video dir exists
	if _, err := os.Stat("videos"); os.IsNotExist(err) {
		os.Mkdir("videos", 0755)
	}
	if _, err := os.Stat("videos/" + episodeName + ".mp4"); err == nil {
		cache.Set(episodeName, episodeName+".mp4")
		return episodeName + ".mp4", nil
	}
	fmt.Println("Downloading " + episodeName)
	value, found := cache.Get(episodeName)
	if found {
		if value.(string) == "downloading" {
			return "", nil
		} else {
			return value.(string), nil
		}
	}
	cmd := exec.Command("ffmpeg", "-i", episode.Vostfr.VideoUri, "-c", "copy", "-bsf:a", "aac_adtstoasc", "videos/"+episodeName+".mp4")
	stdout, err := cmd.StderrPipe()
	if err != nil {
		return "", err
	}
	if err := cmd.Start(); err != nil {
		return "", err
	}
	cache.Set(episodeName, "downloading")
	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		m := scanner.Text()
		if strings.Contains(m, "time=") {
			cache.Set(episodeName, episodeName+".mp4")
		}
	}
	if err := cmd.Wait(); err != nil {
		return "", err
	}
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
