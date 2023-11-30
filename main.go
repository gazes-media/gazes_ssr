package main

import (
	"gazes_ssr/routes"
	"io/fs"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

var fsys fs.FS
var static http.Handler
var port string = "5454"

func init() {
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	workingDir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}
	fsys = os.DirFS(workingDir + "/public")
	static = http.FileServer(http.Dir("./public/assets/"))

}

func main() {
	router := mux.NewRouter()
	router.PathPrefix("/assets").Handler(http.StripPrefix("/assets/", static))
	router.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		routes.FaviconHandler(w, r, fsys)
	})
	router.HandleFunc("/sitemap", func(w http.ResponseWriter, r *http.Request) {
		routes.SitemapHandler(w, r, fsys)
	})

	router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		routes.NotFoundHandler(w, r, fsys)
	})

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		routes.MasterHandler(w, r, fsys)
	})
	router.HandleFunc("/search", func(w http.ResponseWriter, r *http.Request) {
		routes.SearchHandler(w, r, fsys)
	})

	router.HandleFunc("/latest", func(w http.ResponseWriter, r *http.Request) {
		routes.LatestHandler(w, r, fsys)
	})

	router.Handle("/anime/{id}", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if id == "" {
			routes.NotFoundHandler(w, r, fsys)
			return
		}
		routes.AnimeHandler(w, r, id, fsys)
	}))

	router.Handle("/anime/{id}/episode/{episode}", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		episode := mux.Vars(r)["episode"]
		if id == "" || episode == "" {
			routes.NotFoundHandler(w, r, fsys)
			return
		}
		routes.EpisodeHandler(w, r, id, episode, fsys)
	}))

	router.HandleFunc("/history", func(w http.ResponseWriter, r *http.Request) {
		routes.HistoryHandler(w, r, fsys)
	})

	server := &http.Server{
		Addr:    "127.0.0.1:" + port,
		Handler: router,
	}
	log.Println("Listening on port " + port)
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
