"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card/card";
import { CardContent } from "@/components/ui/card/cardcontent";

export default function CreateOrder() {
    const [products, setProducts] = useState<{ id: number; name: string; price: number }[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000000);
    const [categories] = useState<string[]>(["All", "Books", "Shoes", "Clothing", "Grocery", "Home", "Toys", "Computers", "Beauty", "Movies"]);

    // Gọi API và lưu dữ liệu vào state khi người dùng chọn loại sản phẩm hoặc giá
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = `http://localhost:3000/api/product/getAllProduct?category=${selectedCategory}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
                const response = await fetch(url);
                const apiResponse = await response.json();
                const transformedProducts = apiResponse.data.map((item: any, index: number) => ({
                    id: index + 1,
                    name: item.name,
                    price: item.price,
                }));
                setProducts(transformedProducts);
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchProducts();
    }, [selectedCategory, minPrice, maxPrice]);

    const addProduct = (product: { id: number; name: string; price: number }) => {
        setSelectedProducts((prev) => {
            const existing = prev.find((p) => p.id === product.id);
            if (existing) {
                return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeProduct = (id: number) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    };

    const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

    const handleSubmit = async () => {
        const orderData = {
            customerName,
            products: selectedProducts,
            totalPrice,
        };

        // Gửi orderData lên server
        try {
            const response = await fetch("http://localhost:3000/api/product/getAllProduct", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Đặt hàng thành công!");
                console.log("Order response:", data); // Bạn có thể thêm logic xử lý dữ liệu ở đây
            } else {
                alert("Lỗi khi tạo đơn hàng: " + data.error);
            }
        } catch (error) {
            console.error("Lỗi khi gửi yêu cầu:", error);
            alert("Có lỗi xảy ra khi gửi yêu cầu");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">Tạo đơn hàng mới</h2>

            {/* Tên khách hàng */}
            <div className="mb-6">
                <Input
                    placeholder="Tên khách hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Dropdown chọn loại sản phẩm */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold">Chọn loại sản phẩm:</h3>
                <select
                    className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Lọc theo giá */}
            <div className="mb-6 flex space-x-4">
                <div className="w-1/2">
                    <Input
                        type="number"
                        placeholder="Giá tối thiểu"
                        value={minPrice}
                        onChange={(e) => setMinPrice(parseFloat(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-1/2">
                    <Input
                        type="number"
                        placeholder="Giá tối đa"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="cursor-pointer hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
                        onClick={() => addProduct(product)}
                    >
                        <Card className="hover:border-blue-500">
                            <CardContent className="text-center p-4 bg-gray-50 rounded-lg shadow-md">
                                <h4 className="font-medium text-xl">{product.name}</h4>
                                <p className="mt-2 text-lg font-semibold">{product.price}₫</p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Giỏ hàng */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Giỏ hàng:</h3>
                {selectedProducts.length > 0 ? (
                    <ul className="space-y-4">
                        {selectedProducts.map((p) => (
                            <li
                                key={p.id}
                                className="flex justify-between items-center border-b border-gray-200 pb-4"
                            >
                                <span className="text-lg">{p.name} x {p.quantity}</span>
                                <Button size="sm" variant="destructive" onClick={() => removeProduct(p.id)}>
                                    Xóa
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Chưa có sản phẩm nào.</p>
                )}
            </div>

            {/* Tổng tiền */}
            <div className="mt-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Tổng tiền: {totalPrice}₫</h3>
                <Button
                    className="w-full md:w-auto mt-4 md:mt-0"
                    onClick={handleSubmit}
                    disabled={!customerName || selectedProducts.length === 0}
                >
                    Đặt hàng
                </Button>
            </div>
        </div>
    );
}
