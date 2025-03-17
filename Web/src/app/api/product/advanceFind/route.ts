import { connectToDatabase } from "@/lib/db"
import { Product } from "@/models"
import { AjaxData } from "datatables.net-dt"
import _ from "lodash"
import { NextRequest } from "next/server"
connectToDatabase()
const getTransactionBankCode = async () => {
    const list = await Product.find().limit(10)
    return {
        data: list,
    }
}


export async function GET(request: NextRequest) {

    return Response.json(await getTransactionBankCode())
}

// /**
//  * @async
//  * @function POST
//  * @description API endpoint to handle POST requests for fetching paginated and filtered product data.
//  *              This endpoint is designed to work with client-side libraries like DataTables.
//  * @param {NextRequest} request - The incoming Next.js request object containing query parameters in the request body as JSON.
//  * @returns {NextResponse} - Returns a JSON response containing data for DataTables, including:
//  *                             - draw: Draw counter from request (for security).
//  *                             - recordsTotal: Total number of records in the database (unfiltered).
//  *                             - recordsFiltered: Total number of records after applying filters (but before pagination).
//  *                             - data: Array of product documents for the current page.
//  */
// export async function POST(request: NextRequest) {

//     // Parse the JSON request body to extract query parameters.
//     const queryData: AjaxData = await request.json();

//     // Extract DataTables parameters or set defaults
//     const start = queryData.start || 0; // Default start index is 0 if not provided
//     const length = queryData.length || 10; // Default page length is 10 if not provided
//     const search = (queryData.search as any)?.value || ''; // Global search value, default to empty string if not provided

//     /**
//      * Construct the base MongoDB query object based on global search input.
//      * If a global search term is provided, it will search across 'name', 'description', and 'category' fields using a case-insensitive regular expression.
//      */
//     const query: { [key: string]: any } = search
//         ? {
//             $or: [ // $or operator to search in multiple fields
//                 { name: { $regex: search, $options: 'i' } }, // Search 'name' field, case-insensitive
//                 { description: { $regex: search, $options: 'i' } }, // Search 'description' field, case-insensitive
//                 { category: { $regex: search, $options: 'i' } }, // Search 'category' field, case-insensitive
//             ],
//         }
//         : {}; // If no global search, start with an empty query object


//     /**
//      * Process column-specific search values.
//      * Iterate through each column definition from the request and apply column-specific search if provided.
//      */
//     queryData?.columns?.forEach(x => {
//         if (x.search.value) { // Check if a search value is provided for the current column
//             if (!query['$and']) { // If no $and operator exists in the query yet, initialize it as an empty array.
//                 query['$and'] = []; // $and will be used to combine multiple conditions
//             }
//             // Apply search based on column 'data' field. Expand this switch for more specific column handling if needed.
//             switch (x.data) {
//                 default: // Default case handles columns without specific logic (like name, description, category from columns array)
//                     query.$and?.push({ // Add a condition to the $and array to filter by the current column
//                         [x.data]: { // Use the column 'data' value as the field name in the query
//                             $regex: x.search.value, $options: 'i' // Apply case-insensitive regex search for the column's search value
//                         }
//                     })
//                     break;
//             }
//         }
//     })

//     /**
//      * Handle custom data filters sent in the request body.
//      * This section currently handles a price range filter as an example.
//      */
//     if (queryData?.data) {
//         if (queryData.data.price && Array.isArray(queryData.data.price)) { // Check if 'price' range is provided in 'data' and is an array
//             if (!query['$and']) { // Initialize $and array if not already present
//                 query['$and'] = [];
//             }
//             query['$and'].push({ // Add price range filter to the $and array
//                 price: { // Filter on the 'price' field
//                     $gte: (queryData.data.price[0]), // Greater than or equal to the minimum price
//                     $lte: (queryData.data.price[1]), // Less than or equal to the maximum price
//                 }
//             })
//         }
//     }

//     /**
//      * Construct the sorting object from DataTables 'order' parameters.
//      * DataTables sends ordering information as an array of order objects.
//      */
//     const order = queryData?.order || []; // Get order array, default to empty array if not provided
//     const sort: Record<string, any> = {}; // Initialize an empty sort object
//     order.forEach(({ column, dir }) => { // Iterate through each order instruction
//         const colName = queryData?.columns[column].data; // Get the column name from columns array using the column index from order
//         sort[colName] = dir === 'asc' ? 1 : -1; // Set sort direction: 1 for ascending, -1 for descending
//     });


//     /**
//      * Build the main aggregation pipeline stages.
//      * 'mainQuery' array will hold the aggregation stages to be executed.
//      */
//     const mainQuery = [
//         // { $match: query }, // First stage: $match - Apply the constructed query to filter documents
//     ]

