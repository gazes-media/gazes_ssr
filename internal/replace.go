package internal

import (
	"embed"
	"strings"
)

type HtmlAndMeta struct {
	Html     embed.FS
	Meta     embed.FS
	NotFound embed.FS
	VideoUrl string
}

func ReplaceHtml(title, description, image, tags string, metas HtmlAndMeta) []byte {
	html, err := metas.Html.ReadFile("public/index.html")
	if err != nil {
		return []byte("No html file found")
	}
	meta, err := metas.Meta.ReadFile("public/meta.html")
	if err != nil {
		return []byte("")
	}

	metaStr := string(meta)
	metaStr = strings.ReplaceAll(metaStr, "{{title}}", title)
	metaStr = strings.ReplaceAll(metaStr, "{{description}}", description)
	metaStr = strings.ReplaceAll(metaStr, "{{image}}", image)
	metaStr = strings.ReplaceAll(metaStr, "{{tags}}", tags)
	if metas.VideoUrl != "" {
		metaStr = strings.ReplaceAll(metaStr, "{{meta_video}}", metaVideo(metas.VideoUrl))
	} else {
		metaStr = strings.ReplaceAll(metaStr, "{{meta_video}}", "")
	}

	htmlStr := string(html)
	htmlStr = strings.ReplaceAll(htmlStr, "{{meta}}", metaStr)
	return []byte(htmlStr)
}

func metaVideo(url string) string {
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
