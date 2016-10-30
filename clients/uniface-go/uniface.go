package uniface

type Client interface {
	Debug(text string) error
	Info(text string) error
	Warn(text string) error
	Error(text string) error

	Progress(token *string, total, complete float64, final bool) (string, error)
	MustProgress(token *string, total, complete float64, final bool) string

	Confirm(text string) (bool, error)
	Prompt(text string) (string, error)
	Password(text string) (string, error)
	Option(text string, options []string) (string, error)
	Options(text string, options []string) ([]string, error)

	MustConfirm(text string) bool
	MustPrompt(text string) string
	MustPassword(text string) string
	MustOption(text string, options []string) string
	MustOptions(text string, options []string) []string
}
