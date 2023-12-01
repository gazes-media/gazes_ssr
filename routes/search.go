package routes

import (
	"gazes_ssr/functions"
	"net/http"
)

func SearchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	name := "Gazes - Search"
	w.Write(functions.ReplaceHtml(name, functions.Description, functions.Image, functions.Keywords,""))

}
