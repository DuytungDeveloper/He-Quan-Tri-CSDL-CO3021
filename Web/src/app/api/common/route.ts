import { connectToDatabase } from "@/lib/db"
import { Product } from "@/models"
import { NextRequest } from "next/server"

connectToDatabase()

const cache = new Map()

const getCommonData = async () => {
    if (!cache.has('common')) {
        const list = await Product.aggregate([
            {
                $group: {
                    _id: null, // Group all documents together
                    maxValue: { $max: "$price" }, // Find the maximum value of 'columnName'
                    minValue: { $min: "$price" }  // Find the minimum value of 'columnName'
                }
            },
            {
                $project: { // Optional: To reshape the output document
                    _id: 0,      // Exclude the _id field
                    maxValue: 1,
                    minValue: 1
                }
            }
        ])
        const category = await Product.distinct("category")


        const data = {
            maxPrice: 0,
            minPrice: 0,
            category
        }
        data.maxPrice = list[0]['maxValue']
        data.minPrice = list[0]['minValue']

        cache.set('common', data)
        return data

    } else {
        return cache.get('common')
    }


}


export async function GET(request: NextRequest) {

    return Response.json(await getCommonData())
}