package routes

import (
	"errors"
	"gazes_ssr/functions"
	"log"
	"net/http"
	"strconv"
)

func EpisodeHandler(w http.ResponseWriter, r *http.Request, id, ep string) {
	// before returning the html, we need to replace the {{meta}} with the actual metadata
	datas, err := getAnime(id)
	if err != nil {
		log.Println("Anime not found: " + id)
		NotFoundHandler(w, r)
		return
	}
	episode, err := getEpisode(datas.Data, ep)
	if err != nil {
		log.Println("Episode not found: " + ep)
		NotFoundHandler(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html")
	w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")
	w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
	name := "Episode " + strconv.Itoa(episode.Num) + " - " + episode.Title + " - Gazes"
	image := episode.UrlImage
	description := "Regarder l'épisode " + strconv.Itoa(episode.Num) + " de " + datas.Data.Title + " en streaming VOSTFR sur Gazes"
	videoUri := "https://gazes.fr/anime/" + id + "/episode/" + ep
	w.Write(functions.ReplaceHtml(name, description, image, functions.Keywords, videoUri))
}

func getEpisode(anime Fiche, ep string) (Episode, error) {
	epNum, err := strconv.Atoi(ep)
	if err != nil {
		return Episode{}, err
	}
	for _, e := range anime.Episodes {
		if e.Num == epNum {
			return e, nil
		}
	}
	return Episode{}, errors.New("Episode not found")
}
