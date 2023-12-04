package routes

import (
	"encoding/json"
	"errors"
	"gazes_ssr/functions"
	"log"
	"net/http"
)

var client = functions.NewHttpClient()

func AnimeHandler(w http.ResponseWriter, r *http.Request, id string) {
	response, err := getAnime(id)
	if err != nil {
		NotFoundHandler(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html")
	name := response.Data.Title + " - Gazes"
	image := response.Data.UrlImage
	description := response.Data.Synopsis
	w.Write(functions.ReplaceHtml(name, description, image, functions.Keywords, ""))
}

func getAnime(id string) (*JsonResponse, error) {
	data, err := client.Get("https://api.gazes.fr/anime/animes/" + id)
	if err != nil {
		return nil, err
	}
	defer data.Body.Close()
	var response JsonResponse
	err = json.NewDecoder(data.Body).Decode(&response)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	if !response.Success {
		return nil, errors.New("failed to get anime")
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
