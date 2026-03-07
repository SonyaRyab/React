package ds

type Stock struct {
	ID            uint `gorm:"primaryKey"`
	Name          string
	PurchasePrice uint64
	SalePrice     uint64
	Count         uint64
	CompanyName   string
	INN           string
	Pic           string
}
