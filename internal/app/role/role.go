package role

type Role int

const (
	Researcher   Role = iota // 0
	Manager             // 1
	Admin               // 2
)