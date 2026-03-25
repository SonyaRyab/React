package ds

import (
	"lab4/internal/app/role"
	"github.com/google/uuid"
)

type User struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Username    string `gorm:"type:varchar(50);not null" json:"username"`
	Email       string `gorm:"type:varchar(25);not null" json:"email"`
	Password    string `gorm:"type:string;not null" json:"-"`
	UUID uuid.UUID `gorm:"type:uuid"`
	Login    string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"login"`
	Role role.Role `sql:"type:string;"`
	PassHash string    `gorm:"type:varchar(255);not null" json:"-"`
	IsProfessor bool   `gorm:"column:is_professor;not null;default:false" json:"is_professor"`
}

type UserMethanes struct {
	User     User
	Methanes []Methane `json:"methanes"`
}
