package routes

import (
	"gazes_ssr/functions"
	"net/http"
)

func LatestHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")

	name := "Gazes - Dernières sorties"
	w.Write([]byte(functions.ReplaceHtml(name, functions.Description, functions.Image, functions.Keywords, "")))
}
