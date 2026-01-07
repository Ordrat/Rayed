"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Input, Select, ActionIcon, Tooltip } from "rizzui";
import { 
  PiPlusBold, 
  PiMagnifyingGlassBold, 
  PiSortAscendingBold, 
  PiPencilBold, 
  PiTrashBold,
  PiEyeBold,
  PiListDashesDuotone
} from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getAllSubCategories, deleteSubCategory, getAllShopCategories } from "@/services/shop.service";
import { getDocumentUrl } from "@/config/constants";
import { SubCategory, ShopCategory } from "@/types/shop.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import DeletePopover from "@/app/shared/delete-popover";

const pageHeader = {
  title: "Sub Categories",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Shop", href: "#" },
    { name: "Sub Categories" },
  ],
};

export default function SubCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<any>({ value: "newest", label: "Newest First" });
  const [categoryFilter, setCategoryFilter] = useState<any>(null);

  const categoryOptions = useMemo(() => {
    return [
      { label: "All Categories", value: "" },
      ...categories.map((c) => ({ label: c.name, value: c.id })),
    ];
  }, [categories]);

  const filteredSubCategories = useMemo(() => {
    let result = [...subCategories];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(term));
    }

    // Filter by category
    if (categoryFilter?.value) {
      result = result.filter((c) => c.shopCategoryId === categoryFilter.value);
    }

    // Sort
    if (sortConfig) {
      const sortValue = sortConfig.value || sortConfig;
      result.sort((a, b) => {
        if (sortValue === "newest") return b.createdAt.localeCompare(a.createdAt);
        if (sortValue === "oldest") return a.createdAt.localeCompare(b.createdAt);
        if (sortValue === "name_asc") return a.name.localeCompare(b.name);
        if (sortValue === "name_desc") return b.name.localeCompare(a.name);
        if (sortValue === "order") return a.displayOrder - b.displayOrder;
        return 0;
      });
    }
    return result;
  }, [subCategories, searchTerm, sortConfig, categoryFilter]);

  // Get category name by ID
  const getCategoryName = useCallback((categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  }, [categories]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subCatsData, catsData] = await Promise.all([
        getAllSubCategories(session?.accessToken || ""),
        getAllShopCategories(session?.accessToken || ""),
      ]);
      setSubCategories(subCatsData);
      setCategories(catsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteSubCategory(id, session?.accessToken || "");
      setSubCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Sub category deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete sub category");
    }
  }, [session?.accessToken]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link href={routes.shop.createSubCategory}>
          <Button className="mt-4 w-full bg-[#1f502a] hover:bg-[#143219] sm:mt-0 sm:w-auto">
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add Sub Category
          </Button>
        </Link>
      </PageHeader>

      {subCategories.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by name..."
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/4"
            clearable
            onClear={() => setSearchTerm("")}
          />
          <div className="flex gap-3">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="w-full md:w-48"
              placeholder="Filter by Category"
            />
            <Select
              options={[
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" },
                { label: "Name (A-Z)", value: "name_asc" },
                { label: "Name (Z-A)", value: "name_desc" },
                { label: "Display Order", value: "order" },
              ]}
              value={sortConfig}
              onChange={setSortConfig}
              className="w-full md:w-48"
              prefix={<PiSortAscendingBold className="h-4 w-4" />}
            />
          </div>
        </div>
      )}

      {subCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <PiListDashesDuotone className="mb-4 h-16 w-16 text-gray-400" />
          <Text className="mb-4 text-gray-500">
            No sub categories found. Create one to get started.
          </Text>
          <Link href={routes.shop.createSubCategory}>
            <Button className="bg-[#1f502a] hover:bg-[#143219]">
              <PiPlusBold className="me-1.5 h-4 w-4" />
              Create First Sub Category
            </Button>
          </Link>
        </div>
      ) : filteredSubCategories.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <Text className="mb-2">No results found for &quot;{searchTerm}&quot;</Text>
          <Button variant="text" onClick={() => { setSearchTerm(""); setCategoryFilter(null); }} className="text-[#1f502a]">Clear Filters</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Parent Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Display Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredSubCategories.map((subCategory) => (
                <tr key={subCategory.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    {subCategory.iconUrl ? (
                      <img
                        src={getDocumentUrl(subCategory.iconUrl) || ''}
                        alt={subCategory.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                        <PiListDashesDuotone className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Text className="font-medium">{subCategory.name}</Text>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant="flat" color="info">
                      {getCategoryName(subCategory.shopCategoryId)}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Text>{subCategory.displayOrder}</Text>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge
                      variant="flat"
                      color={subCategory.isActive ? "success" : "secondary"}
                    >
                      {subCategory.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Text className="text-sm text-gray-500">
                      {new Date(subCategory.createdAt).toLocaleDateString()}
                    </Text>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip content="View Details" placement="top">
                        <Link href={routes.shop.subCategoryDetails(subCategory.id)}>
                          <ActionIcon
                            variant="outline"
                            className="hover:border-green-600 hover:text-green-600"
                          >
                            <PiEyeBold className="h-4 w-4" />
                          </ActionIcon>
                        </Link>
                      </Tooltip>
                      <Tooltip content="Edit" placement="top">
                        <Link href={routes.shop.editSubCategory(subCategory.id)}>
                          <ActionIcon
                            variant="outline"
                            className="hover:border-blue-600 hover:text-blue-600"
                          >
                            <PiPencilBold className="h-4 w-4" />
                          </ActionIcon>
                        </Link>
                      </Tooltip>
                      <DeletePopover
                        title="Delete Sub Category"
                        description="Are you sure you want to delete this sub category?"
                        onDelete={() => handleDelete(subCategory.id)}
                        translateTitle={false}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