//     if (query && Object.keys(query).length > 0) {
//         mainQuery.push(
//             { $match: query }, // First stage: $match - Apply the constructed query to filter documents
//         )
//     }




//     /**
//      * Construct aggregation pipeline to count total records after filtering (recordsFiltered in DataTables response).
//      * 'fullQueCount' pipeline is built by extending 'mainQuery' with a $count stage.
//      */
//     const fullQueCount = ([
//         ...mainQuery, // Spread operator to include all stages from 'mainQuery'
//         { $count: 'totalCount' }, // Add $count stage to count documents after $match filter, result stored in 'totalCount' field
//     ])


//     /**
//      * Construct the final aggregation pipeline for fetching paginated and sorted data.
//      * 'fullQue' pipeline extends 'mainQuery' with $sort, $skip, and $limit stages.
//      */
//     const fullQue: any[] = ([
//         // { $hint: { name: 1 } },
//         ...mainQuery, // Spread operator to include stages from 'mainQuery' ($match)

//         {
//             $project: { // Project only the fields you need
//                 _id: 1,
//                 name: 1,
//                 category: 1,
//                 price: 1,
//                 description: 1
//                 // ... any other fields you need ...
//             }
//         }
//     ])
//     if (!_.isEmpty(sort)) { // Add $sort stage only if 'sort' object is not empty (sorting is requested)
//         fullQue.push({ $sort: sort }); // Add $sort stage to sort documents based on constructed sort object
//     }
//     fullQue.push({ $skip: start }); // Add $skip stage to implement pagination, skipping 'start' number of documents
//     fullQue.push({ $limit: length }); // Add $limit stage to limit the number of documents fetched per page

//     // Execute the final aggregation pipeline to fetch product data for the current page.
//     const data = await Product.aggregate(fullQue);


//     // Fetch total number of records in the Product collection (before filtering) for 'recordsTotal' in DataTables response.
//     const totalRecords = await Product.countDocuments({}, {});
//     // Execute aggregation pipeline to get the count of records after filtering.

//     const totalRecordsFilteredRs = (await Product.aggregate(fullQueCount))
//     const totalRecordsFiltered = totalRecordsFilteredRs?.[0]?.totalCount ?? 0; // Extract the count from aggregation result, default to 0 if no result.



