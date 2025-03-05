import { connectToDatabase } from "@/lib/db"
import { Product } from "@/models"
import { NextRequest } from "next/server"
connectToDatabase()
const getTransactionBankCode = async () => {
    await Product.collection.name, Product.db.collections['products'].findOne().then(d => {
        console.log(d)
    })

    const list = await Product.find().limit(10)
    return {
        data: list,
    }
}


export async function GET(request: NextRequest) {

    return Response.json(await getTransactionBankCode())
}