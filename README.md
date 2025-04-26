# Hệ Quản Trị Cơ Sở Dữ Liệu CO3021 - HK242

Bài tập lớn - báo cáo Hệ Quản Trị CSDL
Đề tài : So sánh Postgres và MongoDB

Demo : https://he-quan-tri-csdl-co-3021.vercel.app/

## Cấu Trúc Thư Mục Source Code

Dự án được tổ chức với cấu trúc quan trọng như sau:

```plaintext
project-root/
├── BaoCao/                 # Chứa các file latex để làm báo cáo
│   ├── .......
│
├── Slide/                  # Chứa slide thuyết trình
│   ├── .......
|
├── Simple-E-commerce/      # Frontend and Backend code
│   ├── .......
│
├── Temlate/                # Template for ADMIN and CLIENT
│   ├── .......
│
├── Dockers/                # Chứa các file docker triển khai
│   ├── .......
│
├── Web/                    # Chứa các file làm web dự án
│   ├── .......
│
├── .gitignore             # File cấu hình bỏ qua khi commit
├── README.md              # Hướng dẫn sử dụng và deploy dự án
└── LICENSE                # Thông tin bản quyền dự án
```

## Hướng dẫn cài đặt

- Bước 1 :

  - Cài đặt môi trường NodeJS : https://nodejs.org/en/download
  - Cài đặt yarn : Gõ lệnh vào terminal trên máy `npm install --global yarn`

- Bước 2 :

  - Cài đặt docker : https://docs.docker.com/engine/install/

- Bước 3 :

  - Bật terminal : chạy lệnh `chmod +x setup.sh` và `./setup.sh` (Lệnh này dùng để tạo CSDL mongodb trên docker để sử dụng. Tk : admin, Password : admin123, đồng thời tạo dữ liệu mock và đánh index)
  - ***Lưu ý*** : có thể chạy hơi lâu để yên cho chạy đến khi thấy dòng ```Setup xong MongoDB``` hoặc ```Postgress Database setup completed.``` thì có thể tắt

- Bước 4 :

    - Bật terminal trỏ vào thư mục `Web` : Gõ lệnh `yarn` để cài đặt các thư viện cần thiết
    - Gõ lệnh ```yarn dev``` để chạy web


## Schema

### Products (5_000_000 Dữ liệu)

```javascript
{
  _id        : ObjectId(),   // ID tự động của MongoDB
  name       : String,       // Tên sản phẩm
  category   : String,       // Danh mục sản phẩm
  description: String,       // Mô tả chi tiết sản phẩm (có thể dùng cho text search)
  price      : Number,       // Giá sản phẩm
  stock      : Number,       // Số lượng tồn kho
  created_at : Date,         // Ngày tạo sản phẩm
}
```

Indexes gợi ý:

Tạo index trên productName và category để tối ưu tìm kiếm.
Nếu cần tìm kiếm theo mô tả, tạo Text Index:

```javascript
db.products.createIndex({ description: "text" });
```

### Users (1_000_000 Dữ liệu)

```javascript
{
  _id       : ObjectId(),
  username  : String,       // Họ và tên
  email     : String,       // Email (đặt unique index để tránh trùng lặp)
  password  : String,       // Mật khẩu đã được mã hóa
  address   : String,       // Địa chỉ
  phone     : String,       // Số điện thoại
  created_at: Date
}
```

Indexes gợi ý:

