import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { InvoiceTable } from "@/components/Tables/invoice-table";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { TopProducts } from "@/components/Tables/top-products";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Sao lưu dữ liệu",
};

const DataBackupPage = () => {
    return (
        <>
            <Breadcrumb pageName="Sao lưu dữ liệu" />
            <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
                Đảm bảo dữ liệu của hệ thống có thể được sao lưu định kỳ để phòng ngừa mất mát.
            </h2>

            <div className="space-y-10">
            </div>
        </>
    );
};

export default DataBackupPage;
