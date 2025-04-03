"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";
import { useEffect, useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/FormElements/select";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui-elements/alert";
import "@/css/advanceOrder.css";

type Product = {
    productId: string;
    productName: string;
    price: number;
};

type simulateOrdeItem = {
    userName: string;
    startTime: string;
    status: boolean;
    message: string;
};

type User = {
    id: string;
    name: string;
    quantity: number;
};

const AdvanceOrderPage = () => {
    const [product, setproduct] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [results, setResults] = useState<simulateOrdeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [stockBefore, setStockBefore] = useState<number | null>(null);
    const [stockAfter, setStockAfter] = useState<number | null>(null);

    const getSelectedProduct = () =>
        product.find((p) => p.productId === selectedProductId)!;

    useEffect(() => {
        async function fetchData() {
            const prodRes = await fetch("/api/product");
            const userRes = await fetch("/api/customers");

            const prodData = await prodRes.json();
            const userData = await userRes.json();

            const mappedproduct = prodData?.data?.map((p: any) => ({
                productId: p._id,
                productName: p.name,
                price: p.price,
            }));

            const mappedUsers = userData?.data?.slice(0, 9).map((u: any, i: number) => ({
                id: u._id,
                name: u.username || `Người dùng ${i + 1}`,
                quantity: 1,
            }));

            setproduct(mappedproduct || []);
            setUsers(mappedUsers || []);

            if (mappedproduct?.[0]) {
                setSelectedProductId(mappedproduct[0].productId);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        const fetchStock = async () => {
            if (!selectedProductId) return;
            const res = await fetch(`/api/product/${selectedProductId}`);
            const data = await res.json();
            setStockBefore(data?.stock ?? null);
            setStockAfter(null);
        };
        fetchStock();
    }, [selectedProductId]);

    const simulateOrder = async (userId: string, userName: string, quantity: number) => {
        const product = getSelectedProduct();
        const startTime = new Date().toLocaleTimeString();

        const res = await fetch("/api/place-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                orderItems: [
                    {
                        productId: product.productId,
                        productName: product.productName,
                        quantity,
                        price: product.price,
                    },
                ],
            }),
        });

        const data = await res.json();
        return {
            userName,
            startTime,
            status: !!data.success,
            message: data.message,
        };
    };

    const handleSimulate = async () => {
        setLoading(true);
        setResults([]);
        setStockAfter(null);

        const promises = users.map((u) => simulateOrder(u.id, u.name, u.quantity));
        const resultList = await Promise.all(promises);
        setResults(resultList);

        const afterRes = await fetch(`/api/product/${selectedProductId}`);
        const afterData = await afterRes.json();
        setStockAfter(afterData?.stock ?? null);

        setLoading(false);
    };

    const updateUserQty = (index: number, value: number) => {
        setUsers((prev) => {
            const clone = [...prev];
            clone[index].quantity = value;
            return clone;
        });
    };

    return (
        <>
            <Breadcrumb pageName="Mô phỏng Đặt Hàng Cạnh tranh" />
            <div className="space-y-12 px-4 sm:px-8">
                <Suspense fallback={<TopProductsSkeleton />}>
                    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl space-y-10 border border-gray-200 dark:border-gray-700">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400">
                                🧪 Mô phỏng Đặt Hàng Cạnh Tranh
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">
                                Mỗi người dùng có thể chọn số lượng cần đặt. Hệ thống hiển thị tồn kho trước và sau khi đặt.
                            </p>
                        </div>

                        <Select
                            label="🛒 Chọn sản phẩm:"
                            items={product.map((p) => ({
                                value: p.productId,
                                label: `${p.productName} – ${p.price.toLocaleString("vi-VN")}₫`,
                            }))}
                            defaultValue={selectedProductId}
                            onChange={(val) => setSelectedProductId(val)}
                            placeholder="Chọn sản phẩm"
                        />

                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border rounded-xl p-6 space-y-3">
                            <p className="text-xl text-gray-800 dark:text-gray-100">
                                🧾 Tồn kho ban đầu: <strong className="text-blue-700 dark:text-blue-300">{stockBefore ?? "Đang tải..."}</strong>
                            </p>
                            {stockAfter !== null && (
                                <p className="text-xl text-gray-800 dark:text-gray-100">
                                    ✅ Tồn kho sau khi đặt: <strong className="text-green-700 dark:text-green-400">{stockAfter}</strong>
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">👥 Danh sách người dùng</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {users.map((u, i) => (
                                    <div key={u.id} className="bg-white dark:bg-gray-800 border rounded-xl p-5 space-y-3 shadow-md">
                                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{u.name}</p>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={u.quantity}
                                            onChange={(e) => updateUserQty(i, Number(e.target.value))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 d-flex">
                            <Button
                                onClick={handleSimulate}
                                disabled={loading || !selectedProductId}
                                className="m-auto text-lg btn"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    "🚀 Mô phỏng đặt hàng"
                                )}
                            </Button>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-inner space-y-4">
                            <h4 className="text-xl font-semibold text-gray-800 dark:text-white">📋 Kết quả đặt hàng:</h4>
                            {results.length === 0 ? (
                                <p className="text-gray-500 italic">Chưa có kết quả</p>
                            ) : (
                                results.map((msg, idx) => (
                                    <div
                                        key={idx}

                                        className={`result-item px-5 py-3 rounded text-sm border ${msg.status
                                            ? "success-message"
                                            : "error-message"
                                            }`}
                                    >
                                        <div className="header-info">
                                            <p className="header-name "> {msg.userName}</p>

                                            <p className={`${msg.status
                                                ? "bagde-success"
                                                : "bagde-danger"
                                                }`}> {msg.status
                                                    ? "Thành công"
                                                    : "Thất bại"
                                                }</p>
                                        </div>
                                        <p >{msg.startTime}</p>
                                        <p className="info"> {msg.message}</p>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Suspense>
            </div>
        </>
    );
};

export default AdvanceOrderPage;