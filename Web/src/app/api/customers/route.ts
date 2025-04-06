import { connectToDatabase } from "@/lib/db";
import { User } from "@/models"; // vẫn dùng model User
import { NextRequest } from "next/server";

await connectToDatabase();

export async function GET(request: NextRequest) {
    const list = await User.find().limit(5);
    return Response.json({ data: list });
}
