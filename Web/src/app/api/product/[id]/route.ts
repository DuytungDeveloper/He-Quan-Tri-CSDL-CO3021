import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

await connectToDatabase();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const product = await Product.findById(new ObjectId(params.id));
    return Response.json({
        stock: product?.stock ?? 0,
    });
}
