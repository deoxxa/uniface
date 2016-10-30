package main

import (
	// "fmt"
	"time"

	"fknsrs.biz/p/uniface/clients/uniface-go"
)

func main() {
	c := uniface.NewClient()

	// c.Info(fmt.Sprintf("cool: %v", c.MustConfirm("is this cool?")))
	// c.Info(fmt.Sprintf("you said: %q", c.MustPrompt("what do you say?")))
	// c.Info(fmt.Sprintf("ha ha your password is %q", c.MustPassword("what is your password?")))
	// c.Info(fmt.Sprintf("apparently %s is the best", c.MustOption("what is the best?", []string{"pizza", "burger"})))
	// c.Info(fmt.Sprintf("okay, these are good: %v", c.MustOptions("what is good?", []string{"milkshake", "cola", "coffee"})))

	go func() {
		progressToken := c.MustProgress(nil, 25, 0, false)

		for i := 0; true; i++ {
			time.Sleep(time.Millisecond * 100)
			progressToken = c.MustProgress(&progressToken, 25, float64(i%25), false)
		}
	}()

	for i := 0; i < 10; i++ {
		text := c.MustPrompt("what do you want to say?")
		switch c.MustOption("how do you want to say it?", []string{"debug", "info", "warn", "error"}) {
		case "debug":
			c.Debug(text)
		case "info":
			c.Info(text)
		case "warn":
			c.Warn(text)
		case "error":
			c.Error(text)
		}
	}
}
