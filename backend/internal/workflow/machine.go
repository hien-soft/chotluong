package workflow

import (
	"errors"
	"fmt"
	"slices"

	"chotluong-backend/internal/models"
)

// TransitionRule định nghĩa quy tắc chuyển trạng thái
type TransitionRule struct {
	FromStatus    string
	Action        string
	ToStatus      string
	AllowedRoles  []string
	RequireReason bool
}

// Danh sách các bước chuyển trạng thái hợp lệ (dựa trên tài liệu AGENTS.md / CLAUDE.md)
var TransitionRules = []TransitionRule{
	// 1. Phóng viên gửi bài & rút bài
	{
		FromStatus:    models.StatusDraft,
		Action:        models.ActionSubmit,
		ToStatus:      models.StatusPendingL1,
		AllowedRoles:  []string{models.RoleReporter, models.RoleEditorL1, models.RoleEditorL2, models.RoleAdmin},
		RequireReason: false,
	},
	{
		FromStatus:    models.StatusPendingL1,
		Action:        models.ActionWithdraw,
		ToStatus:      models.StatusDraft,
		AllowedRoles:  []string{models.RoleReporter, models.RoleAdmin},
		RequireReason: false,
	},
	{
		FromStatus:    models.StatusReturned,
		Action:        models.ActionResubmit,
		ToStatus:      models.StatusPendingL1,
		AllowedRoles:  []string{models.RoleReporter, models.RoleEditorL1, models.RoleAdmin},
		RequireReason: false,
	},

	// 2. Biên tập viên Cấp 1 (L1) xử lý
	{
		FromStatus:    models.StatusPendingL1,
		Action:        models.ActionClaimL1,
		ToStatus:      models.StatusInReviewL1,
		AllowedRoles:  []string{models.RoleEditorL1, models.RoleAdmin},
		RequireReason: false,
	},
	{
		FromStatus:    models.StatusInReviewL1,
		Action:        models.ActionReleaseL1,
		ToStatus:      models.StatusPendingL1,
		AllowedRoles:  []string{models.RoleEditorL1, models.RoleAdmin},
		RequireReason: false,
	},
	{
		FromStatus:    models.StatusInReviewL1,
		Action:        models.ActionApproveL1,
		ToStatus:      models.StatusPendingL2,
		AllowedRoles:  []string{models.RoleEditorL1, models.RoleAdmin},
		RequireReason: false,
	},
	{
		FromStatus:    models.StatusInReviewL1,
		Action:        models.ActionReturnL1,
		ToStatus:      models.StatusReturned,
		AllowedRoles:  []string{models.RoleEditorL1, models.RoleAdmin},
		RequireReason: true,
	},
	{
		FromStatus:    models.StatusInReviewL1,
		Action:        models.ActionRejectL1,
		ToStatus:      models.StatusRejected,
		AllowedRoles:  []string{models.RoleEditorL1, models.RoleAdmin},
		RequireReason: true,
	},

	// 3. Thư ký tòa soạn / TBT Cấp 2 (L2) xử lý
	{
		FromStatus:    models.StatusPendingL2,
		Action:        models.ActionClaimL2,
		ToStatus:      models.StatusInReviewL2,
		AllowedRoles:  []string{models.RoleEditorL2, models.RoleAdmin},
		RequireReason: false,
	},
	{
		FromStatus:    models.StatusInReviewL2,
		Action:        models.ActionReleaseL2,
		ToStatus:      models.StatusPendingL2,
		AllowedRoles:  []string{models.RoleEditorL2, models.RoleAdmin},
		RequireReason: false,
	},
	{
		FromStatus:    models.StatusInReviewL2,
		Action:        models.ActionPublish,
		ToStatus:      models.StatusPublished,
		AllowedRoles:  []string{models.RoleEditorL2, models.RoleAdmin},
		RequireReason: false,
	},
	{
		FromStatus:    models.StatusInReviewL2,
		Action:        models.ActionReturnL2,
		ToStatus:      models.StatusReturned,
		AllowedRoles:  []string{models.RoleEditorL2, models.RoleAdmin},
		RequireReason: true,
	},
	{
		FromStatus:    models.StatusInReviewL2,
		Action:        models.ActionSendBackL1,
		ToStatus:      models.StatusPendingL1,
		AllowedRoles:  []string{models.RoleEditorL2, models.RoleAdmin},
		RequireReason: true,
	},
	{
		FromStatus:    models.StatusInReviewL2,
		Action:        models.ActionRejectL2,
		ToStatus:      models.StatusRejected,
		AllowedRoles:  []string{models.RoleEditorL2, models.RoleAdmin},
		RequireReason: true,
	},

	// 4. Gỡ bài viết đã xuất bản
	{
		FromStatus:    models.StatusPublished,
		Action:        models.ActionUnpublish,
		ToStatus:      models.StatusUnpublished,
		AllowedRoles:  []string{models.RoleEditorL2, models.RoleAdmin},
		RequireReason: true,
	},
}

// ValidateTransition kiểm tra tính hợp lệ của việc chuyển trạng thái
func ValidateTransition(currentStatus, action string, userRoles []string, isAuthor bool, isHolder bool, isL1Reviewer bool, reason string) (*TransitionRule, error) {
	var matchedRule *TransitionRule
	for _, rule := range TransitionRules {
		if rule.FromStatus == currentStatus && rule.Action == action {
			matchedRule = &rule
			break
		}
	}

	if matchedRule == nil {
		return nil, fmt.Errorf("hành động '%s' không hợp lệ từ trạng thái '%s'", action, currentStatus)
	}

	// 1. Kiểm tra vai trò
	hasRole := false
	for _, role := range userRoles {
		if slices.Contains(matchedRule.AllowedRoles, role) {
			hasRole = true
			break
		}
	}
	if !hasRole {
		return nil, fmt.Errorf("bạn không có vai trò phù hợp để thực hiện hành động '%s'", action)
	}

	// 2. Kiểm tra quyền tác giả
	if (action == models.ActionSubmit || action == models.ActionWithdraw || action == models.ActionResubmit) && !slices.Contains(userRoles, models.RoleAdmin) {
		if !isAuthor {
			return nil, errors.New("chỉ tác giả bài viết mới có quyền gửi hoặc rút bài")
		}
	}

	// 3. Kiểm tra người đang giữ bài (holder lock)
	if (currentStatus == models.StatusInReviewL1 || currentStatus == models.StatusInReviewL2) &&
		(action != models.ActionClaimL1 && action != models.ActionClaimL2) &&
		!slices.Contains(userRoles, models.RoleAdmin) {
		if !isHolder {
			return nil, errors.New("bài viết đang được xử lý bởi biên tập viên khác")
		}
	}

	// 4. Tránh tự duyệt cấp 2: Người đã duyệt cấp 1 không được tự duyệt cấp 2 (trừ khi là Admin)
	if action == models.ActionPublish && isL1Reviewer && !slices.Contains(userRoles, models.RoleAdmin) {
		return nil, errors.New("người đã duyệt cấp 1 không được phép phê duyệt xuất bản cấp 2 cho cùng một bài viết")
	}

	// 5. Kiểm tra lý do bắt buộc
	if matchedRule.RequireReason && (reason == "" || len(reason) < 3) {
		return nil, fmt.Errorf("hành động '%s' bắt buộc phải cung cấp lý do chi tiết", action)
	}

	return matchedRule, nil
}

