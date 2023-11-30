package internal

import (
	"embed"
	"strings"
)

type HtmlAndMeta struct {
	Html     embed.FS
	Meta     embed.FS
	NotFound embed.FS
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

	htmlStr := string(html)
	htmlStr = strings.ReplaceAll(htmlStr, "{{meta}}", metaStr)
	return []byte(htmlStr)
}
