// /api/orders/route.ts
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models";
import { NextRequest } from "next/server";

await connectToDatabase();

export async function GET(req: NextRequest) {
    const orders = await Order.find()
        .populate("userId", "username email") // ✨ chỉ lấy trường cần thiết
        .sort({ orderDate: -1 })
        .limit(50);

    return Response.json({ data: orders });
}
