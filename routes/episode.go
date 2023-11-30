package routes

import (
	"errors"
	"gazes_ssr/internal"
	"log"
	"net/http"
	"strconv"
)

func EpisodeHandler(w http.ResponseWriter, r *http.Request, id, ep string, fsys internal.HtmlAndMeta) {
	w.Header().Set("Content-Type", "text/html")

	// before returning the html, we need to replace the {{meta}} with the actual metadata
	datas, err := getAnime(id)
	if err != nil {
		log.Println("Anime not found: " + id)
		NotFoundHandler(w, r, fsys)
		return
	}
	episode, err := getEpisode(datas.Data, ep)
	if err != nil {
		log.Println("Episode not found: " + ep)
		NotFoundHandler(w, r, fsys)
		return
	}
	name := "Episode " + strconv.Itoa(episode.Num) + " - " + episode.Title + " - Gazes"
	image := episode.UrlImage
	description := "Regarder l'épisode " + strconv.Itoa(episode.Num) + " de " + datas.Data.Title + " en streaming VOSTFR sur Gazes"
	keywords := "Animes, Streaming, Anime, Manga, Scan, Scans, Scans VF, Scans VOSTFR, Scans FR, Naruto, One Piece, Bleach, Fairy Tail, Dragon Ball Super, Dragon Ball Z, Dragon Ball GT, Dragon Ball, Dragon Ball Kai, Dragon Ball Z Kai, Dragon Ball Z Kai The Final Chapters, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR, Dragon Ball Z Kai VF, Dragon Ball Z Kai VOSTFR, Dragon Ball Z Kai FR, Dragon Ball Super VF, Dragon Ball Super VOSTFR, Dragon Ball Super FR, Dragon Ball GT VF, Dragon Ball GT VOSTFR, Dragon Ball GT FR, Dragon Ball VF, Dragon Ball VOSTFR, Dragon Ball FR, Dragon Ball Z VF, Dragon Ball Z VOSTFR, Dragon Ball Z FR, Dragon Ball Z Kai VF, Dragon Ball Z Kai VOSTFR, Dragon Ball Z Kai FR, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR"
	w.Write(internal.ReplaceHtml(name, description, image, keywords, fsys))
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
