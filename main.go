package main

import (
	"embed"
	"gazes_ssr/internal"
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

//go:embed public/assets
var content embed.FS

//go:embed public/favicon.ico
var favicon embed.FS

//go:embed public/sitemap.xml
var sitemap embed.FS

//go:embed public/index.html
var f embed.FS

//go:embed public/meta.html
var metaf embed.FS

//go:embed public/404.html
var notfound embed.FS

func init() {
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}
	staticFs := fs.FS(content)
	assets, err := fs.Sub(staticFs, "public/assets")
	if err != nil {
		log.Fatal(err)
	}
	static = http.FileServer(http.FS(assets))

}

func main() {
	router := mux.NewRouter()
	router.PathPrefix("/assets").Handler(http.StripPrefix("/assets/", static))

	router.Handle("/favicon.ico", http.FileServer(http.FS(favicon)))
	router.Handle("/sitemap.xml", http.FileServer(http.FS(sitemap)))
	router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		routes.NotFoundHandler(w, r, giveHtmlAndMeta())
	})

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		routes.MasterHandler(w, r, giveHtmlAndMeta())
	})
	router.HandleFunc("/search", func(w http.ResponseWriter, r *http.Request) {
		routes.SearchHandler(w, r, giveHtmlAndMeta())
	})

	router.HandleFunc("/latest", func(w http.ResponseWriter, r *http.Request) {
		routes.LatestHandler(w, r, giveHtmlAndMeta())
	})

	router.Handle("/anime/{id}", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if id == "" {
			routes.NotFoundHandler(w, r, giveHtmlAndMeta())
			return
		}
		routes.AnimeHandler(w, r, id, giveHtmlAndMeta())
	}))

	router.Handle("/anime/{id}/episode/{episode}", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		episode := mux.Vars(r)["episode"]
		if id == "" || episode == "" {
			routes.NotFoundHandler(w, r, giveHtmlAndMeta())
			return
		}
		routes.EpisodeHandler(w, r, id, episode, giveHtmlAndMeta())
	}))

	router.HandleFunc("/history", func(w http.ResponseWriter, r *http.Request) {
		routes.HistoryHandler(w, r, giveHtmlAndMeta())
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

func giveHtmlAndMeta() internal.HtmlAndMeta {
	return internal.HtmlAndMeta{
		Html:     f,
		Meta:     metaf,
		NotFound: notfound,
		VideoUrl: "",
	}
}
