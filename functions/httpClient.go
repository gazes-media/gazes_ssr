package functions

import (
	"net/http"
	"crypto/tls"
)

type HttpClient struct {
	client *http.Client
}

func NewHttpClient() *HttpClient {
	return &HttpClient{
		client: &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ignore expired SSL certificates
			},
		},
	}
}

func (c *HttpClient) Get(url string) (*http.Response, error) {
	return c.client.Get(url)
}