package repository

import (
	"lab4/internal/app/ds"
	"lab4/internal/app/role"
)

func (r *Repository) GetMethanesForUser(userID uint, userRole role.Role) ([]ds.Methane, error) {
	var items []ds.Methane

	query := r.db.Preload("Professor").Preload("Researcher")

	switch userRole {
    case role.Researcher:
        err := query.Where("researcher_id = ?", userID).Find(&items).Error
        return items, err
    case role.Professor:
        err := query.Find(&items).Error
        return items, err
    default:
        return items, nil
    }
}
