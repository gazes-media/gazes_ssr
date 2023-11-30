package main

import (
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/api/v1/health", HealthCheckHandler).Methods("GET")
	static := http.FileServer(http.Dir("./public/assets/"))
	workingDir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	fsys := os.DirFS(workingDir + "/public")
	html, err := fs.ReadFile(fsys, "index.html")
	if err != nil {
		log.Fatal(err)
	}
	ico, err := fs.ReadFile(fsys, "favicon.ico")
	if err != nil {
		log.Fatal(err)
	}
	sitemap, err := fs.ReadFile(fsys, "sitemap.xml")
	if err != nil {
		log.Fatal(err)
	}
	router.PathPrefix("/assets").Handler(http.StripPrefix("/assets/", static))
	router.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/x-icon")
		w.Write([]byte(ico))
	})
	router.HandleFunc("/sitemap", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/xml")
		w.Write([]byte(sitemap))
	})

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")

		// before returning the html, we need to replace the {{meta}} with the actual metadata
		stringified := string(html)
		metaAdded := strings.ReplaceAll(stringified, "{{meta}}", buildMetaData("Gazes - Home", "https://gazes.fr/favicon.ico",
			"Gazes is a social media platform that allows you to share your thoughts and ideas with the world.",
			"gazes, social media, social network, social platform, gazes.io, gazesio, gazes.io social media, gazes.io social network, gazes.io social platform, gazes.io social media platform, gazes.io social network platform, gazes.io social platform platform"))
		w.Write([]byte(metaAdded))
	})
	server := &http.Server{
		Addr:    "127.0.0.1:5454",
		Handler: router,
	}
	log.Println("Listening...")
	server.ListenAndServe()
}

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "ok"}`))
}

func buildMetaData(title, image, description, tags string) string {
	meta := ""
	meta += "<meta property=\"og:title\" content=\"" + title + "\" />"
	meta += "<meta property=\"og:image\" content=\"" + image + "\" />"
	meta += "<meta property=\"og:description\" content=\"" + description + "\" />"
	meta += "<meta property=\"og:site_name\" content=\"Gazes\" />"
	meta += "<meta property=\"og:type\" content=\"website\" />"
	meta += "<meta property=\"og:url\" content=\"https://gazes.fr\" />"
	meta += "<meta name=\"twitter:card\" content=\"summary_large_image\" />"
	meta += "<meta name=\"twitter:title\" content=\"" + title + "\" />"
	meta += "<meta name=\"twitter:image\" content=\"" + image + "\" />"
	meta += "<meta name=\"twitter:description\" content=\"" + description + "\" />"
	meta += "<meta name=\"twitter:site\" content=\"@garder500\" />"
	meta += "<meta name=\"twitter:creator\" content=\"@garder500\" />"
	meta += "<meta name=\"keywords\" content=\"" + tags + "\" />"
	meta += "<meta name=\"description\" content=\"" + description + "\" />"
	meta += "<meta name=\"author\" content=\"Gazes\" />"
	meta += "<meta name=\"robots\" content=\"index, follow\" />"
	meta += "<meta name=\"googlebot\" content=\"index, follow\" />"
	meta += "<meta name=\"google\" content=\"notranslate\" />"
	meta += "<meta name=\"google\" content=\"nositelinkssearchbox\" />"
	return meta
}
