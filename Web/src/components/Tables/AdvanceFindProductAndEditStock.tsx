"use client";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css"; // Buttons CSS
import $ from "jquery"
import Swal from 'sweetalert2'

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Checkbox from "../FormElements/Checkboxes/Checkbox";

import DoubleRangeSlider from "../Slider/MultiRangeSlider";
import dayjs from "dayjs";
import { debounce, throttle } from "lodash";
import dynamic from "next/dynamic";
import { DataTableRef } from "datatables.net-react";
import { Select } from "../FormElements/select";
import { GlobeIcon } from "@/assets/icons";

const DataTable = dynamic(
    async () => {
        const dtReact = import("datatables.net-react");

        const dtNet = import(`datatables.net-dt`);

        const [reactMod, dtNetMod] = await Promise.all([dtReact, dtNet]);

        reactMod.default.use(dtNetMod.default);

        return reactMod.default;
    },
    { ssr: false }
);

function _formatString(str: string) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
}

export default function AdvanceFindProductAndEditStock() {
    const dataTableRef = useRef<DataTableRef>(null);


    const reloadData = useCallback(
        debounce(() => {
            dataTableRef.current?.dt()?.ajax.reload();
        }, 1000),
        []
    );

    const handleUpdateStock = async (productId: string, newStockQuantity: number) => {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ stockQuantity: newStockQuantity }),
            });

            // if (response.ok) {
            //     // Cập nhật giao diện người dùng sau khi cập nhật thành công
            //     setProducts(products.map(product => {
            //         if (product.id === productId) {
            //             return { ...product, stockQuantity: newStockQuantity };
            //         }
            //         return product;
            //     }));
            //     alert('Số lượng tồn kho đã được cập nhật thành công!');
            // } else {
            //     alert('Lỗi cập nhật số lượng tồn kho.');
            // }
        } catch (error) {
            console.error(error);
            alert('Đã xảy ra lỗi.');
        }
    };

    const ajaxDataFunc = useRef((d: any) => {
        if (d?.search?.value) {
            d.search.value = _formatString(d.search.value);
        }
        return JSON.stringify(d); // Convert DataTables data to JSON format
    }).current;

    const options = useMemo(() => {
        return {
            order: [],
            scrollCollapse: true,
            scrollY: "200",
            scrollX: true,
            orderMulti: true,
            serverSide: true,
            columns: [
                {
                    name: "name",
                    data: "name",
                    // orderData: [0]
                },
                {
                    data: "category",
                    name: "category",
                    // orderData: [0]
                },
                {
                    data: "description",
                    name: "description",
                    // orderData: [0]
                },
                {
                    name: "price",
                    data: "price",
                    render: function (data: any, type: any, row: any) {
                        return new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 9,
                        }).format(data);
                    },
                    // orderData: [0]
                },
                {
                    name: "stock",
                    data: "stock",
                    // render: function (data: any, type: any, row: any) {
                    //     return new Intl.NumberFormat("vi-VN", {
                    //         style: "currency",
                    //         currency: "VND",
                    //         maximumFractionDigits: 9,
                    //     }).format(data);
                    // },
                    // orderData: [0]
                },
                {
                    data: '_id',
                    title: 'Actions',
                    render: function (data: any, type: any, row: any) {
                        return `
                        <button class="edit-btn inline-flex items-center justify-center gap-2.5 text-center font-medium hover:bg-opacity-90 font-medium transition focus:outline-none bg-primary text-white rounded-full py-3.5 px-10 py-3.5 lg:px-8 xl:px-10" data-id="${row._id}" data-stock="${row.stock}">Sửa</button>
                      `;
                    },
                },
            ],
            drawCallback: function (settings: any) {

                $('.edit-btn').on('click', async function () {
                    const id = $(this).data('id');
                    const stock = $(this).data('stock');
                    console.log('Sửa ID:', id);
                    //Thêm logic xử lý Sửa ở đây.
                    const { value } = await Swal.fire({
                        title: "Cập nhật số lượng",
                        input: "number",
                        inputLabel: "Số lượng cần cập nhật",
                        inputValue: stock,
                        showCancelButton: true,
                        inputValidator: (value) => {
                            if (Number(value) < 0) return "Vui lòng nhập dữ liệu chính xác "
                            if (!value) {
                                return "Vui lòng điền dữ liệu!";
                            }
                        }
                    });
                    if (Number(value) >= 0) {
                        const updateData = {
                            "productId": id,
                            "currentStock": stock,
                            "updateStock": Number(value) - stock
                        }

                        const response = await fetch(`/api/product/updateProductStock`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updateData),
                        });
                        console.log("🚀 ~ response:", response)
                        const result = await response.json()
                        if (result.success) {
                            Swal.fire({
                                title: "Cập nhật thành công!",
                                icon: "success",
                            });
                            dataTableRef.current?.dt()?.ajax.reload(undefined, false)
                        } else {
                            Swal.fire({
                                title: "Cập nhật thất bại!",
                                icon: "success",
                            });
                        }

                    }
                });
            },
            ajax: {
                url: "/api/product/advanceFind",
                dataSrc: "data",
                type: "POST", // Can also be GET depending on your server implementation
                contentType: "application/json",
                data: ajaxDataFunc,
            },
            language: {
                decimal: "",
                emptyTable: "No data available in table",
                info: "Hiển thị từ _START_ đến _END_ trên tổng _TOTAL_ dữ liệu",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                infoFiltered: "(lọc từ _MAX_ tổng số dữ liệu)",
                infoPostFix: "",
                thousands: ",",
                lengthMenu: "Hiện _MENU_ dữ liệu",
                loadingRecords: "Đang tải...",
                processing: "",
                search: "",
                zeroRecords: "No matching records found",
                paginate: {
                    first: "Trang đầu",
                    last: "Trang cuối",
                    next: "Trang kế",
                    previous: "Trang trước",
                },
                searchPlaceholder: "Tìm kiếm tương đối theo tên, danh mục và mô tả",
                aria: {
                    // "orderable": "Order by this column",
                    // "orderableReverse": "Reverse order this column"
                },
            },
            layout: {
                topEnd: {
                    search: {
                        processing: true,
                    },
                },
                topStart: {
                    pageLength: {},
                    // buttons: [
                    //     {
                    //         extend: 'collection',
                    //         text: 'Xuất dữ liệu',
                    //         buttons: ['copy', 'excel', 'csv', 'pdf', 'print'],
                    //         enabled: true
                    //     }
                    // ]
                },
            },
            paging: true,
            processing: true,
            searchDelay: 300,

        };
    }, []);

    useEffect(() => {
        dataTableRef.current?.dt()?.on('click', 'tbody td', function () {
            dataTableRef.current?.dt()?.cell(this)
        });
    }, [])

    return (
        <div className="overflow-x-auto">

            <DataTable
                key="myTable"
                ref={dataTableRef}
                className="w-full table-auto break-words md:overflow-auto md:px-8"
                options={options}
            >
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Danh mục</th>
                        <th>Nội dung</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Cập nhật tồn kho</th>
                    </tr>
                </thead>
            </DataTable>

            <ToastContainer stacked aria-label={""} />
        </div>
    );
}