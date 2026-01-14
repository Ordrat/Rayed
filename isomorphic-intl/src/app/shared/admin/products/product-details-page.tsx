"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Popover } from "rizzui";
import {
  PiCheckCircleBold,
  PiXCircleBold,
  PiArrowLeftBold,
  PiTrashBold,
  PiStarFill,
  PiShoppingCartBold,
  PiTagBold,
} from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getDocumentUrl } from "@/config/constants";
import {
  getProductById,
  approveProduct,
  rejectProduct,
  deleteProduct,
} from "@/services/product.service";
import {
  Product,
  ProductStatus,
  getProductStatusLabel,
  getProductStatusBadgeColor,
} from "@/types/product.types";
import PageHeader from "@/app/shared/page-header";
import DeletePopover from "@/app/shared/delete-popover";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import WidgetCard from "@core/components/cards/widget-card";

interface ProductDetailsPageProps {
  productId: string;
}

export default function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("common");
  const locale = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const pageHeader = {
    title: product ? product.name : "Product Details",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Products", href: routes.products.list },
      { name: "Details" },
    ],
  };

  const fetchProductDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const productData = await getProductById(productId, session?.accessToken || "");
      setProduct(productData);
    } catch (error: any) {
      toast.error(error.message || t("failed-to-fetch-product"));
    } finally {
      setIsLoading(false);
    }
  }, [productId, session?.accessToken, t]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProductDetails();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [status, fetchProductDetails, router]);

  const handleApprove = async () => {
    if (!product) return;
    setProcessingId("product");
    try {
      await approveProduct(product.id, session?.accessToken || "");
      setProduct({ ...product, status: ProductStatus.APPROVED });
      toast.success(t("product-approved-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-approve-product"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!product) return;
    setProcessingId("product");
    try {
      await rejectProduct(product.id, session?.accessToken || "");
      setProduct({ ...product, status: ProductStatus.REJECTED });
      toast.success(t("product-rejected-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-reject-product"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setProcessingId("product");
    try {
      await deleteProduct(product.id, session?.accessToken || "");
      toast.success(t("product-deleted-successfully"));
      router.push(routes.products.list);
    } catch (error: any) {
      toast.error(error.message || t("failed-to-delete-product"));
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">{t("Product not found")}</Text>
        <Link href={routes.products.list}>
          <Button>
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            {t("Back to Products")}
          </Button>
        </Link>
      </div>
    );
  }

  const productImages = product.productImages?.length > 0 
    ? product.productImages.sort((a, b) => (a.isPrimary ? -1 : 1) - (b.isPrimary ? -1 : 1))
    : [];

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        isStaticTitle={!!product}
      >
        <Link href={routes.products.list}>
          <Button variant="outline" className="mt-4 sm:mt-0">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            {t("Back to Products")}
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Images Section */}
        <WidgetCard title={t("Product Images")}>
          {productImages.length > 0 ? (
            <div>
              {/* Main Image */}
              <div className="relative mb-4 h-80 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                <Image
                  src={getDocumentUrl(productImages[selectedImageIndex]?.imageUrl || "")}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {productImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-[#1f502a] ring-1 ring-[#1f502a]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={getDocumentUrl(image.imageUrl)}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      {image.isPrimary && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1f502a] text-center text-xs text-white">
                          {t("Primary")}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-60 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-700">
              {t("No images available")}
            </div>
          )}
        </WidgetCard>

        {/* Product Info Card */}
        <WidgetCard 
          title={t("Product Information")}
          action={
            <Badge
              variant="flat"
              color={getProductStatusBadgeColor(product.status)}
              className="capitalize"
            >
              {getProductStatusLabel(product.status)}
            </Badge>
          }
        >
          <div className="mb-6">
            <Text className="text-gray-500">{t("Shop")}: <span className="font-medium text-gray-900 dark:text-gray-100">{product.shopName}</span></Text>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Pricing Group */}
            <div className="space-y-4">
              <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Pricing & Sales")}</Title>
              <div>
                <Text className="text-sm text-gray-500">{t("Base Price")}</Text>
                <Text className="text-lg font-medium">{product.basePrice.toFixed(2)} {t("SAR")}</Text>
              </div>
              {product.discountedPrice > 0 && product.discountedPrice < product.basePrice && (
                <div>
                  <Text className="text-sm text-gray-500">{t("Discounted Price")}</Text>
                  <Text className="text-lg font-medium text-green-600">
                    {product.discountedPrice.toFixed(2)} {t("SAR")}
                  </Text>
                </div>
              )}
               <div>
                <Text className="text-sm text-gray-500">{t("Total Orders")}</Text>
                <Text className="font-medium flex items-center gap-1">
                  <PiShoppingCartBold className="text-gray-500" />
                  {product.totalOrders}
                </Text>
              </div>
            </div>

            {/* Details Group */}
            <div className="space-y-4">
              <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Details")}</Title>
              <div>
                <Text className="text-sm text-gray-500">{t("Category")}</Text>
                <Text className="font-medium">{product.categoryName}</Text>
              </div>
              <div>
                <Text className="text-sm text-gray-500">{t("Display Order")}</Text>
                <Text className="font-medium">{product.displayOrder}</Text>
              </div>
              <div>
                <Text className="text-sm text-gray-500">{t("Rating")}</Text>
                <Text className="font-medium flex items-center gap-1">
                  <PiStarFill className="text-yellow-500" />
                  {product.averageRating.toFixed(1)}
                </Text>
              </div>
            </div>

            {/* Status Group */}
             <div className="space-y-4">
              <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Status & Visibility")}</Title>
               <div>
                <Text className="text-sm text-gray-500">{t("Active Status")}</Text>
                <Badge variant="flat" color={product.isActive ? "success" : "danger"}>
                  {product.isActive ? t("Active") : t("Inactive")}
                </Badge>
              </div>
              <div>
                <Text className="text-sm text-gray-500">{t("Featured")}</Text>
                <Badge variant="flat" color={product.isFeatured ? "success" : "secondary"}>
                  {product.isFeatured ? t("Yes") : t("No")}
                </Badge>
              </div>
            </div>

            {/* Meta Group */}
            <div className="space-y-4">
              <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("History")}</Title>
              <div>
                <Text className="text-sm text-gray-500">{t("Created At")}</Text>
                <Text className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                </Text>
              </div>
              {(product.approvedAt || product.approvedByUserName) && (
                <div>
                   <Text className="text-sm text-gray-500">{t("Approval info")}</Text>
                   <div className="flex flex-col text-sm">
                      {product.approvedAt && (
                        <span>{new Date(product.approvedAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}</span>
                      )}
                      {product.approvedByUserName && (
                         <span className="text-gray-500">{t("by")} {product.approvedByUserName}</span>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>

          {product.description && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Text className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Description")}</Text>
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</Text>
            </div>
          )}

          {/* Action Buttons */}
          {product.status === ProductStatus.PENDING && (
            <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Popover placement="top">
                <Popover.Trigger>
                  <Button
                    className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                    disabled={processingId === "product"}
                  >
                    <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                    {t("Approve Product")}
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
                            handleApprove(); 
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
                    variant="outline"
                    className="flex-1 bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
                    disabled={processingId === "product"}
                  >
                    <PiXCircleBold className="me-1.5 h-4 w-4" />
                    {t("Reject Product")}
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
                            handleReject(); 
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
            </div>
          )}

          {/* Delete Button */}
          <div className="mt-4">
            <DeletePopover
              title="Delete Product"
              description={t("delete-product-confirm-message")}
              onDelete={handleDelete}
              translateTitle={false}
            >
              <Button
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50 hover:border-red-600"
                disabled={processingId === "product"}
              >
                <PiTrashBold className="me-1.5 h-4 w-4" />
                {t("Delete Product")}
              </Button>
            </DeletePopover>
          </div>
        </WidgetCard>
      </div>

      {/* Variations Section */}
      {product.variations && product.variations.length > 0 && (
        <WidgetCard title={t("Product Variations")} className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {product.variations.map((variation) => (
              <div
                key={variation.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
              >
                <div className="mb-3 flex items-center justify-between">
                  <Text className="font-medium">
                    {locale === 'ar' ? variation.nameAr : variation.nameEn}
                  </Text>
                  <Badge variant="flat" color={variation.isRequired ? "warning" : "secondary"}>
                    {variation.isRequired ? t("Required") : t("Optional")}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {variation.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm dark:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        {choice.imageUrl && (
                          <div className="relative h-8 w-8 overflow-hidden rounded">
                            <Image
                              src={getDocumentUrl(choice.imageUrl)}
                              alt={locale === 'ar' ? choice.nameAr : choice.nameEn}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        )}
                        <span>{locale === 'ar' ? choice.nameAr : choice.nameEn}</span>
                        {choice.isDefault && (
                          <Badge size="sm" variant="flat" color="success">
                            {t("Default")}
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">
                        +{choice.price.toFixed(2)} {t("SAR")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>
      )}

      {/* Tags Section */}
      {product.tags && product.tags.length > 0 && (
        <WidgetCard 
          title={
            <div className="flex items-center gap-2">
              <PiTagBold className="text-gray-500" />
              {t("Tags")}
            </div>
          }
           className="mt-6"
        >
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="flat"
                className="px-3 py-1"
                style={tag.colorCode ? { backgroundColor: tag.colorCode + '20', color: tag.colorCode } : {}}
              >
                {tag.icon && (
                  <span className="me-1">{tag.icon}</span>
                )}
                {tag.name}
              </Badge>
            ))}
          </div>
        </WidgetCard>
      )}
    </>
  );
}
