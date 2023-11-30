package routes

import (
	"gazes_ssr/internal"
	"io/fs"
	"net/http"
)

func HistoryHandler(w http.ResponseWriter, r *http.Request, fsys fs.FS) {
	w.Header().Set("Content-Type", "text/html")

	name := "Gazes - Historique"
	image := "https://gazes.fr/favicon.ico"
	description := "Gazes le seul site web qui vous permet de voir vos animé préféré en streaming gratuitement et sans publicité !"
	keywords := "Animes, Streaming, Anime, Manga, Scan, Scans, Scans VF, Scans VOSTFR, Scans FR, Naruto, One Piece, Bleach, Fairy Tail, Dragon Ball Super, Dragon Ball Z, Dragon Ball GT, Dragon Ball, Dragon Ball Kai, Dragon Ball Z Kai, Dragon Ball Z Kai The Final Chapters, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR, Dragon Ball Z Kai VF, Dragon Ball Z Kai VOSTFR, Dragon Ball Z Kai FR, Dragon Ball Super VF, Dragon Ball Super VOSTFR, Dragon Ball Super FR, Dragon Ball GT VF, Dragon Ball GT VOSTFR, Dragon Ball GT FR, Dragon Ball VF, Dragon Ball VOSTFR, Dragon Ball FR, Dragon Ball Z VF, Dragon Ball Z VOSTFR, Dragon Ball Z FR, Dragon Ball Z Kai VF, Dragon Ball Z Kai VOSTFR, Dragon Ball Z Kai FR, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR"
	w.Write([]byte(internal.ReplaceHtml(name, description, image, keywords, fsys)))
}
