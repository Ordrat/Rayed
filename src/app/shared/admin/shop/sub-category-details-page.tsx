"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader } from "rizzui";
import { PiPencilBold, PiArrowLeftBold, PiListDashesDuotone } from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getSubCategoryById, deleteSubCategory, getShopCategoryById } from "@/services/shop.service";
import { getDocumentUrl } from "@/config/constants";
import { SubCategory, ShopCategory } from "@/types/shop.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import DeletePopover from "@/app/shared/delete-popover";

interface SubCategoryDetailsPageProps {
  subCategoryId: string;
}

export default function SubCategoryDetailsPage({ subCategoryId }: SubCategoryDetailsPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [parentCategory, setParentCategory] = useState<ShopCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pageHeader = {
    title: subCategory?.name || "Sub Category Details",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Shop", href: "#" },
      { name: "Sub Categories", href: routes.shop.subCategories },
      { name: subCategory?.name || "Details", isStatic: true },
    ],
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSubCategory();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router, subCategoryId]);

  const fetchSubCategory = async () => {
    try {
      setIsLoading(true);
      const data = await getSubCategoryById(subCategoryId, session?.accessToken || "");
      setSubCategory(data);
      
      // Fetch parent category
      if (data.shopCategoryId) {
        try {
          const parentData = await getShopCategoryById(data.shopCategoryId, session?.accessToken || "");
          setParentCategory(parentData);
        } catch {
          // Parent category might not be found
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch sub category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubCategory(subCategoryId, session?.accessToken || "");
      toast.success("Sub category deleted successfully");
      router.push(routes.shop.subCategories);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete sub category");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!subCategory) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">Sub category not found</Text>
        <Link href={routes.shop.subCategories}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            Back to Sub Categories
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} isStaticTitle={true}>
        <div className="flex gap-2">
          <Link href={routes.shop.editSubCategory(subCategoryId)}>
            <Button className="bg-[#1f502a] hover:bg-[#143219]">
              <PiPencilBold className="me-1.5 h-4 w-4" />
              Edit Sub Category
            </Button>
          </Link>
          <DeletePopover
            title="Delete Sub Category"
            description="Are you sure you want to delete this sub category? This action cannot be undone."
            onDelete={handleDelete}
            translateTitle={false}
          />
        </div>
      </PageHeader>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          {/* Icon */}
          <div className="flex-shrink-0">
            {subCategory.iconUrl ? (
              <img
                src={getDocumentUrl(subCategory.iconUrl) || ''}
                alt={subCategory.name}
                className="h-32 w-32 rounded-xl object-cover shadow-md"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                <PiListDashesDuotone className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-grow">
            <div className="mb-4 flex items-center gap-3">
              <Title as="h2" className="text-2xl font-bold">
                {subCategory.name}
              </Title>
              <Badge
                variant="flat"
                color={subCategory.isActive ? "success" : "secondary"}
                className="text-sm"
              >
                {subCategory.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <Text className="mb-1 text-sm text-gray-500">Parent Category</Text>
                <Text className="text-lg font-semibold">
                  {parentCategory?.name || "—"}
                </Text>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <Text className="mb-1 text-sm text-gray-500">Display Order</Text>
                <Text className="text-lg font-semibold">{subCategory.displayOrder}</Text>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <Text className="mb-1 text-sm text-gray-500">Status</Text>
                <Text className="text-lg font-semibold">
                  {subCategory.isActive ? "Active" : "Inactive"}
                </Text>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <Text className="mb-1 text-sm text-gray-500">Created At</Text>
                <Text className="text-lg font-semibold">
                  {new Date(subCategory.createdAt).toLocaleDateString("en-US", {
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
        <Link href={routes.shop.subCategories}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            Back to Sub Categories
          </Button>
        </Link>
      </div>
    </>
  );
}
