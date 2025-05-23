import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { InvoiceTable } from "@/components/Tables/invoice-table";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { TopProducts } from "@/components/Tables/top-products";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";

import { Metadata } from "next";
import { Suspense } from "react";
import Orderform from "@/components/Backupdata/Orderform";

export const metadata: Metadata = {
    title: "Đặt hàng",
};

const OrderPlacePage = () => {
    return (
        <>
            <Breadcrumb pageName="Đặt hàng" />
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                Khi người dùng đặt hàng
            </h2>

            <div className="space-y-10">
                <Suspense fallback={<TopProductsSkeleton />}>
                    <Orderform />
                </Suspense>
            </div>
        </>
    );
};

export default OrderPlacePage;
