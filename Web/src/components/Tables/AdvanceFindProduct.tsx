
"use client"
import $ from 'jquery';
import 'pdfmake/build/pdfmake'; // Required for PDF
import 'pdfmake/build/vfs_fonts'; // Required fonts for PDF
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css'; // Buttons CSS
import { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import DataTableJS, { Api } from 'datatables.net-dt';
import 'datatables.net-buttons';
import 'datatables.net-buttons-dt';
import 'datatables.net-rowreorder-dt';
import 'datatables.net-colreorder-dt';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
import { ToastContainer, toast } from 'react-toastify';
import Checkbox from '../FormElements/Checkboxes/Checkbox';

import DoubleRangeSlider from '../Slider/MultiRangeSlider';
import dayjs from 'dayjs';
import { debounce, throttle } from 'lodash';

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

export default function AdvanceFindProduct() {

    const [dataTable, setDataTable] = useState<Api<any> | undefined>(undefined)
    const dataTableRef = useRef<Api<any> | undefined>(null)
    const [isFilterByCreditRange, setIsFilterByCreditRange] = useState(false);
    const [isFilterByDateRange, setIsFilterByDateRange] = useState(false);
    const [creditRange, setCreditRange] = useState([0, 0])
    const [dateRange, setDateRange] = useState([0, 0])

    const [commonData, setCommonData] = useState<{ maxPrice: number, minPrice: number, category: string[] } | undefined>(undefined)

    const reloadData = useRef(debounce(() => {
        dataTableRef.current?.draw()
    }, 1000)).current

    useEffect(() => {
        if (isFilterByCreditRange) {
            reloadData()
        }
    }, [isFilterByCreditRange, creditRange])

    useEffect(() => {
        if (isFilterByDateRange) {
            reloadData()
        }
    }, [isFilterByDateRange, dateRange])

    useEffect(() => {
        reloadData()
    }, [isFilterByDateRange, isFilterByCreditRange])

    useEffect(() => {
        fetch('/api/common').then(async (rs) => {
            const responseData = await rs.json()
            if (responseData) {

                setCommonData({ ...responseData, minPrice: Number(responseData.minPrice), maxPrice: Number(responseData.maxPrice) })
                setCreditRange([Number(responseData.minPrice), Number(responseData.maxPrice)])
            }
        })
    }, [])

    const isFilterByCreditRangeRef = useRef(isFilterByCreditRange)
    const isFilterByDateRangeRef = useRef(isFilterByDateRange)
    const creditRangeRef = useRef(creditRange)
    const dateRangeRef = useRef(dateRange)

    useEffect(() => {
        isFilterByCreditRangeRef.current = isFilterByCreditRange
        isFilterByDateRangeRef.current = isFilterByDateRange
        creditRangeRef.current = creditRange
        dateRangeRef.current = dateRange
    }, [isFilterByCreditRange, isFilterByDateRange, creditRange, dateRange])

    const ajaxDataFunc = useRef((d: any) => {

        d.data = {
            price: isFilterByCreditRangeRef.current ? creditRangeRef.current : undefined,
            date: isFilterByDateRangeRef.current ? dateRangeRef.current : undefined
        }
        if (d?.search?.value) {
            d.search.value = _formatString(d.search.value)
        }
        return JSON.stringify(d); // Convert DataTables data to JSON format
    }).current

    useEffect(() => {
        // Initialize DataTable only if it hasn't been initialized already
        if (!$.fn.DataTable.isDataTable('#myTable')) {
            // const ta = $('#myTable').DataTable({row});
            const table = new DataTableJS('#myTable', {
                // rowReorder: true, 
                orderMulti: true,
                colReorder: true,
                serverSide: true,
                language: {
                    "decimal": "",
                    "emptyTable": "No data available in table",
                    "info": "Hiển thị từ _START_ đến _END_ trên tổng _TOTAL_ dữ liệu",
                    "infoEmpty": "Showing 0 to 0 of 0 entries",
                    "infoFiltered": "(lọc từ _MAX_ tổng số dữ liệu)",
                    "infoPostFix": "",
                    "thousands": ",",
                    "lengthMenu": "Hiện _MENU_ dữ liệu",
                    "loadingRecords": "Đang tải...",
                    "processing": "",
                    "search": "",
                    "zeroRecords": "No matching records found",
                    "paginate": {
                        "first": "Trang đầu",
                        "last": "Trang cuối",
                        "next": "Trang kế",
                        "previous": "Trang trước"
                    },
                    searchPlaceholder: "Tìm gì cũng được",
                    "aria": {
                        // "orderable": "Order by this column",
                        // "orderableReverse": "Reverse order this column"
                    }
                },
                // stateSave: true, // Lưu trạng thái
                initComplete: function () {

                    const api = (this as any).api();

                    // Add event listener for the "Go" button
                    $('#jump-to-button').on('click', function () {
                        const input = $('#jump-to-page').val();
                        const pageNumber = parseInt(input as any, 10);

                        if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= api.page.info().pages) {
                            // Jump to the specified page (0-indexed in DataTables)
                            api.page(pageNumber - 1).draw('page');
                        } else {
                            toast('Trang không hợp lệ!', { type: 'warning' })
                        }

                    });

                    // $(api.columns().footer()).each(function (index) {
                    //     const column = api.column(index);
                    //     const header = $(this);
                    //     if (!header.find("input").length) {
                    //         const input = $('<input type="text" placeholder="Search" class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent my-2 px-2 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">')
                    //             .appendTo(header)
                    //             .on("keyup change", function () {
                    //                 if (column.search() !== (this as any).value) {
                    //                     column.search((this as any).value).draw();
                    //                 }
                    //             });
                    //     }
                    // });
                },
                scrollCollapse: true,
                scrollY: '200',
                scrollX: true,
                ajax: {
                    url: '/api/product/advanceFind', dataSrc: 'data', type: 'POST', // Can also be GET depending on your server implementation
                    contentType: 'application/json',
                    data: ajaxDataFunc
                },
                columns: [{
                    name: "name",
                    data: 'name',
                    // orderData: [0]
                },
                {
                    data: 'category', name: 'category',
                    // orderData: [0]

                },
                {
                    data: 'description', name: 'description',
                    // orderData: [0]

                },
                {
                    name: 'price',
                    data: 'price', render: function (data, type, row) {
                        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 9 }).format(data)
                    },
                    // orderData: [0]
                },
                ],
                // dom: 'Bftip',
                layout: {
                    topEnd: {
                        search: {
                            processing: true
                        },
                    },
                    topStart: {
                        pageLength: {

                        },
                        buttons: [
                            {
                                extend: 'collection',
                                text: 'Xuất dữ liệu',
                                buttons: ['copy', 'excel', 'csv', 'pdf', 'print'],
                                enabled: true
                            }
                        ]

                    }
                },
                paging: true,
                processing: true
            });
            table.colReorder.enable()
            setDataTable(table)
            dataTableRef.current = table
        }
    }, []);

    return (


        <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-10">
                <div className='basis-1/2'>
                    <div className='mb-5 block'>
                        <Checkbox label='Lọc theo khoản giá' isChecked={isFilterByCreditRange} onChange={setIsFilterByCreditRange} />
                    </div>
                    <div className='relative pl-3.5 pr-5'>
                        {commonData && <DoubleRangeSlider min={commonData.minPrice} max={commonData.maxPrice}
                            initialValues={[1, commonData.maxPrice]}
                            onChange={setCreditRange}
                            step={0.1}
                        />}
                    </div>
                </div>

                {/* <div className='basis-1/2'>
                    <div className='mb-5 block'>
                        <Checkbox label='Lọc theo khoản ngày' isChecked={isFilterByDateRange} onChange={setIsFilterByDateRange} />
                    </div>
                    <div className='relative pl-2.5 pr-9'>
                        {commonData && <DoubleRangeSlider min={new Date(commonData.minDate).getTime()} max={new Date(commonData.maxDate).getTime()}
                            initialValues={[new Date(commonData.minDate).getTime(), new Date(commonData.maxDate).getTime()]}
                            onChange={(v) => {
                                // console.log(dayjs(v[0]).format('DD/MM/YYYY'), dayjs(v[1]).format('DD/MM/YYYY'))
                                setDateRange(v)
                            }}
                            formatValue={(v) => {
                                return dayjs(v).format('DD/MM/YYYY')
                            }}
                            step={86400000}
                        />}
                    </div>
                </div> */}


            </div>



            <table id="myTable" className="w-full table-auto break-words md:overflow-auto md:px-8">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Danh mục</th>
                        <th>Nội dung</th>
                        <th>Giá</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                {/* <tfoot>
                    <tr>
                        <th>Tên</th>
                        <th>Mặt hàng</th>
                        <th>Nội dung</th>
                        <th>Giá</th>
                    </tr>
                </tfoot> */}
            </table>

            <ToastContainer stacked aria-label={''} />
        </div>
    );
}