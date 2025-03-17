import { connectToDatabase } from "@/lib/db"
import { Product } from "@/models"
import _ from "lodash"
import { NextRequest } from "next/server"
import { ObjectId } from "mongodb";
connectToDatabase()

/**
 * @async
 * @function POST
 * @description API endpoint to handle POST requests for fetching paginated and filtered product data for DataTables.
 *              Optimized for performance with large datasets by leveraging MongoDB indexes and efficient aggregation.
 * @param {NextRequest} request - The incoming Next.js request object containing DataTables parameters in JSON format.
 * @returns {NextResponse} - Returns a JSON response compliant with DataTables format, including:
 *                             - draw: Echoes back the 'draw' parameter for request verification.
 *                             - recordsTotal: Total number of records in the Product collection.
 *                             - recordsFiltered: Total number of records after applying search and filter criteria.
 *                             - data: Paginated array of product documents based on request parameters.
 *
 * **Performance Optimizations Applied:**
 * 1. **Indexing**: Assumes that indexes are created on fields frequently used in filtering and sorting
 *    (e.g., 'name', 'category', 'description', 'price').  Ensure these indexes are in MongoDB for optimal performance.
 * 2. **Projection**: Includes a `$project` stage in the aggregation pipeline to return only necessary fields,
 *    reducing data transfer and improving query speed.  Customize the projected fields as needed.
 * 3. **Efficient Filtering**:  Constructs MongoDB queries using `$regex` for text search and `$and`, `$or`, `$gte`, `$lte` for combined conditions, which are efficiently processed by MongoDB.
 * 4. **Optimized Counting**:  Uses separate aggregation pipelines for counting total and filtered records, ensuring efficient counts without fetching full documents.
 * 5. **`$hint` for Sorting (Conditional & Commented Out)**:  Forced index usage for sorting is commented out but can be enabled if query explain analysis suggests index is not being used for sorting.
 *
 * **To Further Optimize (Steps to perform outside code review):**
 * 1. **Run `explain('executionStats')`**:  Execute `db.products.explain('executionStats').aggregate([...yourAggregationPipeline...])` in MongoDB shell
 *    to analyze the query execution plan. This will pinpoint bottlenecks (e.g., collection scans instead of index scans).
 * 2. **Adjust Indexes based on `explain()`**: If `explain()` shows inefficient index usage, refine or create new indexes in MongoDB to match your query patterns.
 * 3. **Monitor MongoDB Performance**: Check MongoDB server resource utilization (CPU, Memory, Disk I/O) during peak loads. Optimize MongoDB server configuration and consider hardware upgrades if needed.
 */
export async function PUT(request: NextRequest) {
    // Parse the JSON request body containing DataTables data.
    const queryData: { productId: string, currentStock: number, updateStock: number } = await request.json();
    let result = false

    // const session = await Product.db.startSession()
    const session = Product.db.getClient().startSession();

    session.startTransaction()

    try {
        const productId = new ObjectId(queryData.productId)
        const prod = await Product.findOne({ _id: productId, stock: queryData.currentStock }, {
            stock: 1,
            _id: 1,
        })

        if (!prod) return Response.json({
            success: result
        })

        if (queryData.updateStock < 0 && prod.stock < Math.abs(queryData.updateStock)) {
            return Response.json({
                success: result
            })
        }


        const rsUp = await Product.updateOne({ _id: prod._id, stock: prod.stock }, {
            $inc: {
                stock: queryData.updateStock
            },
        })

        console.log("🚀 ~ PUT ~ rsUp:", rsUp)
        if (rsUp.modifiedCount === 1) {
            result = true
        }

        await session.commitTransaction()
        result = true
    } catch (error) {
        console.log("🚀 ~ PUT ~ error:", error)
        await session.abortTransaction()
    } finally {
        await session.endSession()
    }




    // Return JSON response in DataTables format.
    return Response.json({
        success: result
    })
}