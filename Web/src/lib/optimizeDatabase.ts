import { Schema } from "mongoose";

const optimizeProductTable = async (schemaData: Schema) => {
    const listIndexName = [
        { name: "name_index", unique: true },
        { name: "category_index", unique: false },
        { name: "description_index", unique: false },
        { name: "price_index", unique: false },
        { name: "stock_index", unique: false },
        { name: "search_name_category_description_index", unique: false },
    ]


    for (let i = 0; i < listIndexName.length; i++) {
        const indexInfo = listIndexName[i]
        const name = indexInfo.name
        const splitName = name.split('_')
        if (splitName.length === 2) {
            schemaData.index({
                [splitName[0]]: 1
            }, { name, unique: indexInfo.unique })
            break;
        } else {
            switch (name) {
                case 'search_name_category_description_index':
                    await schemaData.index({
                        name: 'text', description: 'text', category: 'text'
                    }, { name, unique: indexInfo.unique })
                    break;

                default:
                    break;
            }
        }

    }

}

export {
    optimizeProductTable
}