"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader } from "rizzui";
import { PiPencilBold, PiArrowLeftBold, PiGridFourDuotone } from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getShopCategoryById, deleteShopCategory } from "@/services/shop.service";
import { getDocumentUrl } from "@/config/constants";
import { ShopCategory } from "@/types/shop.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import DeletePopover from "@/app/shared/delete-popover";
import Image from "next/image";

interface ShopCategoryDetailsPageProps {
  categoryId: string;
}

export default function ShopCategoryDetailsPage({ categoryId }: ShopCategoryDetailsPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState<ShopCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pageHeader = {
    title: category?.name || "Category Details",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Shop", href: "#" },
      { name: "Categories", href: routes.shop.categories },
      { name: category?.name || "Details", isStatic: true },
    ],
  };

  const fetchCategory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getShopCategoryById(categoryId, session?.accessToken || "");
      setCategory(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch category");
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, session?.accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategory();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [status, fetchCategory, router]);

  const handleDelete = async () => {
    try {
      await deleteShopCategory(categoryId, session?.accessToken || "");
      toast.success("Category deleted successfully");
      router.push(routes.shop.categories);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">Category not found</Text>
        <Link href={routes.shop.categories}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} isStaticTitle={true}>
        <div className="flex gap-2">
          <Link href={routes.shop.editCategory(categoryId)}>
            <Button className="bg-[#1f502a] hover:bg-[#143219]">
              <PiPencilBold className="me-1.5 h-4 w-4" />
              Edit Category
            </Button>
          </Link>
          <DeletePopover
            title="Delete Category"
            description="Are you sure you want to delete this category? This action cannot be undone."
            onDelete={handleDelete}
            translateTitle={false}
          />
        </div>
      </PageHeader>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          {/* Category Icon */}
          <div className="flex-shrink-0">
            {category.iconUrl ? (
              <div className="relative h-32 w-32">
                <Image
                  src={getDocumentUrl(category.iconUrl) || ''}
                  alt={category.name}
                  fill
                  className="rounded-xl object-cover shadow-md"
                  sizes="128px"
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                <PiGridFourDuotone className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Category Details */}
          <div className="flex-grow">
            <div className="mb-4 flex items-center gap-3">
              <Title as="h2" className="text-2xl font-bold">
                {category.name}
              </Title>
              <Badge
                variant="flat"
                color={category.isActive ? "success" : "secondary"}
                className="text-sm"
              >
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <Text className="mb-1 text-sm text-gray-500">Display Order</Text>
                <Text className="text-lg font-semibold">{category.displayOrder}</Text>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <Text className="mb-1 text-sm text-gray-500">Status</Text>
                <Text className="text-lg font-semibold">
                  {category.isActive ? "Active" : "Inactive"}
                </Text>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <Text className="mb-1 text-sm text-gray-500">Created At</Text>
                <Text className="text-lg font-semibold">
                  {new Date(category.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Link href={routes.shop.categories}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>
    </>
  );
}
