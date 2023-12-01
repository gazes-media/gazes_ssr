package functions

import (
	"html/template"
	"io/fs"
	"os"
	"strings"
)

const (
	Image       = "https://gazes.fr/favicon.ico"
	Description = "Gazes le seul site web qui vous permet de voir vos animé préféré en streaming gratuitement et sans publicité !"
	Keywords    = "Animes, Streaming, Anime, Manga, Scan, Scans, Scans VF, Scans VOSTFR, Scans FR, Naruto, One Piece, Bleach, Fairy Tail, Dragon Ball Super, Dragon Ball Z, Dragon Ball GT, Dragon Ball, Dragon Ball Kai, Dragon Ball Z Kai, Dragon Ball Z Kai The Final Chapters, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR, Dragon Ball Z Kai VF, Dragon Ball Z Kai VOSTFR, Dragon Ball Z Kai FR, Dragon Ball Super VF, Dragon Ball Super VOSTFR, Dragon Ball Super FR, Dragon Ball GT VF, Dragon Ball GT VOSTFR, Dragon Ball GT FR, Dragon Ball VF, Dragon Ball VOSTFR, Dragon Ball FR, Dragon Ball Z VF, Dragon Ball Z VOSTFR, Dragon Ball Z FR, Dragon Ball Z Kai VF, Dragon Ball Z Kai VOSTFR, Dragon Ball Z Kai FR, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR, Dragon Ball Z Kai The Final Chapters VF, Dragon Ball Z Kai The Final Chapters VOSTFR, Dragon Ball Z Kai The Final Chapters FR"
)



func getWorkdir() string {
   workdir,err := os.Getwd()
   if err != nil {
	  panic(err)
   }
   return workdir
}

func GetFs(workdir string) fs.FS {
   return os.DirFS(workdir+ "/public")
}

var Fsys = GetFs(getWorkdir())


func getMetaTemplate() *template.Template {
	meta, err := template.ParseFS(Fsys, "meta.html")
	if err != nil {
		panic(err)
	}
	return meta
}

func getHtmlTemplate() *template.Template {
	html, err := template.ParseFS(Fsys, "index.html")
	if err != nil {
		panic(err)
	}
	return html
}


func ReplaceHtml(title, description, image, tags, videoUri string) []byte {
	meta := getMetaTemplate()
	
	var metaTags strings.Builder
	meta.Execute(&metaTags, struct {
		Title       string
		Description string
		Image       string
		Tags        string
		VideoUri   string
	}{
		Title:       title,
		Description: description,
		Image:       image,
		Tags:        tags,
		VideoUri:    metaVideo(videoUri),
	})

	html := getHtmlTemplate()
	var htmlContent strings.Builder
	html.Execute(&htmlContent, struct {
		Meta template.HTML
	}{
		Meta: template.HTML(metaTags.String()),
	})
	return []byte(htmlContent.String())
}

func metaVideo(url string) string {
	if(url == "") {
		return ""
	}	
	return `<meta property="og:video" content="` + url + `">
	<meta property="og:video:secure_url" content="` + url + `">
	<meta property="og:video:type" content="text/html">
	<meta property="og:video:width" content="1280">
	<meta property="og:video:height" content="720">
	<meta property="og:video:tag" content="anime">
	<meta property="og:image:width" content="1280">
	<meta property="og:image:height" content="720">
	<meta property="og:image:type" content="image/jpeg">
	<meta property="twitter:player" content="` + url + `">
	<meta property="twitter:player:width" content="1280">
	<meta property="twitter:player:height" content="720">`
}
