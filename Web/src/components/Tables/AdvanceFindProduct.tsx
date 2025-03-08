"use client"
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css'; // Buttons CSS

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Checkbox from '../FormElements/Checkboxes/Checkbox';

import DoubleRangeSlider from '../Slider/MultiRangeSlider';
import dayjs from 'dayjs';
import { debounce, throttle } from 'lodash';
import dynamic from 'next/dynamic';
import { DataTableRef } from 'datatables.net-react';
import { Select } from '../FormElements/select';
import { GlobeIcon } from '@/assets/icons';

const DataTable = dynamic(
    async () => {
        const dtReact = import('datatables.net-react')


        const dtNet = import(`datatables.net-dt`);

        const [reactMod, dtNetMod] = await Promise.all([dtReact, dtNet,

        ]);

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

export default function AdvanceFindProduct() {
    const dataTableRef = useRef<DataTableRef>(null)
    const [isFilterByCreditRange, setIsFilterByCreditRange] = useState(false);
    const [isFilterByCategory, setIsFilterByCategory] = useState(false);

    const [creditRange, setCreditRange] = useState([0, 0])
    const [categorySelected, setCategorySelected] = useState<string>()

    const [commonData, setCommonData] = useState<{ maxPrice: number, minPrice: number, category: string[] } | undefined>(undefined)

    const reloadData = useCallback(debounce(() => {
        dataTableRef.current?.dt()?.ajax.reload()
    }, 1000), [])

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
    const isFilterByCategoryRef = useRef(isFilterByCreditRange)

    const creditRangeRef = useRef(creditRange)
    const categorySelectedRef = useRef(categorySelected)


    useEffect(() => {
        isFilterByCreditRangeRef.current = isFilterByCreditRange
        creditRangeRef.current = creditRange

        isFilterByCategoryRef.current = isFilterByCategory
        categorySelectedRef.current = categorySelected

        let r = false
        if (isFilterByCategory && categorySelected) {
            r = true
        }

        if (r === false && isFilterByCreditRange) {
            r = true
        }

        if (r)
            reloadData()
    }, [isFilterByCreditRange, creditRange, isFilterByCategory, categorySelected])

    const ajaxDataFunc = useRef((d: any) => {

        d.data = {
            price: isFilterByCreditRangeRef.current ? creditRangeRef.current : undefined,
            category: isFilterByCategoryRef.current ? categorySelectedRef.current : undefined,
        }
        if (d?.search?.value) {
            d.search.value = _formatString(d.search.value)
        }
        return JSON.stringify(d); // Convert DataTables data to JSON format
    }).current

    const options = useMemo(() => {
        return {
            order: [],
            scrollCollapse: true,
            scrollY: '200',
            scrollX: true,
            orderMulti: true,
            serverSide: true,
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
                data: 'price', render: function (data: any, type: any, row: any) {
                    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 9 }).format(data)
                },
                // orderData: [0]
            },
            ],
            ajax: {
                url: '/api/product/advanceFind',
                dataSrc: 'data',
                type: 'POST', // Can also be GET depending on your server implementation
                contentType: 'application/json',
                data: ajaxDataFunc,
            },
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
                searchPlaceholder: "Tìm kiếm tương đối theo tên, danh mục và mô tả",
                "aria": {
                    // "orderable": "Order by this column",
                    // "orderableReverse": "Reverse order this column"
                }
            },
            layout: {
                topEnd: {
                    search: {
                        processing: true
                    },
                },
                topStart: {
                    pageLength: {

                    },
                    // buttons: [
                    //     {
                    //         extend: 'collection',
                    //         text: 'Xuất dữ liệu',
                    //         buttons: ['copy', 'excel', 'csv', 'pdf', 'print'],
                    //         enabled: true
                    //     }
                    // ]

                }
            },
            paging: true,
            processing: true,
            searchDelay: 300
        }
    }, [])








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

                <div className='basis-1/2'>
                    <div className='mb-5 block'>
                        <Checkbox label='Lọc theo danh mục' isChecked={isFilterByCategory} onChange={setIsFilterByCategory} />
                    </div>
                    <div className='relative pl-3.5 pr-5'>
                        {commonData && <Select
                            items={
                                commonData.category.map(x => ({
                                    label: x, value: x
                                }))
                            }
                            onChange={(v) => {
                                setCategorySelected(v)
                            }}
                            placeholder='Chọn danh mục'
                            prefixIcon={<GlobeIcon />}
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
                    </tr>
                </thead>
            </DataTable>



            <ToastContainer stacked aria-label={''} />
        </div >
    );
}