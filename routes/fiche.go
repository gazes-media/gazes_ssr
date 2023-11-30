package routes

import (
	"encoding/json"
	"gazes_ssr/internal"
	"io/fs"
	"net/http"
)

func AnimeHandler(w http.ResponseWriter, r *http.Request, id string, fsys fs.FS) {
	w.Header().Set("Content-Type", "text/html")
	response, err := getAnime(id)
	if err != nil {
		NotFoundHandler(w, r, fsys)
		return
	}
	name := response.Data.Title + " - Gazes"
	image := response.Data.UrlImage
	description := response.Data.Synopsis
	keywords := "Animes, Streaming, Anime, Manga, Scan, Scans, Scans VF, Scans VOSTFR, Scans FR, Naruto, One Piece, Bleach, Fairy Tail, Dragon Ball Super, Dragon Ball Z, Dragon Ball GT, Dragon Ball, Dragon Ball Kai, Dragon Ball Z Kai, Dragon Ball Z Kai The Final Chapters, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR, Dragon Ball Z Kai VF, Dragon Ball Z Kai VOSTFR, Dragon Ball Z Kai FR, Dragon Ball Super VF, Dragon Ball Super VOSTFR, Dragon Ball Super FR, Dragon Ball GT VF, Dragon Ball GT VOSTFR, Dragon Ball GT FR, Dragon Ball VF, Dragon Ball VOSTFR, Dragon Ball FR, Dragon Ball Z VF, Dragon Ball Z VOSTFR, Dragon Ball Z FR, Dragon Ball Z Kai VF, Dragon Ball Z Kai VOSTFR, Dragon Ball Z Kai FR, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR"
	w.Write(internal.ReplaceHtml(name, description, image, keywords, fsys))
}

func getAnime(id string) (*JsonResponse, error) {
	data, err := http.Get("https://api.gazes.fr/anime/animes/" + id)
	if err != nil {
		return nil, err
	}
	defer data.Body.Close()
	var response JsonResponse
	err = json.NewDecoder(data.Body).Decode(&response)
	if err != nil {
		return nil, err
	}
	return &response, nil
}

type Episode struct {
	Time     string `json:"time"`
	Episode  string `json:"episode"`
	Num      int    `json:"num"`
	Title    string `json:"title"`
	Url      string `json:"url"`
	UrlImage string `json:"url_image"`
}

type Fiche struct {
	Id            int       `json:"id"`
	Title         string    `json:"title"`
	TitleEnglish  string    `json:"title_english"`
	TitleRomanji  string    `json:"title_romanji"`
	TitleFrench   string    `json:"title_french"`
	Others        string    `json:"others"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Popularity    float64   `json:"popularity"`
	Url           string    `json:"url"`
	Genres        []string  `json:"genres"`
	UrlImage      string    `json:"url_image"`
	Score         string    `json:"score"`
	StartDateYear string    `json:"start_date_year"`
	Nbeps         string    `json:"nb_eps"`
	Synopsis      string    `json:"synopsis"`
	CoverURL      string    `json:"coverUrl"`
	Episodes      []Episode `json:"episodes"`
}

type JsonResponse struct {
	Success bool  `json:"success"`
	Data    Fiche `json:"data"`
}