Tạo unique index trên email:

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
```

### Orders (1_000_000 Dữ liệu)

```javascript
{
  _id       : ObjectId(),
  userId    : ObjectId(),                                           // Tham chiếu đến Users._id
  orderItems: [                // Mảng các sản phẩm trong đơn hàng
    {
      productId  : ObjectId(),   // Tham chiếu đến Products._id
      productName: String,       // Lưu lại tên sản phẩm tại thời điểm đặt hàng (cho trường hợp giá, tên thay đổi sau này)
      quantity   : Number,       // Số lượng đặt mua
      price      : Number        // Giá sản phẩm tại thời điểm đặt hàng
    }
  ],
  totalPrice: Number,   // Tổng tiền của đơn hàng
  orderDate : Date,     // Ngày đặt hàng
  status    : String,   // Trạng thái đơn hàng (vd: pending, confirmed, shipped, delivered)
  created_at: Date,
}
```

Indexes gợi ý:

Tạo index trên userId và orderDate để tối ưu hóa truy vấn lịch sử đơn hàng:

```javascript
db.orders.createIndex({ userId: 1, orderDate: -1 });
```

## Danh sách chức năng

1.  Quản lý Danh mục Sản phẩm (Product Catalog Management)

    Mục đích:

        Tạo và lưu trữ danh mục sản phẩm với hàng ngàn đến hàng triệu bản ghi.

    Ứng dụng các tính năng:

        Indexing: Tạo index trên các trường như productName, category và price để tối ưu hóa truy vấn tìm kiếm.

2.  Đăng ký và Quản lý Người dùng (User Registration and Profile Management)

    Mục đích:

        Quản lý thông tin người dùng cho việc đặt hàng.

    Ứng dụng các tính năng:

        Indexing & Query Processing: Tạo index trên email, tìm kiếm người dùng nhanh chóng.

3.  Tìm kiếm Sản phẩm Nâng cao (Advanced Product Search)

    Mục đích:
    Cho phép người dùng tìm kiếm sản phẩm theo từ khóa, danh mục, khoảng giá…

    Ứng dụng các tính năng:

        Query Processing: Sử dụng Aggregation Pipeline và text search (có thể tạo Text Index cho mô tả sản phẩm) để xử lý truy vấn phức tạp.

4.  Đặt Hàng (Place an Order) với Giao dịch (Transaction)

    Mục đích:

        Khi người dùng đặt hàng, cần cập nhật số lượng tồn kho và lưu thông tin đơn hàng một cách nguyên tử.

    Ứng dụng các tính năng:

        Transaction: Sử dụng multi-document transaction đảm bảo cả hai thao tác (giảm stock và tạo đơn hàng) đều thành công hoặc rollback.

5.  Mô phỏng Đặt Hàng Cạnh tranh (Concurrent Order Placement)

    Mục đích:

        Minh họa trường hợp nhiều người dùng cùng đặt một sản phẩm có số lượng giới hạn.

    Ứng dụng các tính năng:

        Concurrency Control: Sử dụng các thao tác cập nhật nguyên tử (atomic update) và transaction để đảm bảo không xảy ra overselling.

6.  Quản lý Tồn kho (Inventory Management) với Cập nhật Nguyên tử

    Mục đích:

        Đảm bảo số lượng tồn kho được cập nhật chính xác trong mọi giao dịch.

    Ứng dụng các tính năng:

        Concurrency Control: Sử dụng các thao tác cập nhật nguyên tử như $inc để đảm bảo số liệu chính xác ngay cả khi có nhiều cập nhật đồng thời.

7.  Lịch sử Đơn hàng và Chi tiết (Order History and Details)

    Mục đích:

        Hiển thị lịch sử đơn hàng của người dùng, kết hợp thông tin sản phẩm và đơn hàng.

    Ứng dụng các tính năng:

        Query Processing: Sử dụng Aggregation với $lookup để join thông tin đơn hàng với sản phẩm.

8.  Báo cáo và Phân tích Bán hàng (Admin Reporting and Analytics)

    Mục đích:

        Cung cấp báo cáo về doanh số, sản phẩm bán chạy, và thống kê đơn hàng.

    Ứng dụng các tính năng:

        Query Processing: Sử dụng Aggregation Pipeline để tính toán tổng doanh thu, số đơn hàng theo thời gian và sắp xếp theo mức độ bán chạy.

9.  Sao lưu Dữ liệu (Data Backup)

    Mục đích:

        Đảm bảo dữ liệu của hệ thống có thể được sao lưu định kỳ để phòng ngừa mất mát.

    Ứng dụng các tính năng:

        Data Backup: Sử dụng công cụ mongodump để tạo bản sao lưu của database.

10. Phục hồi Dữ liệu (Data Recovery)

    Mục đích:

        Minh họa quá trình phục hồi dữ liệu từ bản sao lưu khi xảy ra sự cố.

    Ứng dụng các tính năng:

        Data Recovery: Sử dụng mongorestore để khôi phục dữ liệu từ file backup.

## Phân công

- Huỳnh Nga : 1,2 (Index)

- Đào Duy Tùng : 3, 6 (Query Processing)

- Tôn Trọng Tín : 4, 5 (Concurrency Control)

- Huỳnh Huynh Mân : 7,8 (Transaction)

- Vũ Trường Khoa : 9,10 (Data Backup, Data Recovery)

---

- Huỳnh Nga : Slide

- Vũ Trường Khoa : Latex

- Huỳnh Huynh Mân : Video

- Đào Duy Tùng : Cấu trúc báo cáo cơ bản, research cơ bản, recap các tuần, voting công nghệ, docker file, tạo dữ liệu vài triệu dữ liệu, ....

<!-- ## CSDL (MONGODB)

[Link download](https://drive.google.com/file/d/1snIQaEeqRXD5brtMfsVjvMzYh9KMg4Su/view?usp=sharing)

Chạy lệnh này để restore dữ liệu

```bash
mongorestore he-quan-tri-csdl-2025-02-23
``` -->

## Web

Template : https://nextadmin.co/

https://vercel.com/docs/cli

vercel build && vercel deploy
