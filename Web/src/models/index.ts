import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
    name: String,
    category: String,
    description: String,
    price: Number,
    stock: Number,
    created_at: { type: Date, default: Date.now },
});

const userSchema = new Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    address: String,
    phone: String,
    created_at: { type: Date, default: Date.now },
});

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    orderItems: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'products' },
            productName: String,
            quantity: Number,
            price: Number,
        },
    ],
    totalPrice: Number,
    orderDate: { type: Date, default: Date.now },
    status: String,
    created_at: { type: Date, default: Date.now },
});


// Include virtuals in JSON output
// TransactionSchema.set("toJSON", { virtuals: true });
// TransactionSchema.set("toObject", { virtuals: true });


// // Check if the model is already compiled (important for hot reloading)
// const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
// mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export const Product = mongoose.models.products || mongoose.model('products', productSchema);
export const User = mongoose.models.users || mongoose.model('users', userSchema);
export const Order = mongoose.models.orders || mongoose.model('orders', orderSchema);
