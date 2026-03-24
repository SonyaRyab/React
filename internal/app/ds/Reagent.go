package ds

type Reagent struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Name        string  `gorm:"type:varchar(25);not null" json:"name"`
	Formula     string  `gorm:"type:varchar(100)" json:"formula"`
	Temperature float64 `gorm:"type:decimal(6,2)" json:"temperature"`
	Img         string  `gorm:"type:varchar(100)" json:"img"`
	Video       string  `gorm:"type:varchar(100)" json:"video"`
	Description string  `gorm:"type:varchar(200)" json:"description"`
	IsDeleted   bool    `gorm:"column:is_deleted;default:false" json:"-"`
}
