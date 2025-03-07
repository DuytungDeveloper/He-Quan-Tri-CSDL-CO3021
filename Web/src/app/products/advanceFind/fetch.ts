import { Product } from "@/models";


export async function getTop10() {
    const d = await Product.find({}).limit(10)
    return d
}