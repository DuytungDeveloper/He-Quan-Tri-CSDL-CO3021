import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models";
import { NextRequest } from "next/server";

await connectToDatabase();

export async function GET(request: NextRequest) {
    const list = await Product.find().limit(10);
    return Response.json({ data: list });
}