//     // Return JSON response formatted for DataTables
//     return Response.json({
//         draw: queryData?.draw || 1, // Echo back the draw parameter from request for security
//         recordsTotal: totalRecords, // Total records in the database
//         recordsFiltered: totalRecordsFiltered, // Total records after filtering
//         data, // Array of product data for the current page
//     });
// }


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
export async function POST(request: NextRequest) {

    // Parse the JSON request body containing DataTables data.
    const queryData: AjaxData = await request.json();

    // Extract key parameters from queryData with default values for safety and clarity.
    const draw = queryData.draw || 1; // DataTables draw counter, used for response integrity.
    const start = queryData.start || 0;      // Pagination start index, default to 0.
    const length = queryData.length || 10;    // Number of records to return per page, default to 10.
    const globalSearch = (queryData.search as any)?.value || ''; // Global search string, default to empty string.
    const listIndexKeys = await (await Product.listIndexes()).map(x => x.name)

    /**
     * Construct the MongoDB query object.
     * This query will be used to filter documents based on global search and column-specific filters.
     */
    let query: any = {}; // Initialize an empty query object.

    // // Apply global search if a search term is provided.
    // if (globalSearch) {
    //     query.$or = [ // Use $or to search across multiple fields.
    //         { name: { $regex: globalSearch, $options: 'i' } }, // Case-insensitive regex search on 'name'.
    //         { description: { $regex: globalSearch, $options: 'i' } }, // Case-insensitive regex search on 'description'.
    //         { category: { $regex: globalSearch, $options: 'i' } }, // Case-insensitive regex search on 'category'.
    //     ];
    // }

    // // Process column-specific search filters from DataTables request.
    // if (queryData?.columns) {
    //     queryData.columns.forEach(column => {
    //         if (column.search.value) { // If a search value is provided for this column.
    //             if (!query.$and) { // Initialize $and array if it doesn't exist yet to combine conditions.
    //                 query.$and = [];
    //             }
    //             // Apply column-specific search using regex, case-insensitive.
    //             query.$and.push({
    //                 [column.data]: { $regex: column.search.value, $options: 'i' }
    //             });
    //         }
    //     });
    // }



    if (queryData?.data?.category && typeof queryData.data.category === 'string') {
        if (!query.$and) {
            query.$and = [];
        }
        query.$and.push({ // Add price range filter using $gte (greater than or equal) and $lte (less than or equal).
            category: queryData.data.category
        });
    }





    // Apply global search if a search term is provided.
    if (globalSearch) {
        if (listIndexKeys.includes('search_name_category_description_index')) {
            if (!query.$and) {
                query.$and = [];
            }
            query.$and.push({ // Add price range filter using $gte (greater than or equal) and $lte (less than or equal).
                $text: { $search: globalSearch }
            });
        } else {
            query.$or = [ // Use $or to search across multiple fields.
                { name: { $regex: globalSearch, $options: 'i' } }, // Case-insensitive regex search on 'name'.
                { description: { $regex: globalSearch, $options: 'i' } }, // Case-insensitive regex search on 'description'.
                { category: { $regex: globalSearch, $options: 'i' } }, // Case-insensitive regex search on 'category'.
            ];
        }

    }

    // Apply custom data filters, e.g., price range filter.
    if (queryData?.data?.price && Array.isArray(queryData.data.price)) {
        if (!query.$and) {
            query.$and = [];
        }
        query.$and.push({ // Add price range filter using $gte (greater than or equal) and $lte (less than or equal).
            price: {
                $gte: queryData.data.price[0],
                $lte: queryData.data.price[1],
            }
        });
    }

    /**
     * Construct the sort object for MongoDB based on DataTables 'order' parameters.
     * DataTables ordering is converted to MongoDB sort format (e.g., { name: 1 } for ascending).
     */
    const sort: Record<string, any> = {}; // Initialize empty sort object.
    if (queryData?.order) {
        queryData.order.forEach(orderItem => {
            const columnName = queryData.columns[orderItem.column].data; // Get column name from column index.
            const sortDirection = orderItem.dir === 'asc' ? 1 : -1; // Determine sort direction (1 for asc, -1 for desc).
            sort[columnName] = sortDirection; // Add to sort object, e.g., sort = { name: 1 }.
        });
    }

    /**
     * Define the base aggregation pipeline stages.
     * 'mainQuery' array holds the core stages: $match (filter).
     */
    const mainQuery: any[] = [];

    // Add the $match stage to the pipeline if the query object is not empty (i.e., there are filters).
    if (Object.keys(query).length > 0) {
        mainQuery.push({ $match: query }); // Apply the constructed filter query.
    }


    /**
     * Construct aggregation pipeline for counting total filtered records.
     * This pipeline extends 'mainQuery' and adds a $count stage.
     */
    const countPipeline = [
        ...mainQuery, // Include all filter stages from 'mainQuery'.
        { $count: 'totalCount' }, // Add $count stage to count matching documents.
    ];

    /**
     * Construct the full aggregation pipeline for fetching paginated and sorted data.
     * This pipeline includes: $match (filter), $project (field selection), $sort, $skip, $limit.
     */
    const fullPipeline: any[] = [
        ...mainQuery, // Include filter stages.
    ];

    // Add $sort stage if sorting is defined in the request.
    if (!_.isEmpty(sort)) {
        fullPipeline.push({ $sort: sort }); // Apply sorting based on DataTables order parameters.
        // Consider adding $hint stage here IF explain() output suggests index on sorting field ('name' in example) is NOT being used.
        // fullPipeline.push({ $hint: { name: 1 } }); // Uncomment and adjust index name if needed.
    }

    // Add pagination stages: $skip and $limit.
    fullPipeline.push({ $skip: start }); // Skip documents for pagination.
    fullPipeline.push({ $limit: length }); // Limit documents per page.
    fullPipeline.push({
        $project: { // Project stage to select only necessary fields to reduce data transfer.
            _id: 1,
            name: 1,
            category: 1,
            price: 1,
            description: 1,
            stock: 1
            // Add other fields needed for the DataTable display here.
        }
    })
    // console.log("🚀 ~ POST ~ fullPipeline:", JSON.stringify(fullPipeline), JSON.stringify(countPipeline))

    // Execute aggregation pipelines to fetch data and counts concurrently.
    const [totalRecordsFilteredResult, paginatedData, totalRecordsCount] = await Promise.all([
        countPipeline.length !== 1 ? Product.aggregate(countPipeline) : Product.estimatedDocumentCount(), // Run aggregation to count filtered records.
        Product.aggregate(fullPipeline),   // Run aggregation to get paginated data.
        Product.estimatedDocumentCount()     // Efficiently count all documents in the collection for recordsTotal.
    ]);

    // Extract the filtered record count from the aggregation result, default to 0 if no result.
    const totalRecordsFiltered = Array.isArray(totalRecordsFilteredResult) ? totalRecordsFilteredResult?.[0]?.totalCount ?? 0 : totalRecordsFilteredResult;
    const data = paginatedData; // Paginated product data from aggregation.
    const totalRecords = totalRecordsCount; // Total records in the collection.

    // Return JSON response in DataTables format.
    return Response.json({
        draw: draw,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecordsFiltered,
        data: data,
    });
}