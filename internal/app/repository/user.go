package repository

import "lab3/internal/app/ds"

func (r *Repository) GetUserMethanes(id int) (*ds.UserMethanes, error) {

	var userMethanes ds.UserMethanes

	err := r.db.Where("id = ?", id).First(&userMethanes.User).Error

	if err != nil {
		return nil, err
	}

	err = r.db.Find(&userMethanes.Methanes).Error

	if err != nil {
		return nil, err
	}

	return &userMethanes, nil
}
