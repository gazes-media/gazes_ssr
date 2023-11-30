package internal

import (
	"io/fs"
	"strings"
)

func ReplaceHtml(title, description, image, tags string, fsys fs.FS) []byte {
	html, err := fs.ReadFile(fsys, "index.html")
	if err != nil {
		return []byte("No html file found")
	}

	meta, err := fs.ReadFile(fsys, "meta.html")
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