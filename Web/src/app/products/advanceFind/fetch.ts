import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models";


connectToDatabase();
export async function getTop10() {
    // Fake delay
    await connectToDatabase();
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const d = await Product.find({}).limit(10)
    return d
    return {
        views: {
            value: 3456,
            growthRate: 0.43,
        },
        profit: {
            value: 4220,
            growthRate: 4.35,
        },
        products: {
            value: 3456,
            growthRate: 2.59,
        },
        users: {
            value: 3456,
            growthRate: -0.95,
        },
    };
}