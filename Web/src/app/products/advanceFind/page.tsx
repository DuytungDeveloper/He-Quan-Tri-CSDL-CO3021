import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import AdvanceFindProduct from "@/components/Tables/AdvanceFindProduct";
import { InvoiceTable } from "@/components/Tables/invoice-table";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { TopProducts } from "@/components/Tables/top-products";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tìm kiếm Sản phẩm Nâng cao",
};

const AdvanceFindProductPage = async () => {
  return (
    <>
      <Breadcrumb pageName="Tìm kiếm Sản phẩm Nâng cao" />
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Cho phép người dùng tìm kiếm sản phẩm theo từ khóa, danh mục, khoảng giá…
      </h2>

      {/* <div className="space-y-10">
        <Suspense fallback={<TopProductsSkeleton />}>
          <TopProducts />
        </Suspense>
      </div> */}

      <div className="space-y-10 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-6 py-6">
        <Suspense fallback={<TopProductsSkeleton />}>
          <AdvanceFindProduct />
        </Suspense>
      </div>
    </>
  );
};

export default AdvanceFindProductPage;
