package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   string   `json:"user_id"`
	Email    string   `json:"email"`
	FullName string   `json:"full_name"`
	Roles    []string `json:"roles"`
	jwt.RegisteredClaims
}

// GenerateToken tạo JWT token có hạn 24 giờ
func GenerateToken(secret string, userID, email, fullName string, roles []string) (string, error) {
	claims := Claims{
		UserID:   userID,
		Email:    email,
		FullName: fullName,
		Roles:    roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "chotluong.vn",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateToken kiểm tra tính hợp lệ của token
func ValidateToken(secret, tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("thuật toán ký token không hợp lệ")
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("token không hợp lệ hoặc đã hết hạn")
}

