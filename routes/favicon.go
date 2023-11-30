package routes

import (
	"io/fs"
	"net/http"
)

func FaviconHandler(w http.ResponseWriter, r *http.Request, fsys fs.FS) {
	w.Header().Set("Content-Type", "image/x-icon")

	ico, err := fs.ReadFile(fsys, "favicon.ico")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusInternalServerError)
		return
	}
	w.Write([]byte(ico))
}