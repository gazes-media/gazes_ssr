package routes

import (
	"gazes_ssr/functions"
	"net/http"
)

func HistoryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	name := "Gazes - Historique"
	w.Write([]byte(functions.ReplaceHtml(name, functions.Description, functions.Image, functions.Keywords, "")))
}
