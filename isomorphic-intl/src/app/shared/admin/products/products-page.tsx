"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Popover, Input, Select } from "rizzui";
import { PiEyeBold, PiCheckCircleBold, PiXCircleBold, PiMagnifyingGlassBold, PiSortAscendingBold, PiTrashBold, PiFunnelBold } from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getDocumentUrl } from "@/config/constants";
import { getAllProducts, approveProduct, rejectProduct, deleteProduct } from "@/services/product.service";
import {
  Product,
  ProductStatus,
  getProductStatusLabel,
  getProductStatusBadgeColor,
} from "@/types/product.types";
import PageHeader from "@/app/shared/page-header";
import DeletePopover from "@/app/shared/delete-popover";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("common");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<any>(null);

  const pageHeader = {
    title: "Products Management",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Products" },
    ],
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.shopName.toLowerCase().includes(term) ||
          p.categoryName.toLowerCase().includes(term)
      );
    }

    // Status filtering is now done server-side via the API

    if (sortConfig) {
      const sortValue = sortConfig.value || sortConfig;
      result.sort((a, b) => {
        if (sortValue === "newest") return b.createdAt.localeCompare(a.createdAt);
        if (sortValue === "oldest") return a.createdAt.localeCompare(b.createdAt);
        if (sortValue === "name_asc") return a.name.localeCompare(b.name);
        if (sortValue === "name_desc") return b.name.localeCompare(a.name);
        if (sortValue === "price_asc") return a.basePrice - b.basePrice;
        if (sortValue === "price_desc") return b.basePrice - a.basePrice;
        return 0;
      });
    }
    return result;
  }, [products, searchTerm, sortConfig]);

  const fetchProducts = useCallback(async (statusValue?: number | null) => {
    try {
      setIsLoading(true);
      const data = await getAllProducts(session?.accessToken || "", statusValue);
      setProducts(data);
    } catch (error: any) {
      toast.error(error.message || t("failed-to-fetch-products"));
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, t]);

  useEffect(() => {
    if (status === "authenticated") {
      // Get all products on initial load (no status filter)
      fetchProducts(null);
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [status, fetchProducts, router]);

  // Refetch products when status filter changes
  useEffect(() => {
    if (status === "authenticated" && statusFilter !== null) {
      const statusValue = statusFilter?.value === "all" ? null : parseInt(statusFilter?.value);
      fetchProducts(statusValue);
    }
  }, [statusFilter, status, fetchProducts]);

  const handleApprove = async (productId: string) => {
    setProcessingId(productId);
    try {
      await approveProduct(productId, session?.accessToken || "");
      setProducts(
        products.map((p) =>
          p.id === productId
            ? { ...p, status: ProductStatus.APPROVED }
            : p
        )
      );
      toast.success(t("product-approved-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-approve-product"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (productId: string) => {
    setProcessingId(productId);
    try {
      await rejectProduct(productId, session?.accessToken || "");
      setProducts(
        products.map((p) =>
          p.id === productId
            ? { ...p, status: ProductStatus.REJECTED }
            : p
        )
      );
      toast.success(t("product-rejected-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-reject-product"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (productId: string) => {
    setProcessingId(productId);
    try {
      await deleteProduct(productId, session?.accessToken || "");
      setProducts(products.filter((p) => p.id !== productId));
      toast.success(t("product-deleted-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-delete-product"));
    } finally {
      setProcessingId(null);
    }
  };

  const getPrimaryImage = (product: Product): string | null => {
    const primaryImage = product.productImages?.find((img) => img.isPrimary);
    if (primaryImage?.imageUrl) {
      return getDocumentUrl(primaryImage.imageUrl);
    }
    if (product.productImages?.length > 0 && product.productImages[0]?.imageUrl) {
      return getDocumentUrl(product.productImages[0].imageUrl);
    }
    return null;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      {products.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder={t("search-by-name")}
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3"
            clearable
            onClear={() => setSearchTerm("")}
          />
          <div className="flex gap-2">
            <Select
              options={[
                { label: t("All Products"), value: "all" },
                { label: t("Pending"), value: String(ProductStatus.PENDING) },
                { label: t("Approved"), value: String(ProductStatus.APPROVED) },
                { label: t("Rejected"), value: String(ProductStatus.REJECTED) },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full md:w-52"
              prefix={<PiFunnelBold className="h-4 w-4" />}
              placeholder={t("Filter by Status")}
            />
            <Select
              options={[
                { label: t("Newest First"), value: "newest" },
                { label: t("Oldest First"), value: "oldest" },
                { label: t("Name (A-Z)"), value: "name_asc" },
                { label: t("Name (Z-A)"), value: "name_desc" },
                { label: t("Price (Low to High)"), value: "price_asc" },
                { label: t("Price (High to Low)"), value: "price_desc" },
              ]}
              value={sortConfig}
              onChange={setSortConfig}
              className="w-full md:w-48"
              prefix={<PiSortAscendingBold className="h-4 w-4" />}
              placeholder={t("Sort By")}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="mb-4">
              <PiMagnifyingGlassBold className="h-16 w-16 text-gray-400" />
            </div>
            <Text className="text-xl font-medium text-gray-900">
              {t("no-products-found")}
            </Text>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
             {searchTerm ? (
               <Text className="mb-2">{t("no-results-found-for")} &quot;{searchTerm}&quot;</Text>
             ) : (
               <Text className="mb-2">{t("no-products-found")}</Text>
             )}
             <Button variant="text" onClick={() => { setSearchTerm(""); setStatusFilter(null); }} className="text-[#1f502a]">{t("Clear Search")}</Button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Product Image */}
              <div className="mb-4 relative h-48 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                {getPrimaryImage(product) ? (
                  <Image
                    src={getPrimaryImage(product)!}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <Text>{t("No Image")}</Text>
                  </div>
                )}
              </div>

              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <Title as="h4" className="mb-1 text-lg font-semibold line-clamp-1">
                    {product.name}
                  </Title>
                  <Text className="text-sm text-gray-500">{product.shopName}</Text>
                </div>
                <Badge
                  variant="flat"
                  color={getProductStatusBadgeColor(product.status)}
                  className="capitalize"
                >
                  {t(getProductStatusLabel(product.status))}
                </Badge>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">{t("Category")}:</Text>
                  <Text className="font-medium">{product.categoryName}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">{t("Base Price")}:</Text>
                  <Text className="font-medium">
                    {product.basePrice.toFixed(2)} {t("SAR")}
                  </Text>
                </div>
                {product.discountedPrice > 0 && product.discountedPrice < product.basePrice && (
                  <div className="flex justify-between text-sm">
                    <Text className="text-gray-500">{t("Discounted Price")}:</Text>
                    <Text className="font-medium text-green-600">
                      {product.discountedPrice.toFixed(2)} {t("SAR")}
                    </Text>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">{t("Rating")}:</Text>
                  <Text className="font-medium">
                    {product.averageRating.toFixed(1)} ⭐
                  </Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">{t("Total Orders")}:</Text>
                  <Text className="font-medium">{product.totalOrders}</Text>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={routes.products.details(product.id)} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full hover:border-green-600 hover:text-green-600"
                  >
                    <PiEyeBold className="me-1.5 h-4 w-4" />
                    {t("View")}
                  </Button>
                </Link>
                {product.status === ProductStatus.PENDING && (
                  <>
                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-green-700 border-transparent"
                          disabled={processingId === product.id}
                          isLoading={processingId === product.id}
                        >
                          <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                          {t("Approve")}
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content className="z-[9999] shadow-xl">
                        {({ setOpen }) => (
                          <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">{t("Approve Product")}?</Title>
                            <Text className="mb-4 text-sm text-gray-500">{t("approve-product-confirm")}</Text>
                            <div className="flex items-center justify-end">
                              <Button 
                                size="sm"
                                className="me-1.5 h-7 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                                onClick={() => { 
                                  handleApprove(product.id); 
                                  setOpen(false); 
                                }}
                              >
                                {t("text-yes")}
                              </Button>
                              <Button size="sm" variant="outline" className="h-7" onClick={() => setOpen(false)}>{t("text-no")}</Button>
                            </div>
                          </div>
                        )}
                      </Popover.Content>
                    </Popover>

                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
                          disabled={processingId === product.id}
                          isLoading={processingId === product.id}
                        >
                          <PiXCircleBold className="me-1.5 h-4 w-4" />
                          {t("Reject")}
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content className="z-[9999] shadow-xl">
                        {({ setOpen }) => (
                          <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">{t("Reject Product")}?</Title>
                            <Text className="mb-4 text-sm text-gray-500">{t("reject-product-confirm")}</Text>
                            <div className="flex items-center justify-end">
                              <Button 
                                size="sm"
                                className="me-1.5 h-7 bg-red-600 text-white hover:bg-black hover:text-white active:bg-red-700"
                                onClick={() => { 
                                  handleReject(product.id); 
                                  setOpen(false); 
                                }}
                              >
                                {t("text-yes")}
                              </Button>
                              <Button size="sm" variant="outline" className="h-7" onClick={() => setOpen(false)}>{t("text-no")}</Button>
                            </div>
                          </div>
                        )}
                      </Popover.Content>
                    </Popover>
                  </>
                )}
              </div>

              {/* Delete button */}
              <div className="mt-2">
                <DeletePopover
                  title="Delete Product"
                  description={t("delete-product-confirm-message")}
                  onDelete={() => handleDelete(product.id)}
                  translateTitle={false}
                >
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50 hover:border-red-600"
                    disabled={processingId === product.id}
                  >
                    <PiTrashBold className="me-1.5 h-4 w-4" />
                    {t("Delete")}
                  </Button>
                </DeletePopover>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
