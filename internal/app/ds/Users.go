package ds

import (
	"lab4/internal/app/role"
	"github.com/google/uuid"
)

type User struct {
	ID   uint      `gorm:"primaryKey" json:"id"`
	UUID uuid.UUID `gorm:"type:uuid"`
	Login    string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"login"`
	Name string    `json:"name"`
	Role role.Role `sql:"type:string;"`
	PassHash string    `gorm:"type:varchar(255);not null" json:"-"`
}

type UserMethanes struct {
	User     User
	Methanes []Methane `json:"methanes"`
}
