import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Báo cáo và Phân tích Bán hàng",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "eCommerce",
            url: "/",
          },
        ],
      },
      {
        title: "Sản phẩm",
        icon: Icons.Table,
        items: [
          {
            title: "Quản lý Danh mục Sản phẩm",
            url: "/products/manager",
          },
          {
            title: "Tìm kiếm Sản phẩm Nâng cao",
            url: "/products/advanceFind",
          },
          {
            title: "Quản lý Tồn kho",
            url: "/products/manager2",
          },
        ],
      },

      {
        title: "Người dùng",
        icon: Icons.Table,
        items: [
          {
            title: "Quản lý Người dùng",
            url: "/user/manager",
          },
          {
            title: "Đăng ký người dùng",
            url: "/user/register",
          },
        ],
      },

      {
        title: "Đặt hàng",
        icon: Icons.Table,
        items: [
          {
            title: "Đặt hàng",
            url: "/order/placeOrder",
          },
          {
            title: "Mô phỏng Đặt Hàng Cạnh tranh",
            url: "/order/advanceOrder",
          },
        ],
      },

      {
        title: "Lịch sử Đơn hàng và Chi tiết",
        url: "/order/manager",
        icon: Icons.Table,
        items: [
        ],
      },

      {
        title: "Dữ liệu",
        icon: Icons.Table,
        items: [
          {
            title: "Sao lưu Dữ liệu",
            url: "/data/backup",
          },
          {
            title: "Phục hồi Dữ liệu",
            url: "/data/restore",
          },
        ],
      },


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
