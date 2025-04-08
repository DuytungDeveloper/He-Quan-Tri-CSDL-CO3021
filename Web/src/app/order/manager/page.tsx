"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/FormElements/select";
import "@/css/OrderListPage.css";

export default function OrderListPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterUser, setFilterUser] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const totalPages = Math.ceil(filteredOrders.length / limit);
    const paginatedOrders = filteredOrders.slice((page - 1) * limit, page * limit);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            const { data } = await res.json();
            setOrders(data);
            setFilteredOrders(data);
        } catch (error) {
            console.error("Lỗi khi lấy đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = [...orders];
        if (filterUser) {
            result = result.filter((o) =>
                o.userId?.username?.toLowerCase().includes(filterUser.toLowerCase())
            );
        }
        if (filterStatus) {
            result = result.filter((o) => o.status === filterStatus);
        }
        setFilteredOrders(result);
        setPage(1);
    }, [filterUser, filterStatus, orders]);

    return (
        <div className="p-6">
            <Breadcrumb pageName="Danh sách đơn hàng" />
            <h2 className="mb-4 text-2xl font-bold">Lọc và xem chi tiết các đơn hàng đã đặt</h2>

            <div className="flex flex-wrap gap-4 mb-6">
                <Input
                    placeholder="Tìm theo tên khách hàng"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="w-full md:w-1/3"
                />
                <Select
                    className="w-full md:w-1/4"
                    defaultValue=""
                    placeholder="Chọn trạng thái"
                    onChange={(val) => setFilterStatus(val)}
                    items={[
                        { value: "", label: "Tất cả trạng thái" },
                        { value: "pending", label: "Đang xử lý" },
                        { value: "completed", label: "Hoàn tất" },
                        { value: "cancelled", label: "Đã huỷ" }
                    ]}
                />
                <Button onClick={() => {
                    setFilterUser("");
                    setFilterStatus("");
                }}>Bỏ lọc</Button>
            </div>

            {loading ? (
                <p>Đang tải đơn hàng...</p>
            ) : (
                <>
                    <div className="overflow-x-auto mt-4 rounded-xl bg-white shadow-lg p-6">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 text-left">Khách hàng</th>
                                    <th className="p-3 text-left">Số sản phẩm</th>
                                    <th className="p-3 text-left">Tổng tiền</th>
                                    <th className="p-3 text-left">Ngày đặt</th>
                                    <th className="p-3 text-left">Trạng thái</th>
                                    <th className="p-3 text-left">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map((order, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{order.userId?.username || order.userId}</td>
                                        <td className="p-3">{order.orderItems.length}</td>
                                        <td className="p-3">{order.totalPrice.toLocaleString()}₫</td>
                                        <td className="p-3">{new Date(order.orderDate).toLocaleString("vi-VN")}</td>
                                        <td className="p-3">
                                            <span className={`badge ${order.status === "pending"
                                                ? "badge-pending"
                                                : order.status === "completed"
                                                    ? "badge-completed"
                                                    : "badge-cancelled"
                                                }`}>
                                                {order.status === "pending"
                                                    ? "Đang xử lý"
                                                    : order.status === "completed"
                                                        ? "Hoàn tất"
                                                        : "Đã huỷ"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <Button size="sm" onClick={() => {
                                                setSelectedOrder(order);
                                                setShowModal(true);
                                            }}>
                                                Xem
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <span>Trang {page} / {totalPages}</span>
                        <div className="space-x-2">
                            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                <Button
                                    key={num}
                                    variant={num === page ? "active" : "default"}
                                    onClick={() => setPage(num)}
                                >
                                    {num}
                                </Button>
                            ))}
                            <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau</Button>
                        </div>
                    </div>
                </>
            )}

            {showModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <h3 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h3>
                        <p><strong>Khách hàng:</strong> {selectedOrder.userId?.username}</p>
                        <p><strong>Tổng tiền:</strong> {selectedOrder.totalPrice.toLocaleString()}₫</p>
                        <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.orderDate).toLocaleString("vi-VN")}</p>
                        <p>
                            <strong>Trạng thái:</strong>{" "}
                            <span className={`badge ${selectedOrder.status === "pending"
                                ? "badge-pending"
                                : selectedOrder.status === "completed"
                                    ? "badge-completed"
                                    : "badge-cancelled"
                                }`}>
                                {selectedOrder.status === "pending"
                                    ? "Đang xử lý"
                                    : selectedOrder.status === "completed"
                                        ? "Hoàn tất"
                                        : "Đã huỷ"}
                            </span>
                        </p>

                        <h4 className="mt-4 font-semibold mb-2">Danh sách sản phẩm:</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 text-sm text-left">
                                <thead className="bg-gray-100 font-semibold">
                                    <tr>
                                        <th className="p-2 border-b">Tên sản phẩm</th>
                                        <th className="p-2 border-b text-center">Số lượng</th>
                                        <th className="p-2 border-b text-right">Đơn giá</th>
                                        <th className="p-2 border-b text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.orderItems.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{item.productName}</td>
                                            <td className="p-2 text-center">{item.quantity}</td>
                                            <td className="p-2 text-right">{item.price.toLocaleString()}₫</td>
                                            <td className="p-2 text-right">{(item.price * item.quantity).toLocaleString()}₫</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 text-right">
                            <Button onClick={() => setShowModal(false)}>Đóng</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
