package handler

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"strconv"

	"lab3/internal/app/ds"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetMethanesAPI(ctx *gin.Context) {
	var methanes []ds.Methane
	var err error

	methanes, err = h.Repository.GetMethanes()

	if err != nil {
		if err.Error() != "массив пустой" {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
			return
		} else {
			methanes = []ds.Methane{}
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   methanes,
	})
}

func (h *Handler) GetMethaneByIdAPI(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.Atoi(strId)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	methane, err := h.Repository.GetMethane(id)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	// Т.к. мы получаем подробную информацию об акции, используем расширенный сериализатор
	fullMethane := ds.FullMethaneSerializer{Methane: methane}
	fullMethane.Admin = methane.Admin

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   fullMethane,
	})
}

func (h *Handler) AddMethaneAPI(ctx *gin.Context) {
	// Прочитаем в ОЗУ 2 Мб данных формы
	// Этого должно хватить для текстовых полей и несложных изображений (логотипов)

	err := ctx.Request.ParseMultipartForm(2 << 20)

	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, err)
		return
	}

	// Пытаемся получить файл из формы
	// header имеет тип *multipart.FileHeader и является указателем
	// на метаданные файла
	header, err := ctx.FormFile("pic")

	// Флаг, устанавливаемый, когда поле pic сопоставлено с неким файлом
	fileFound := false

	if err != nil {
		// Файла в запросе нет - допустимая ситуация
		if err != http.ErrMissingFile {
			h.errorHandler(ctx, http.StatusBadRequest, err)
			return
		}
	} else {
		fileFound = true
	}

	if fileFound {
		code, err := validateFileUpload(header)

		if err != nil {
			h.errorHandler(ctx, code, err)
			return
		}
	}

	methane := ds.Methane{
		Name:   ctx.Request.FormValue("name"),
		Status: ctx.Request.FormValue("status"),
		//INN:     ctx.Request.FormValue("inn"),
		AdminID: 1, // временный хардкод
	}

	if ctx.Request.FormValue("temperature") != "" {
		methane.Temperature, err = strconv.ParseUint(ctx.Request.FormValue("temperature"), 10, 64)
		if err != nil {
			h.errorHandler(ctx, http.StatusBadRequest, err)
			return
		}
	}

	//if ctx.Request.FormValue("sale_price") != "" {
	//	methane.SalePrice, err = strconv.ParseUint(ctx.Request.FormValue("sale_price"), 10, 64)
	//	if err != nil {
	//		h.errorHandler(ctx, http.StatusBadRequest, err)
	//		return
	//	}
	//}

	err = h.Repository.AddMethane(&methane)

	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	if fileFound {
		if err = h.Repository.AddOrReplaceMethaneImage(methane.ID, header); err != nil {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
			return
		}

		updatedMethane, err := h.Repository.GetMethane(int(methane.ID))
		if err != nil {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
			return
		}

		ctx.JSON(http.StatusCreated, gin.H{
			"status":  "success",
			"data":    updatedMethane,
			"message": "метан успешно добавлен",
		})
	} else {
		ctx.JSON(http.StatusCreated, gin.H{
			"status":  "success",
			"data":    methane,
			"message": "метан успешно добавлен",
		})
	}
}

func (h *Handler) ModifyMethaneAPI(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.Atoi(strId)

	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	if err := ctx.Request.ParseMultipartForm(2 << 20); err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, err)
		return
	}

	// Загружаем старые данные, а поля на новые значения будем менять по ходу
	// Потенциально неоптимально, но так мы точно не опустошим лишние поля
	methane, err := h.Repository.GetMethane(int(id))
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	if ctx.Request.PostForm.Has("name") {
		methane.Name = ctx.Request.FormValue("name")
	}
	if ctx.Request.PostForm.Has("status") {
		methane.Status = ctx.Request.FormValue("status")
	}
	if ctx.Request.PostForm.Has("inn") {
		methane.MethaneYield = ctx.Request.FormValue("methane_yield")
	}

	if ctx.Request.FormValue("temperature") != "" {
		methane.Temperature, err = strconv.ParseUint(ctx.Request.FormValue("temperature"), 10, 64)
		if err != nil {
			h.errorHandler(ctx, http.StatusBadRequest, err)
			return
		}
	}

	//if ctx.Request.FormValue("sale_price") != "" {
	//	methane.SalePrice, err = strconv.ParseUint(ctx.Request.FormValue("sale_price"), 10, 64)
	//	if err != nil {
	//		h.errorHandler(ctx, http.StatusBadRequest, err)
	//		return
	//	}
	//}

	header, err := ctx.FormFile("pic")

	var fileFound bool

	if err != nil {
		// Файла в запросе нет - допустимая ситуация
		if err != http.ErrMissingFile {
			h.errorHandler(ctx, http.StatusBadRequest, err)
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "File error: " + err.Error()})
			return
		}
	} else {
		fileFound = true
	}

	if fileFound {
		code, err := validateFileUpload(header)

		if err != nil {
			h.errorHandler(ctx, code, err)
			return
		}
	}

	if err = h.Repository.ModifyMethane(uint(id), &methane); err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	if fileFound {
		if err = h.Repository.AddOrReplaceMethaneImage(methane.ID, header); err != nil {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
			return
		}
	}

	updatedMethane, err := h.Repository.GetMethane(int(id))
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"data":    updatedMethane,
		"message": "запись успешно обновлена",
	})
}

func (h *Handler) DeleteMethaneAPI(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.Atoi(strId)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	err = h.Repository.DeleteMethane(uint(id))
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "команда успешно удалена",
	})
}

// Вспомогательная функция, определяющая по заголовку
// Content-File файла, является ли тот изображением
func isImage(contentType string) bool {
	imageTypes := []string{
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
	}

	for _, t := range imageTypes {
		if contentType == t {
			return true
		}
	}
	return false
}

// Вспомогательная функция, выполняющая валидацию загруженного файла
func validateFileUpload(header *multipart.FileHeader) (int, error) {
	// Окрываем чтение файлового потока
	file, err := header.Open()

	if err != nil {
		return http.StatusBadRequest, fmt.Errorf("не удалось получить файл")
	}

	defer file.Close()

	// Знакомая логика определения типа содержимого...

	buffer := make([]byte, 512)
	_, err = file.Read(buffer)

	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("не удалось прочитать файл")
	}

	contentType := http.DetectContentType(buffer)

	if !isImage(contentType) {
		return http.StatusBadRequest, fmt.Errorf("файл должен быть изображением")
	}

	// Позиция чтения файла возвращается к исходной
	_, err = file.Seek(0, 0)
	if err != nil {
		return http.StatusInternalServerError, fmt.Errorf("ошибка при обработке файла")
	}

	return 0, nil
}
