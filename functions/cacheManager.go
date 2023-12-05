package functions

import (
	"os"
	"sync"
	"time"
)

type Cache struct {
	data  map[string]interface{}
	mutex sync.Mutex
}

func NewCache() *Cache {
	return &Cache{
		data: make(map[string]interface{}),
	}
}

func (c *Cache) Set(key string, value interface{}) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.data[key] = value

	// Check cache size and remove last if it exceeds 50
	if len(c.data) > 50 {
		c.removeLast()
	}

	// Schedule auto-removal after 12 hours
	go func() {
		time.Sleep(12 * time.Hour)
		c.removeExpired(key)
	}()
}

func (c *Cache) Get(key string) (interface{}, bool) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	value, found := c.data[key]
	return value, found
}

func (c *Cache) Remove(key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	delete(c.data, key)
}

func (c *Cache) removeLast() {
	for k, data := range c.data {
		if data.(string) != "downloading" {
			delete(c.data, k)
			_ = os.Remove("videos/" + k + ".mp4") // remove the video from the disk
			break
		}
	}
}

func (c *Cache) removeExpired(key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Check if the key still exists and remove it
	if _, ok := c.data[key]; ok {
		_ = os.Remove("videos/" + key + ".mp4") // remove the video from the disk
		delete(c.data, key)
	}
}
