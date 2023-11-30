package routes

import (
	"gazes_ssr/internal"
	"net/http"
)

func NotFoundHandler(w http.ResponseWriter, r *http.Request, metas internal.HtmlAndMeta) {
	w.Header().Set("Content-Type", "text/html")

	// before returning the html, we need to replace the {{meta}} with the actual metadata
	html, err := metas.NotFound.ReadFile("public/404.html")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusInternalServerError)
		return
	}
	w.Write([]byte(html))
}
