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
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}
	static = http.FileServer(http.Dir("./public/assets"))

}

func main() {
	router := mux.NewRouter()
	router.PathPrefix("/assets").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")
		http.StripPrefix("/assets", static).ServeHTTP(w, r)
	})
	router.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./public/favicon.ico")
	})
	router.HandleFunc("/sitemap.xml", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./public/sitemap.xml")
	})
	router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		routes.NotFoundHandler(w, r)
	})

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		routes.MasterHandler(w, r)
	})
	router.HandleFunc("/search", func(w http.ResponseWriter, r *http.Request) {
		routes.SearchHandler(w, r)
	})

	router.HandleFunc("/latest", func(w http.ResponseWriter, r *http.Request) {
		routes.LatestHandler(w, r)
	})

	router.Handle("/anime/{id}", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if id == "" {
			routes.NotFoundHandler(w, r)
			return
		}
		routes.AnimeHandler(w, r, id)
	}))

	router.Handle("/anime/{id}/episode/{episode}", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		episode := mux.Vars(r)["episode"]
		if id == "" || episode == "" {
			routes.NotFoundHandler(w, r)
			return
		}
		routes.EpisodeHandler(w, r, id, episode)
	}))

	router.HandleFunc("/history", func(w http.ResponseWriter, r *http.Request) {
		routes.HistoryHandler(w, r)
	})

	server := &http.Server{
		Addr:    "0.0.0.0:" + port,
		Handler: router,
	}
	log.Println("Listening on port " + port)
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
