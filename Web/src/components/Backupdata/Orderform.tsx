"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card/card";
import { CardContent } from "@/components/ui/card/cardcontent";

export default function CreateOrder() {
    const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
    const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000000);
    const [categories] = useState<string[]>(["All", "Books", "Shoes", "Clothing", "Grocery", "Home", "Toys", "Computers", "Beauty", "Movies"]);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch("/api/customers");
                const { data } = await res.json();
                const transformed = data.map((item: any) => ({ id: item._id, name: item.username }));
                setCustomers(transformed);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách khách hàng:", error);
            }
        };
        fetchCustomers();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = `/api/product/getAllProduct?category=${selectedCategory}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
                const response = await fetch(url);
                const apiResponse = await response.json();
                const transformedProducts = apiResponse.data.map((item: any) => ({
                    id: item._id,
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

    const addProduct = (product: { id: string; name: string; price: number }) => {
        setSelectedProducts((prev) => {
            const existing = prev.find((p) => p.id === product.id);
            if (existing) {
                return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeProduct = (id: string) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    };

    const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

    const handleSubmit = async () => {
        if (!selectedCustomerId) {
            setFeedbackType("error");
            setFeedbackMessage("Vui lòng chọn khách hàng.");
            setShowFeedbackModal(true);
            return;
        }
        if (selectedProducts.length === 0) {
            setFeedbackType("error");
            setFeedbackMessage("Vui lòng chọn ít nhất một sản phẩm.");
            setShowFeedbackModal(true);
            return;
        }
        for (const product of selectedProducts) {
            if (product.quantity <= 0) {
                setFeedbackType("error");
                setFeedbackMessage(`Sản phẩm "${product.name}" có số lượng không hợp lệ.`);
                setShowFeedbackModal(true);
                return;
            }
        }
        const orderItems = selectedProducts.map(p => ({
            productId: p.id,
            productName: p.name,
            quantity: p.quantity,
            price: p.price,
        }));
        try {
            const response = await fetch("/api/place-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedCustomerId, orderItems })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setFeedbackType("success");
                setFeedbackMessage("Đặt hàng thành công!");
                setSelectedProducts([]);
                setSelectedCustomerId("");
            } else {
                setFeedbackType("error");
                setFeedbackMessage("Lỗi khi đặt hàng: " + result.message);
            }
        } catch (error) {
            setFeedbackType("error");
            setFeedbackMessage("Đã xảy ra lỗi khi đặt hàng");
        }
        setShowFeedbackModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-2xl space-y-10">
            <h2 className="text-3xl font-bold text-center text-primary">🛒 Tạo đơn hàng mới</h2>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="font-semibold">Khách hàng:</label>
                    <select className="mt-2 w-full p-3 border rounded-lg focus:ring focus:ring-primary" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
                        <option value="">-- Chọn khách hàng --</option>
                        {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="font-semibold">Loại sản phẩm:</label>
                    <select className="mt-2 w-full p-3 border rounded-lg focus:ring focus:ring-primary" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="md:w-1/3">
                    <label className="font-semibold block mb-1">Lọc theo giá:</label>
                    <p className="text-sm text-gray-500">(Chọn khoảng giá sản phẩm)</p>
                </div>
                <div className="md:w-1/3">
                    <Input
                        type="number"
                        placeholder="Giá tối thiểu"
                        value={minPrice}
                        onChange={(e) => setMinPrice(parseFloat(e.target.value))}
                    />
                </div>
                <div className="md:w-1/3">
                    <Input
                        type="number"
                        placeholder="Giá tối đa"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                    />
                </div>
            </div>


            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                    <div key={p.id} className="cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition duration-200" onClick={() => addProduct(p)}>
                        <Card className="hover:border-primary">
                            <CardContent className="text-center p-5 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-lg">{p.name}</h4>
                                <p className="mt-2 text-base font-semibold text-green-600">{p.price.toLocaleString()}₫</p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">🛍️ Giỏ hàng:</h3>
                {selectedProducts.length > 0 ? (
                    <ul className="space-y-3">
                        {selectedProducts.map((p) => (
                            <li key={p.id} className="flex justify-between items-center border-b pb-3">
                                <span className="text-base font-medium">{p.name} x {p.quantity}</span>
                                <Button size="sm" variant="destructive" onClick={() => removeProduct(p.id)}>Xóa</Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">Chưa có sản phẩm nào trong giỏ.</p>
                )}
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-700">Tổng tiền: {totalPrice.toLocaleString()}₫</h3>
                <Button size="lg" onClick={handleSubmit}>🚀 Đặt hàng</Button>
            </div>

            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full text-center">
                        <h2 className={`text-xl font-bold mb-4 ${feedbackType === "error" ? "text-red-600" : "text-green-600"}`}>
                            {feedbackType === "error" ? "❌ Lỗi" : "✅ Thành công"}
                        </h2>
                        <p className="text-gray-700 mb-4">{feedbackMessage}</p>
                        <Button onClick={() => setShowFeedbackModal(false)}>Đóng</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
