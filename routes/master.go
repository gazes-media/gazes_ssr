package routes

import (
	"gazes_ssr/functions"
	"net/http"
)

func MasterHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	name := "Gazes - Home"
	w.Write(functions.ReplaceHtml(name, functions.Description, functions.Image, functions.Keywords, ""))
}
