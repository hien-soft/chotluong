package middleware

import (
	"context"
	"net/http"
	"slices"
	"strings"

	"chotluong-backend/internal/auth"
)

type contextKey string

const UserContextKey = contextKey("user_claims")

// AuthMiddleware kiểm tra JWT token và lưu thông tin người dùng vào context
func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error":"Thiếu Authorization header"}`, http.StatusUnauthorized)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, `{"error":"Định dạng Authorization phải là Bearer <token>"}`, http.StatusUnauthorized)
				return
			}

			claims, err := auth.ValidateToken(jwtSecret, parts[1])
			if err != nil {
				http.Error(w, `{"error":"Token không hợp lệ hoặc đã hết hạn"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserClaims lấy thông tin user từ request context
func GetUserClaims(r *http.Request) *auth.Claims {
	if val := r.Context().Value(UserContextKey); val != nil {
		if claims, ok := val.(*auth.Claims); ok {
			return claims
		}
	}
	return nil
}

// RequireRoles kiểm tra người dùng có ít nhất một trong các vai trò yêu cầu
func RequireRoles(requiredRoles ...string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			claims := GetUserClaims(r)
			if claims == nil {
				http.Error(w, `{"error":"Chưa xác thực người dùng"}`, http.StatusUnauthorized)
				return
			}

			hasRole := false
			for _, role := range claims.Roles {
				if slices.Contains(requiredRoles, role) {
					hasRole = true
					break
				}
			}

			if !hasRole {
				http.Error(w, `{"error":"Bạn không có quyền truy cập chức năng này"}`, http.StatusForbidden)
				return
			}

			next(w, r)
		}
	}
}

