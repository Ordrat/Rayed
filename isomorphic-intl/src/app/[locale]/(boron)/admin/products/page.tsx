import { metaObject } from "@/config/site.config";
import ProductsPage from "@/app/shared/admin/products/products-page";

export const metadata = {
  ...metaObject("Products Management"),
};

export default function ProductsListPage() {
  return <ProductsPage />;
}
