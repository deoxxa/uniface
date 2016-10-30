package uniface

import (
	"net/url"
	"os"
)

func NewClient() Client {
	if s := os.Getenv("UNIFACE"); s != "" {
		if u, err := url.Parse(s); err != nil {
			switch u.Scheme {
			case "unix", "file":
				if c, err := DialJSONRPC("unix", u.Path); err == nil {
					return c
				}
			}
		}

		if c, err := DialJSONRPC("unix", s); err == nil {
			return c
		}
	} else {
		if c, err := DialJSONRPC("unix", "/tmp/.unifaced.sock"); err == nil {
			return c
		}
	}

	return NewTextClient(os.Stdin, os.Stdout)
}
