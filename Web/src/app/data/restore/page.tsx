import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { InvoiceTable } from "@/components/Tables/invoice-table";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { TopProducts } from "@/components/Tables/top-products";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Phục hồi Dữ liệu",
};

const DataRestorePage = () => {
    return (
        <>
            <Breadcrumb pageName="Phục hồi Dữ liệu" />
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                Minh họa quá trình phục hồi dữ liệu từ bản sao lưu khi xảy ra sự cố.
            </h2>

            <div className="space-y-10">
            </div>
        </>
    );
};

export default DataRestorePage;
