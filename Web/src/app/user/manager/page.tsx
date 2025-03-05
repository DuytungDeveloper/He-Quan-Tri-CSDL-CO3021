import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { InvoiceTable } from "@/components/Tables/invoice-table";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { TopProducts } from "@/components/Tables/top-products";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Đăng ký và Quản lý Người dùng",
};

const UserManagerPage = () => {
    return (
        <>
            <Breadcrumb pageName="Đăng ký và Quản lý Người dùng" />
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                Quản lý thông tin người dùng cho việc đặt hàng.
            </h2>

            <div className="space-y-10">
                <Suspense fallback={<TopProductsSkeleton />}>
                    <TopProducts />
                </Suspense>
            </div>
        </>
    );
};

export default UserManagerPage;
