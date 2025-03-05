import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "Các chức năng chính (8)",
    items: [
      {
        title: "8. Báo cáo và Phân tích Bán hàng",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "eCommerce",
            url: "/",
          },
        ],
      },
      {
        title: "Sản phẩm (1,3,6)",
        icon: Icons.Table,
        items: [
          {
            title: "1. Quản lý Danh mục Sản phẩm",
            url: "/products/manager",
          },
          {
            title: "3. Tìm kiếm Sản phẩm Nâng cao",
            url: "/products/advanceFind",
          },
          {
            title: "6. Quản lý Tồn kho",
            url: "/products/manager2",
          },
        ],
      },

      {
        title: "2. Đăng ký và Quản lý Người dùng",
        url: "/user/manager",
        icon: Icons.Table,
        items: [

        ],
      },

      {
        title: "Đặt hàng (4,5)",
        icon: Icons.Table,
        items: [
          {
            title: "4. Đặt hàng",
            url: "/order/placeOrder",
          },
          {
            title: "5. Mô phỏng Đặt Hàng Cạnh tranh",
            url: "/order/advanceOrder",
          },
        ],
      },

      {
        title: "7. Lịch sử Đơn hàng và Chi tiết",
        url: "/order/manager",
        icon: Icons.Table,
        items: [
        ],
      },

      {
        title: "Dữ liệu (9,10)",
        icon: Icons.Table,
        items: [
          {
            title: "9. Sao lưu Dữ liệu",
            url: "/data/backup",
          },
          {
            title: "10. Phục hồi Dữ liệu",
            url: "/data/restore",
          },
        ],
      },
    ],
  },
  {
    label: "Tham khảo giao diện",
    items: [
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/forms/form-layout",
          },
        ],
      },
      {
        title: "Tables",
        url: "/tables",
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: "/tables",
          },
        ],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: "/charts/basic-chart",
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/ui-elements/buttons",
          },
        ],
      },
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [
          {
            title: "Sign In",
            url: "/auth/sign-in",
          },
        ],
      },
    ],
  },
];
