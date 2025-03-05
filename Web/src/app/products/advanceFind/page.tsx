import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { InvoiceTable } from "@/components/Tables/invoice-table";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { TopProducts } from "@/components/Tables/top-products";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";

import { Metadata } from "next";
import { Suspense } from "react";
import { getTop10 } from "./fetch";

export const metadata: Metadata = {
  title: "Tìm kiếm Sản phẩm Nâng cao",
};

const AdvanceFindProductPage = async () => {
  // const data = await getTop10()
  // console.log("🚀 ~ AdvanceFindProductPage ~ data:", data)
  return (
    <>
      <Breadcrumb pageName="Tìm kiếm Sản phẩm Nâng cao" />
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Cho phép người dùng tìm kiếm sản phẩm theo từ khóa, danh mục, khoảng giá…
      </h2>

      <div className="space-y-10">
        <Suspense fallback={<TopProductsSkeleton />}>
          <TopProducts />
        </Suspense>
      </div>
    </>
  );
};

export default AdvanceFindProductPage;
