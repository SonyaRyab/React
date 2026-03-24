// заявки
package ds

import (
	"time"
)

type Methane struct {
	ID           uint             `gorm:"primaryKey" json:"id"`
	Name         string           `gorm:"type:varchar(100);not null" json:"name"`
	Status       string           `gorm:"type:varchar(20)" json:"status"`
	DateCreate   time.Time        `json:"date_create"`
	DateForm     *time.Time        `gorm:"default:null" json:"date_update"`
	DateFinish   *time.Time        `gorm:"default:null" json:"date_finish"`
	ResearcherID uint             `gorm:"not null" json:"-"`
	ProfessorID  *uint            `json:"-"`
	Researcher   User             `gorm:"foreignKey:ResearcherID" json:"researcher"`
	Professor    *User            `gorm:"foreignKey:ProfessorID" json:"professor,omitempty"`
	Reagents     []MethaneReagent `gorm:"foreignKey:MethaneID" json:"reagents,omitempty"`
}

// Сериализатор для списка (без деталей)
type MethaneListSerializer struct {
	ID           uint      `json:"id"`
	Name         string    `json:"name"`
	Status       string    `json:"status"`
	DateCreate   time.Time `json:"date_create"`
	DateForm     *time.Time `json:"date_form"`
	ReagentCount int64     `json:"reagent_count"`
}

// Сериализатор для детального просмотра
type FullMethaneSerializer struct {
	Methane
	ResearcherName string `json:"researcher_name"`
	ProfessorName  string `json:"professor_name,omitempty"`
}
