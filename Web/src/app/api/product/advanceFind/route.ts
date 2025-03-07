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

// export async function POST(request: NextRequest) {

//     const queryData: AjaxData = await request.json()
//     // console.log("🚀 ~ POST ~ queryData:", queryData)
//     const start = queryData.start || 0; // Start index
//     const length = queryData.length || 10; // Number of records per page
//     const search = (queryData.search as any)?.value || ''; // Search value

//     const query: { [key: string]: any } = search
//         ? {
//             $or: [
//                 {
//                     name: {
//                         $regex: search, $options: 'i'
//                     }
//                 },
//                 {
//                     description: {
//                         $regex: search, $options: 'i'
//                     }
//                 },
//                 {
//                     category: {
//                         $regex: search, $options: 'i'
//                     }
//                 },
//                 // {
//                 //     price: {
//                 //         $regex: search, $options: 'i'
//                 //     }
//                 // },
//                 // {
//                 //     stock: {
//                 //         $regex: search, $options: 'i'
//                 //     }
//                 // },
//             ],
//             // $text: { $search: search },
//             // $and: []
//         }
//         : {};

//     queryData?.columns?.forEach(x => {
//         if (x.search.value) {
//             if (!query['$and']) {
//                 query['$and'] = [];
//             }
//             switch (x.data) {
//                 default:
//                     query.$and?.push({
//                         [x.data]: {
//                             $regex: x.search.value, $options: 'i'
//                         }
//                     })
//                     break;
//             }

//         }
//     })

//     if (queryData?.data) {
//         if (queryData.data.price && Array.isArray(queryData.data.price)) {
//             if (!query['$and']) {
//                 query['$and'] = [];
//             }
//             query['$and'].push({
//                 price: {
//                     $gte: (queryData.data.price[0]),
//                     $lte: (queryData.data.price[1]),
//                 }
//             })
//         }
//     }


//     const order = queryData?.order || [];
//     const sort: Record<string, any> = {};
//     order.forEach(({ column, dir }) => {
//         const colName = queryData?.columns[column].data;
//         sort[colName] = dir === 'asc' ? 1 : -1;
//     });


//     const mainQuery = [
//         // {
//         //     $addFields: {
//         //         price_string: {
//         //             $toString: '$price'
//         //         }
//         //     },
//         // },
//         {
//             $match: query,
//         }
//     ]
//     // console.log("🚀 ~ POST ~ mainQuery:", JSON.stringify(mainQuery))




//     const fullQueCount = ([
//         ...mainQuery,
//         {
//             $count: 'totalCount',
//         },
//     ])

//     // Get total records count
//     // console.log(await Transaction.listIndexes())
//     const totalRecords = await Product.countDocuments();
//     const totalRecordsFilteredRs = (await Product.aggregate(fullQueCount))
//     const totalRecordsFiltered = totalRecordsFilteredRs?.[0]?.totalCount ?? 0;
//     const fullQue: any[] = ([
//         ...mainQuery,
//     ])
//     if (!_.isEmpty(sort)) {
//         fullQue.push({
//             $sort: sort,
//         })
//     }
//     fullQue.push({
//         $skip: start,
//     })
//     fullQue.push({
//         $limit: length
//     })
//     const data = await Product.aggregate(fullQue)

//     return Response.json({
//         draw: queryData?.draw || 1,
//         recordsTotal: totalRecords,
//         recordsFiltered: totalRecordsFiltered,
//         data,
//     });
// }


/**
 * @async
 * @function POST
 * @description API endpoint to handle POST requests for fetching paginated and filtered product data.
 *              This endpoint is designed to work with client-side libraries like DataTables.
 * @param {NextRequest} request - The incoming Next.js request object containing query parameters in the request body as JSON.
 * @returns {NextResponse} - Returns a JSON response containing data for DataTables, including:
 *                             - draw: Draw counter from request (for security).
 *                             - recordsTotal: Total number of records in the database (unfiltered).
 *                             - recordsFiltered: Total number of records after applying filters (but before pagination).
 *                             - data: Array of product documents for the current page.
 */
