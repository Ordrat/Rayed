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
  PiGridFourDuotone
} from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getAllShopCategories, deleteShopCategory } from "@/services/shop.service";
import { getDocumentUrl } from "@/config/constants";
import { ShopCategory } from "@/types/shop.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import DeletePopover from "@/app/shared/delete-popover";

const pageHeader = {
  title: "Shop Categories",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Shop", href: "#" },
    { name: "Categories" },
  ],
};

export default function ShopCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<any>({ value: "newest", label: "Newest First" });

  const filteredCategories = useMemo(() => {
    let result = [...categories];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(term));
    }

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
  }, [categories, searchTerm, sortConfig]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllShopCategories(session?.accessToken || "");
      setCategories(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteShopCategory(id, session?.accessToken || "");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
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
        <Link href={routes.shop.createCategory}>
          <Button className="mt-4 w-full bg-[#1f502a] hover:bg-[#143219] sm:mt-0 sm:w-auto">
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </PageHeader>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by name..."
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3"
            clearable
            onClear={() => setSearchTerm("")}
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
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <PiGridFourDuotone className="mb-4 h-16 w-16 text-gray-400" />
          <Text className="mb-4 text-gray-500">
            No categories found. Create one to get started.
          </Text>
          <Link href={routes.shop.createCategory}>
            <Button className="bg-[#1f502a] hover:bg-[#143219]">
              <PiPlusBold className="me-1.5 h-4 w-4" />
              Create First Category
            </Button>
          </Link>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <Text className="mb-2">No results found for &quot;{searchTerm}&quot;</Text>
          <Button variant="text" onClick={() => setSearchTerm("")} className="text-[#1f502a]">Clear Search</Button>
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
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    {category.iconUrl ? (
                      <img
                        src={getDocumentUrl(category.iconUrl) || ''}
                        alt={category.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                        <PiGridFourDuotone className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Text className="font-medium">{category.name}</Text>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Text>{category.displayOrder}</Text>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge
                      variant="flat"
                      color={category.isActive ? "success" : "secondary"}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Text className="text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </Text>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip content="View Details" placement="top">
                        <Link href={routes.shop.categoryDetails(category.id)}>
                          <ActionIcon
                            variant="outline"
                            className="hover:border-green-600 hover:text-green-600"
                          >
                            <PiEyeBold className="h-4 w-4" />
                          </ActionIcon>
                        </Link>
                      </Tooltip>
                      <Tooltip content="Edit" placement="top">
                        <Link href={routes.shop.editCategory(category.id)}>
                          <ActionIcon
                            variant="outline"
                            className="hover:border-blue-600 hover:text-blue-600"
                          >
                            <PiPencilBold className="h-4 w-4" />
                          </ActionIcon>
                        </Link>
                      </Tooltip>
                      <DeletePopover
                        title="Delete Category"
                        description="Are you sure you want to delete this category?"
                        onDelete={() => handleDelete(category.id)}
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
