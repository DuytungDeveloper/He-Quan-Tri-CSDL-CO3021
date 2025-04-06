import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

connectToDatabase();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const productId = (await params).id;
    const product = await Product.findById(new ObjectId(productId));
    return Response.json({
        stock: product?.stock ?? 0,
    });
}
