import { NextRequest } from "next/server";
import { Order, Product } from "@/models";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";

await connectToDatabase(); // 👈 đảm bảo kết nối trước khi dùng mongoose

export async function POST(req: NextRequest) {

    const { userId, orderItems } = await req.json();

    if (!userId || !Array.isArray(orderItems)) {
        return Response.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
    }

    const session = await mongoose.startSession(); // Dùng startSession từ mongoose trực tiếp

    try {
        await session.withTransaction(async () => {
            const updatedProducts = [];

            for (const item of orderItems) {
                const product = await Product.findOne(
                    {
                        _id: item.productId,
                        stock: { $gte: item.quantity },
                    },
                    null,
                    { session }
                );

                if (!product) {
                    throw new Error(`Sản phẩm "${item.productName}" không đủ tồn kho.`);
                }

                const update = await Product.updateOne(
                    {
                        _id: product._id,
                        stock: { $gte: item.quantity },
                    },
                    {
                        $inc: { stock: -item.quantity },
                    },
                    { session }
                );

                if (update.modifiedCount === 0) {
                    throw new Error(`Không thể cập nhật tồn kho cho "${item.productName}"`);
                }

                updatedProducts.push(product._id);
            }

            const totalPrice = orderItems.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );

            await Order.create(
                [
                    {
                        userId: new mongoose.Types.ObjectId(userId),
                        orderItems,
                        totalPrice,
                        status: "pending",
                        orderDate: new Date(),
                        created_at: new Date(),
                    },
                ],
                { session }
            );
        });

        return Response.json({
            success: true,
            message: "Đặt hàng thành công",
        });
    } catch (error: any) {
        return Response.json(
            {
                success: false,
                message: error.message || "Lỗi khi đặt hàng",
            },
            { status: 500 }
        );
    } finally {
        session.endSession(); // Đảm bảo luôn đóng session
    }
}
