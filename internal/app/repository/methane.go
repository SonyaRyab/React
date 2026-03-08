package repository

import (
	"context"
	"fmt"

	"github.com/minio/minio-go/v7"

	"lab3/internal/app/ds"
	"mime/multipart"
	"net/http"
	"strconv"
)

func (r *Repository) GetMethanes() ([]ds.Methane, error) {
	var methanes []ds.Methane
	err := r.db.Find(&methanes).Error
	// обязательно проверяем ошибки, и если они появились - передаем выше, то есть хендлеру
	if err != nil {
		return nil, err
	}
	if len(methanes) == 0 {
		return nil, fmt.Errorf("массив пустой")
	}

	return methanes, nil
}

func (r *Repository) AddMethane(methane *ds.Methane) error {
	err := r.db.Model(&ds.Methane{}).Create(methane).Error
	if err != nil {
		return fmt.Errorf("ошибка при добавлении акции: %w", err)
	}

	return nil
}

func (r *Repository) GetMethane(id int) (ds.Methane, error) {
	methane := ds.Methane{}
	err := r.db.Preload("Creator").Where("id = ?", id).First(&methane).Error
	if err != nil {
		return ds.Methane{}, err
	}
	return methane, nil
}

func (r *Repository) DeleteMethane(methaneID uint) error {
	// Обратите внимание: жёсткое удаление, не логическое
	err := r.db.Delete(&ds.Methane{}, methaneID).Error
	if err != nil {
		return fmt.Errorf("ошибка при удалении команды с id %d: %w", methaneID, err)
	}

	return nil
}

func (r *Repository) ModifyMethane(id uint, methane *ds.Methane) error {

	var old_methane ds.Methane

	err := r.db.Model(&ds.Methane{}).Where("id = ?", id).First(&old_methane).Error

	if err != nil {
		return fmt.Errorf("не удалось найти команду с id %d: %w", id, err)
	}

	// Попытки изменения ID акции нужно предотвращать
	// Создаем структуру для обновления без UUID
	updateData := map[string]interface{}{
		"name":        methane.Name,
		"temperature": methane.Temperature,
		"status":      methane.Status,
	}

	err = r.db.Model(&ds.Methane{}).Where("id = ?", id).Updates(&updateData).Error

	if err != nil {
		return fmt.Errorf("ошибка при обновлении акции с id %d: %w", id, err)
	}

	return nil
}

func (r *Repository) AddOrReplaceMethaneImage(methaneID uint, header *multipart.FileHeader) error {
	// Название будущего файла - <номер акции>.png

	filename := strconv.FormatUint(uint64(methaneID), 10)

	// Расширение .png будет даже у картинок, исходно его не имевших.
	// Это не совсем хорошо, но отображаться всё будет.

	// Открываем файл
	file, err := header.Open()
	if err != nil {
		return fmt.Errorf("ошибка открытия файла: %w", err)
	}
	// Как бы мы ни вышли из этой функции, файл обязательно будет закрыт
	defer file.Close()

	// header уже содержит заголовок с типом файла, но для пущей уверенности
	// мы получим Content-Type на базе реального содержимого файла

	// Тип полученного файла хранится в его первых 512 байтах
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)

	if err != nil {
		return fmt.Errorf("ошибка чтения файла: %w", err)
	}

	// Определяем тип файла по его содержимому
	contentType := http.DetectContentType(buffer)

	// Позиция чтения файла возвращается к исходной
	_, err = file.Seek(0, 0)
	if err != nil {
		return fmt.Errorf("ошибка перемещения по файловому потоку: %w", err)
	}

	ctx := context.Background()

	_, err = r.minio.PutObject(
		ctx,
		r.minio_bucket_name,
		filename,
		file,
		header.Size,
		minio.PutObjectOptions{
			ContentType: contentType,
		})

	if err != nil {
		return fmt.Errorf("не удалось добавить объект в хранилище minio: %w", err)
	}

	// Эндпоинт здесь должен совпадать с эндпоинтом MinIO в конфигурации
	err = r.db.Model(&ds.Methane{}).Where("id = ?", methaneID).UpdateColumn("pic", "http://127.0.0.1:9000/"+r.minio_bucket_name+"/"+filename).Error
	if err != nil {
		// Если не удалось сохранить в БД, удаляем из MinIO
		r.minio.RemoveObject(ctx, r.minio_bucket_name, filename, minio.RemoveObjectOptions{})
		return fmt.Errorf("ошибка сохранения пути к изображению: %w", err)
	}

	return nil
}
