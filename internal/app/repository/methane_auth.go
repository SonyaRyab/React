package repository

import (
	"lab4/internal/app/ds"
	"lab4/internal/app/role"
)

func (r *Repository) GetMethanesForUser(userID uint, userRole role.Role) ([]ds.Methane, error) {
	var items []ds.Methane

	query := r.db.Preload("Admin").Preload("Moderator")

	if userRole == role.Manager || userRole == role.Admin {
		err := query.Find(&items).Error
		return items, err
	}

	err := query.Where("admin_id = ?", userID).Find(&items).Error
	return items, err
}
