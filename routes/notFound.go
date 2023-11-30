package routes

import (
	"io/fs"
	"net/http"
)

func NotFoundHandler(w http.ResponseWriter, r *http.Request, fsys fs.FS) {
	w.Header().Set("Content-Type", "text/html")

	// before returning the html, we need to replace the {{meta}} with the actual metadata
	html, err := fs.ReadFile(fsys, "404.html")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusInternalServerError)
		return
	}
	w.Write([]byte(html))
}