export async function POST(request: NextRequest) {

    // Parse the JSON request body to extract query parameters.
    const queryData: AjaxData = await request.json();

    // Extract DataTables parameters or set defaults
    const start = queryData.start || 0; // Default start index is 0 if not provided
    const length = queryData.length || 10; // Default page length is 10 if not provided
    const search = (queryData.search as any)?.value || ''; // Global search value, default to empty string if not provided

    /**
     * Construct the base MongoDB query object based on global search input.
     * If a global search term is provided, it will search across 'name', 'description', and 'category' fields using a case-insensitive regular expression.
     */
    const query: { [key: string]: any } = search
        ? {
            $or: [ // $or operator to search in multiple fields
                { name: { $regex: search, $options: 'i' } }, // Search 'name' field, case-insensitive
                { description: { $regex: search, $options: 'i' } }, // Search 'description' field, case-insensitive
                { category: { $regex: search, $options: 'i' } }, // Search 'category' field, case-insensitive
            ],
        }
        : {}; // If no global search, start with an empty query object


    /**
     * Process column-specific search values.
     * Iterate through each column definition from the request and apply column-specific search if provided.
     */
    queryData?.columns?.forEach(x => {
        if (x.search.value) { // Check if a search value is provided for the current column
            if (!query['$and']) { // If no $and operator exists in the query yet, initialize it as an empty array.
                query['$and'] = []; // $and will be used to combine multiple conditions
            }
            // Apply search based on column 'data' field. Expand this switch for more specific column handling if needed.
            switch (x.data) {
                default: // Default case handles columns without specific logic (like name, description, category from columns array)
                    query.$and?.push({ // Add a condition to the $and array to filter by the current column
                        [x.data]: { // Use the column 'data' value as the field name in the query
                            $regex: x.search.value, $options: 'i' // Apply case-insensitive regex search for the column's search value
                        }
                    })
                    break;
            }
        }
    })

    /**
     * Handle custom data filters sent in the request body.
     * This section currently handles a price range filter as an example.
     */
    if (queryData?.data) {
        if (queryData.data.price && Array.isArray(queryData.data.price)) { // Check if 'price' range is provided in 'data' and is an array
            if (!query['$and']) { // Initialize $and array if not already present
                query['$and'] = [];
            }
            query['$and'].push({ // Add price range filter to the $and array
                price: { // Filter on the 'price' field
                    $gte: (queryData.data.price[0]), // Greater than or equal to the minimum price
                    $lte: (queryData.data.price[1]), // Less than or equal to the maximum price
                }
            })
        }
    }

    /**
     * Construct the sorting object from DataTables 'order' parameters.
     * DataTables sends ordering information as an array of order objects.
     */
    const order = queryData?.order || []; // Get order array, default to empty array if not provided
    const sort: Record<string, any> = {}; // Initialize an empty sort object
    order.forEach(({ column, dir }) => { // Iterate through each order instruction
        const colName = queryData?.columns[column].data; // Get the column name from columns array using the column index from order
        sort[colName] = dir === 'asc' ? 1 : -1; // Set sort direction: 1 for ascending, -1 for descending
    });


    /**
     * Build the main aggregation pipeline stages.
     * 'mainQuery' array will hold the aggregation stages to be executed.
     */
    const mainQuery = [
        { $match: query }, // First stage: $match - Apply the constructed query to filter documents
    ]


    /**
     * Construct aggregation pipeline to count total records after filtering (recordsFiltered in DataTables response).
     * 'fullQueCount' pipeline is built by extending 'mainQuery' with a $count stage.
     */
    const fullQueCount = ([
        ...mainQuery, // Spread operator to include all stages from 'mainQuery'
        { $count: 'totalCount' }, // Add $count stage to count documents after $match filter, result stored in 'totalCount' field
    ])

    // Fetch total number of records in the Product collection (before filtering) for 'recordsTotal' in DataTables response.
    const totalRecords = await Product.countDocuments();
    // Execute aggregation pipeline to get the count of records after filtering.
    const totalRecordsFilteredRs = (await Product.aggregate(fullQueCount))
    const totalRecordsFiltered = totalRecordsFilteredRs?.[0]?.totalCount ?? 0; // Extract the count from aggregation result, default to 0 if no result.

    /**
     * Construct the final aggregation pipeline for fetching paginated and sorted data.
     * 'fullQue' pipeline extends 'mainQuery' with $sort, $skip, and $limit stages.
     */
    const fullQue: any[] = ([
        ...mainQuery, // Spread operator to include stages from 'mainQuery' ($match)
    ])
    if (!_.isEmpty(sort)) { // Add $sort stage only if 'sort' object is not empty (sorting is requested)
        fullQue.push({ $sort: sort }); // Add $sort stage to sort documents based on constructed sort object
    }
    fullQue.push({ $skip: start }); // Add $skip stage to implement pagination, skipping 'start' number of documents
    fullQue.push({ $limit: length }); // Add $limit stage to limit the number of documents fetched per page

    // Execute the final aggregation pipeline to fetch product data for the current page.
    const data = await Product.aggregate(fullQue);

    // Return JSON response formatted for DataTables
    return Response.json({
        draw: queryData?.draw || 1, // Echo back the draw parameter from request for security
        recordsTotal: totalRecords, // Total records in the database
        recordsFiltered: totalRecordsFiltered, // Total records after filtering
        data, // Array of product data for the current page
    });
}