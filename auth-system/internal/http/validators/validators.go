package validators

import (
	"fmt"
	"reflect"
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// ValidateStruct validates a struct based on struct tags
func ValidateStruct(s interface{}) error {
	v := reflect.ValueOf(s)
	t := reflect.TypeOf(s)

	// Handle pointer to struct
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
		t = t.Elem()
	}

	if v.Kind() != reflect.Struct {
		return fmt.Errorf("expected struct, got %s", v.Kind())
	}

	var errors []ValidationError

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)
		tag := fieldType.Tag.Get("validate")

		if tag == "" {
			continue
		}

		fieldName := getFieldName(fieldType)
		rules := strings.Split(tag, ",")

		for _, rule := range rules {
			rule = strings.TrimSpace(rule)
			if err := validateField(field, fieldName, rule); err != nil {
				errors = append(errors, *err)
			}
		}
	}

	if len(errors) > 0 {
		return &ValidationErrors{Errors: errors}
	}

	return nil
}

// ValidationErrors represents multiple validation errors
type ValidationErrors struct {
	Errors []ValidationError `json:"errors"`
}

func (e ValidationErrors) Error() string {
	var messages []string
	for _, err := range e.Errors {
		messages = append(messages, err.Error())
	}
	return strings.Join(messages, "; ")
}

func validateField(field reflect.Value, fieldName, rule string) *ValidationError {
	switch {
	case rule == "required":
		return validateRequired(field, fieldName)
	case rule == "email":
		return validateEmail(field, fieldName)
	case strings.HasPrefix(rule, "min="):
		return validateMin(field, fieldName, rule)
	case strings.HasPrefix(rule, "max="):
		return validateMax(field, fieldName, rule)
	}
	return nil
}

func validateRequired(field reflect.Value, fieldName string) *ValidationError {
	switch field.Kind() {
	case reflect.String:
		if field.String() == "" {
			return &ValidationError{
				Field:   fieldName,
				Message: "is required",
			}
		}
	case reflect.Ptr:
		if field.IsNil() {
			return &ValidationError{
				Field:   fieldName,
				Message: "is required",
			}
		}
	case reflect.Slice, reflect.Array:
		if field.Len() == 0 {
			return &ValidationError{
				Field:   fieldName,
				Message: "is required",
			}
		}
	}
	return nil
}

func validateEmail(field reflect.Value, fieldName string) *ValidationError {
	if field.Kind() != reflect.String {
		return nil
	}

	email := field.String()
	if email == "" {
		return nil // Let required validation handle empty strings
	}

	if !emailRegex.MatchString(email) {
		return &ValidationError{
			Field:   fieldName,
			Message: "must be a valid email address",
		}
	}
	return nil
}

func validateMin(field reflect.Value, fieldName, rule string) *ValidationError {
	minStr := strings.TrimPrefix(rule, "min=")
	var min int
	fmt.Sscanf(minStr, "%d", &min)

	switch field.Kind() {
	case reflect.String:
		if len(field.String()) < min {
			return &ValidationError{
				Field:   fieldName,
				Message: fmt.Sprintf("must be at least %d characters long", min),
			}
		}
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		if int(field.Int()) < min {
			return &ValidationError{
				Field:   fieldName,
				Message: fmt.Sprintf("must be at least %d", min),
			}
		}
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		if int(field.Uint()) < min {
			return &ValidationError{
				Field:   fieldName,
				Message: fmt.Sprintf("must be at least %d", min),
			}
		}
	case reflect.Float32, reflect.Float64:
		if int(field.Float()) < min {
			return &ValidationError{
				Field:   fieldName,
				Message: fmt.Sprintf("must be at least %d", min),
			}
		}
	}
	return nil
}

func validateMax(field reflect.Value, fieldName, rule string) *ValidationError {
	maxStr := strings.TrimPrefix(rule, "max=")
	var max int
	fmt.Sscanf(maxStr, "%d", &max)

	switch field.Kind() {
	case reflect.String:
		if len(field.String()) > max {
			return &ValidationError{
				Field:   fieldName,
				Message: fmt.Sprintf("must be at most %d characters long", max),
			}
		}
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		if int(field.Int()) > max {
			return &ValidationError{
				Field:   fieldName,
				Message: fmt.Sprintf("must be at most %d", max),
			}
		}
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		if int(field.Uint()) > max {
			return &ValidationError{
				Field:   fieldName,
				Message: fmt.Sprintf("must be at most %d", max),
			}
		}
	case reflect.Float32, reflect.Float64:
		if int(field.Float()) > max {
			return &ValidationError{
				Field:   fieldName,
				Message: fmt.Sprintf("must be at most %d", max),
			}
		}
	}
	return nil
}

func getFieldName(field reflect.StructField) string {
	jsonTag := field.Tag.Get("json")
	if jsonTag != "" {
		parts := strings.Split(jsonTag, ",")
		if parts[0] != "" && parts[0] != "-" {
			return parts[0]
		}
	}
	return strings.ToLower(field.Name)
}