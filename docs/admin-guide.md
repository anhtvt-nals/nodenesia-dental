# Hướng dẫn vận hành Admin

## Đăng nhập và quyền hạn

Owner quản lý tài khoản, cấu hình phòng khám và toàn bộ dữ liệu. Staff vận hành lịch hẹn, bác sĩ, CMS và báo cáo nhưng không tạo hoặc vô hiệu hoá tài khoản. Không dùng chung tài khoản; owner tạo một tài khoản riêng cho từng nhân sự.

## Lịch hẹn

Tạo lịch thủ công khi bệnh nhân gọi điện. Trước khi xác nhận, kiểm tra bác sĩ, dịch vụ và slot. Dùng trạng thái `confirmed`, `completed` hoặc `no_show`; chỉ huỷ khi lịch thực sự không còn hiệu lực. Trang notification log cho phép xếp lại một thông báo bị lỗi mà không ghi đè lịch sử cũ.

## Lịch bác sĩ

Sửa giờ làm việc theo từng bác sĩ; các ca chồng lấn sẽ bị từ chối. Dùng Time-off cho bác sĩ hoặc toàn clinic khi nghỉ lễ, rồi gỡ Time-off khi lịch thay đổi. Slot công khai sẽ cập nhật theo lịch mới.

## Nội dung công khai

FAQ, khuyến mãi, đánh giá, Gallery và bài viết đều được tạo ở trạng thái nháp trước. Chỉ publish sau khi đã kiểm tra trên trang Public. Gallery bắt buộc có consent bằng văn bản trước khi publish. Content Blocks dùng JSON object; `hero/id` hỗ trợ `heading` và `address`.

## Đầu ngày và cuối ngày

Đầu ngày kiểm tra lịch hẹn, Time-off và notification errors. Cuối ngày cập nhật trạng thái completed/no-show, xem báo cáo và đảm bảo backup theo lịch đã chạy. Báo ngay owner nếu có sai lệch dữ liệu, lỗi gửi WhatsApp hoặc đăng nhập bất thường.
