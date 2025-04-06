// import { connectToDatabase } from "@/lib/db"
// import { Product } from "@/models"
// import { AjaxData } from "datatables.net-dt"
// import _ from "lodash"
// import { NextRequest } from "next/server"
// connectToDatabase()
// const getAllProducts = async () => {
//     const list = await Product.find().limit(30)
//     return {
//         data: list,
//     }
// }


// export async function GET(request: NextRequest) {
//     try {
//         const data = await getAllProducts();
//         return Response.json(data, { status: 200 });
//     } catch (error) {
//         return Response.json({ error: "Lỗi khi lấy dữ liệu" }, { status: 500 });
//     }
// }

// import { connectToDatabase } from "@/lib/db";
// import { Product } from "@/models";
// import { NextRequest } from "next/server";

// connectToDatabase();

// const getAllProducts = async (category?: string) => {
//     const query: any = category ? { category } : {}; // Lọc theo category nếu có
//     const list = await Product.find(query).limit(30);
//     return {
//         data: list,
//     };
// };

// export async function GET(request: NextRequest) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const category = searchParams.get("category") || undefined;

//         const data = await getAllProducts(category);
//         return Response.json(data, { status: 200 });
//     } catch (error) {
//         return Response.json({ error: "Lỗi khi lấy dữ liệu" }, { status: 500 });
//     }
// }


import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models";
import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/app/data/backup/Order"; // Import model Order
connectToDatabase();

const getAllProducts = async (category: string, minPrice: number, maxPrice: number) => {
    const filter: any = {};

    // Lọc theo category nếu có
    if (category && category !== "All") {
        filter.category = category;
    }

    // Lọc theo giá nếu có
    if (minPrice && maxPrice) {
        filter.price = { $gte: minPrice, $lte: maxPrice }; // Giá trong khoảng
    } else if (minPrice) {
        filter.price = { $gte: minPrice }; // Giá lớn hơn minPrice
    } else if (maxPrice) {
        filter.price = { $lte: maxPrice }; // Giá nhỏ hơn maxPrice
    }

    const list = await Product.find(filter).limit(30); // Giới hạn 30 sản phẩm

    return {
        data: list,
    };
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") || "All"; // Lọc theo category
        const minPrice = parseFloat(searchParams.get("minPrice") || "0"); // Lọc theo giá thấp nhất
        const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000"); // Lọc theo giá cao nhất

        const data = await getAllProducts(category, minPrice, maxPrice);
        return Response.json(data, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Lỗi khi lấy dữ liệu" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
      const { userId, orderItems } = await request.json(); // Lấy thông tin từ body
  
      // Kiểm tra dữ liệu đầu vào
      if (!userId || !orderItems || orderItems.length === 0) {
        return NextResponse.json(
          { error: "Thông tin đơn hàng không hợp lệ" },
          { status: 400 }
        );
      }
  
      // Tính tổng giá trị đơn hàng
      let totalPrice = 0;
      for (const item of orderItems) {
        const product = await Product.findById(item.productId); // Lấy sản phẩm từ database
        if (!product) {
          return NextResponse.json({ error: `Sản phẩm không tồn tại: ${item.productId}` }, { status: 400 });
        }
        totalPrice += product.price * item.quantity; // Tính giá trị sản phẩm
      }
  
      // Tạo đơn hàng mới
      const newOrder = new Order({
        userId,
        orderItems,
        totalPrice,
        status: 'pending', // Trạng thái mặc định
      });
  
      // Lưu đơn hàng vào database
      await newOrder.save();
  
      return NextResponse.json({ message: "Đặt hàng thành công", orderId: newOrder._id }, { status: 201 });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      return NextResponse.json({ error: "Lỗi khi tạo đơn hàng" }, { status: 500 });
    }
  }
