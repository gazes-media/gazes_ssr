package routes

import (
	"io/fs"
	"net/http"
)

func SitemapHandler(w http.ResponseWriter, r *http.Request, fsys fs.FS) {
	w.Header().Set("Content-Type", "application/xml")

	sitemap, err := fs.ReadFile(fsys, "sitemap.xml")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusInternalServerError)
		return
	}
	w.Write([]byte(sitemap))
}