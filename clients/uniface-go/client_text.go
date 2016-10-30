package uniface

import (
	"bufio"
	"fmt"
	"io"
	"strings"

	"github.com/Sirupsen/logrus"
)

type textClient struct {
	wr io.Writer
	rd io.Reader
	l  *logrus.Logger
	br *bufio.Reader
}

func NewTextClient(wr io.Writer, rd io.Reader) Client {
	l := logrus.New()
	l.Out = wr
	return &textClient{wr: wr, rd: rd, l: l, br: bufio.NewReader(rd)}
}

func (c textClient) Debug(text string) error {
	c.l.Debug(text)
	return nil
}

func (c textClient) Info(text string) error {
	c.l.Info(text)
	return nil
}

func (c textClient) Warn(text string) error {
	c.l.Warn(text)
	return nil
}

func (c textClient) Error(text string) error {
	c.l.Error(text)
	return nil
}

func (c textClient) MustConfirm(text string) bool {
	if r, err := c.Confirm(text); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c textClient) Confirm(text string) (bool, error) {
	fmt.Fprintln(c.wr, text)
	fmt.Fprintf(c.wr, "[y/n] (default \"y\") ")
	l, err := c.br.ReadString('\n')
	if err != nil {
		return false, err
	}

	l = strings.TrimSpace(l)

	switch strings.ToLower(l) {
	case "":
		return true, nil
	case "y":
		return true, nil
	case "n":
		return false, nil
	default:
		return false, fmt.Errorf("invalid answer %q", l)
	}
}

func (c textClient) MustPrompt(text string) string {
	if r, err := c.Prompt(text); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c textClient) Prompt(text string) (string, error) {
	fmt.Fprintln(c.wr, text)
	fmt.Fprintf(c.wr, "> ")
	l, err := c.br.ReadString('\n')
	return strings.TrimSpace(l), err
}

func (c textClient) MustPassword(text string) string {
	if r, err := c.Password(text); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c textClient) Password(text string) (string, error) {
	fmt.Fprintln(c.wr, text)
	fmt.Fprintf(c.wr, "> ")
	l, err := c.br.ReadString('\n')
	return strings.TrimSpace(l), err
}

func (c textClient) MustOption(text string, options []string) string {
	if r, err := c.Option(text, options); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c textClient) Option(text string, options []string) (string, error) {
	fmt.Fprintln(c.wr, text)
	fmt.Fprintf(c.wr, "available options are: [%s]\n", strings.Join(options, ", "))
	fmt.Fprint(c.wr, "> ")
	l, err := c.br.ReadString('\n')
	if err != nil {
		return "", err
	}

	l = strings.TrimSpace(l)

	for _, option := range options {
		if l == option {
			return option, nil
		}
	}

	return "", fmt.Errorf("invalid answer %q", l)
}

func (c textClient) MustOptions(text string, options []string) []string {
	if r, err := c.Options(text, options); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c textClient) Options(text string, options []string) ([]string, error) {
	choices := make(map[string]bool)

	fmt.Fprintln(c.wr, text)
	fmt.Fprintf(c.wr, "available options are: [%s]\n", strings.Join(options, ", "))
	for i := 0; i < 3; i++ {
		fmt.Fprint(c.wr, "> ")
		l, err := c.br.ReadString('\n')
		if err != nil {
			return nil, err
		}

		l = strings.TrimSpace(l)

		if l == "" {
			break
		}

		for _, option := range options {
			if l == option {
				choices[l] = true
			}
		}

		return nil, fmt.Errorf("invalid answer")
	}

	var r []string
	for k := range choices {
		r = append(r, k)
	}

	return r, nil
}

func (c textClient) Progress(token *string, total, complete float64, final bool) (string, error) {
	return "", nil
}

func (c textClient) MustProgress(token *string, total, complete float64, final bool) string {
	if r, err := c.Progress(token, total, complete, final); err != nil {
		panic(err)
	} else {
		return r
	}
}
