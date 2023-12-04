package functions

import (
	"os"
	"sync"
	"time"
)

type Cache struct {
	data  map[string]interface{}
	mutex sync.RWMutex
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
	// auto remove after 12 hours
	go func() {
		time.Sleep(12 * time.Hour)
		e := os.Remove("videos/" + key + ".mp4") // remove the video from the disk
		if e == nil {
			c.Remove(key)
		}
	}()
}

func (c *Cache) Get(key string) (interface{}, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	value, found := c.data[key]
	return value, found
}

func (c *Cache) Remove(key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	delete(c.data, key)
}
