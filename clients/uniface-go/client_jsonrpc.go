package uniface

import (
	"net/rpc"
	"net/rpc/jsonrpc"
)

type jsonRPCClient struct {
	c *rpc.Client
}

func (c jsonRPCClient) Debug(text string) error {
	var res bool
	if err := c.c.Call("Debug", struct {
		Text string `json:"text"`
	}{text}, &res); err != nil {
		return err
	}

	return nil
}

func (c jsonRPCClient) Info(text string) error {
	var res bool
	if err := c.c.Call("Info", struct {
		Text string `json:"text"`
	}{text}, &res); err != nil {
		return err
	}

	return nil
}

func (c jsonRPCClient) Warn(text string) error {
	var res bool
	if err := c.c.Call("Warn", struct {
		Text string `json:"text"`
	}{text}, &res); err != nil {
		return err
	}

	return nil
}

func (c jsonRPCClient) Error(text string) error {
	var res bool
	if err := c.c.Call("Error", struct {
		Text string `json:"text"`
	}{text}, &res); err != nil {
		return err
	}

	return nil
}

func (c jsonRPCClient) MustConfirm(text string) bool {
	if r, err := c.Confirm(text); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c jsonRPCClient) Confirm(text string) (bool, error) {
	var res bool
	if err := c.c.Call("Confirm", struct {
		Text string `json:"text"`
	}{text}, &res); err != nil {
		return res, err
	}

	return res, nil
}

func (c jsonRPCClient) MustPrompt(text string) string {
	if r, err := c.Prompt(text); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c jsonRPCClient) Prompt(text string) (string, error) {
	var res string
	if err := c.c.Call("Prompt", struct {
		Text string `json:"text"`
	}{text}, &res); err != nil {
		return res, err
	}

	return res, nil
}

func (c jsonRPCClient) MustPassword(text string) string {
	if r, err := c.Password(text); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c jsonRPCClient) Password(text string) (string, error) {
	var res string
	if err := c.c.Call("Password", struct {
		Text string `json:"text"`
	}{text}, &res); err != nil {
		return res, err
	}

	return res, nil
}

func (c jsonRPCClient) MustOption(text string, options []string) string {
	if r, err := c.Option(text, options); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c jsonRPCClient) Option(text string, options []string) (string, error) {
	var res string
	if err := c.c.Call("Option", struct {
		Text    string   `json:"text"`
		Options []string `json:"options"`
	}{text, options}, &res); err != nil {
		return res, err
	}

	return res, nil
}

func (c jsonRPCClient) MustOptions(text string, options []string) []string {
	if r, err := c.Options(text, options); err != nil {
		panic(err)
	} else {
		return r
	}
}

func (c jsonRPCClient) Options(text string, options []string) ([]string, error) {
	var res []string
	if err := c.c.Call("Options", struct {
		Text    string   `json:"text"`
		Options []string `json:"options"`
	}{text, options}, &res); err != nil {
		return res, err
	}

	return res, nil
}

func (c jsonRPCClient) Progress(token *string, total, complete float64, final bool) (string, error) {
	var res string
	if err := c.c.Call("Progress", struct {
		Token    *string `json:"token"`
		Total    float64 `json:"total"`
		Complete float64 `json:"complete"`
		Final    bool    `json:"final"`
	}{token, total, complete, final}, &res); err != nil {
		return res, err
	}

	return res, nil
}

func (c jsonRPCClient) MustProgress(token *string, total, complete float64, final bool) string {
	if r, err := c.Progress(token, total, complete, final); err != nil {
		panic(err)
	} else {
		return r
	}
}

func DialJSONRPC(net, addr string) (Client, error) {
	j, err := jsonrpc.Dial(net, addr)
	if err != nil {
		return nil, err
	}

	return &jsonRPCClient{c: j}, nil
}
