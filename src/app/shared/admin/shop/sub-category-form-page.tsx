"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Button, Loader, Input, Switch, Select } from "rizzui";
import { PiArrowLeftBold, PiFloppyDiskBold, PiUploadSimple } from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { 
  createSubCategory, 
  updateSubCategory, 
  getSubCategoryById, 
  getAllShopCategories 
} from "@/services/shop.service";
import { getDocumentUrl } from "@/config/constants";
import { SubCategory, ShopCategory } from "@/types/shop.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import cn from "@core/utils/class-names";

interface SubCategoryFormPageProps {
  subCategoryId?: string;
  isEdit?: boolean;
}

export default function SubCategoryFormPage({ subCategoryId, isEdit = false }: SubCategoryFormPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({ label: c.name, value: c.id }));
  }, [categories]);

  const pageHeader = {
    title: isEdit ? "Edit Sub Category" : "Create Sub Category",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Shop", href: "#" },
      { name: "Sub Categories", href: routes.shop.subCategories },
      { name: isEdit ? "Edit" : "Create" },
    ],
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router, subCategoryId, isEdit]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch categories first
      const catsData = await getAllShopCategories(session?.accessToken || "");
      setCategories(catsData);
      
      // If editing, fetch the subcategory
      if (isEdit && subCategoryId) {
        const data = await getSubCategoryById(subCategoryId, session?.accessToken || "");
        setSubCategory(data);
        // Populate form fields
        setNameEn(data.name || "");
        setNameAr(data.name || "");
        setDisplayOrder(data.displayOrder || 0);
        setIsActive(data.isActive);
        if (data.iconUrl) {
          setIconPreview(getDocumentUrl(data.iconUrl));
        }
        // Set selected category
        const cat = catsData.find((c) => c.id === data.shopCategoryId);
        if (cat) {
          setSelectedCategory({ label: cat.name, value: cat.id });
        }
      }
    } catch (error: any) {
      toast.error(error.message || t("failed-to-fetch-sub-category"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim() || !nameAr.trim()) {
      toast.error(t("please-fill-required-fields"));
      return;
    }

    if (!selectedCategory?.value) {
      toast.error(t("please-select-parent-category"));
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("ShopCategoryId", selectedCategory.value);
      formData.append("NameEn", nameEn);
      formData.append("NameAr", nameAr);
      formData.append("DisplayOrder", displayOrder.toString());
      formData.append("IsActive", isActive.toString());
      if (iconFile) {
        formData.append("Icon", iconFile);
      }

      if (isEdit && subCategoryId) {
        await updateSubCategory(subCategoryId, formData, session?.accessToken || "");
        toast.success(t("sub-category-updated-successfully"));
      } else {
        await createSubCategory(formData, session?.accessToken || "");
        toast.success(t("sub-category-created-successfully"));
      }
      router.push(routes.shop.subCategories);
    } catch (error: any) {
      toast.error(error.message || (isEdit ? t("failed-to-update-sub-category") : t("failed-to-create-sub-category")));
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Icon Upload */}
          <div>
            <Text className="mb-2 font-medium">{t("Sub Category Icon")}</Text>
            <div className="flex flex-col gap-2">
              <div 
                onClick={handleIconClick}
                className={cn(
                  "relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-[#1f502a] hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700",
                  !iconPreview && "bg-gray-50 dark:bg-gray-800"
                )}
              >
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <PiUploadSimple className="h-8 w-8 mb-1" />
                    <span className="text-xs font-medium">{t("Choose File")}</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="hidden"
                />
              </div>
              <Text className="text-xs text-gray-500">
                {t("recommended-image-size")}
              </Text>
            </div>
          </div>

          {/* Parent Category */}
          <div>
            <Select
              label={t("Parent Category") + " *"}
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder={t("select-parent-category")}
            />
          </div>

          {/* Name (English) */}
          <div>
            <Input
              label={t("Name (English)") + " *"}
              placeholder={t("enter-sub-category-name-english")}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
            />
          </div>

          {/* Name (Arabic) */}
          <div>
            <Input
              label={t("Name (Arabic)") + " *"}
              placeholder="أدخل اسم الفئة الفرعية بالعربية"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              required
              dir="rtl"
            />
          </div>

          {/* Display Order */}
          <div>
            <Input
              type="number"
              label={t("Display Order")}
              placeholder={t("enter-display-order")}
              value={displayOrder.toString()}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              min={0}
              helperText={t("display-order-helper-text")}
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-4">
            <Switch
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
            <Text className="font-medium">{t("Active")}</Text>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link href={routes.shop.subCategories}>
              <Button variant="outline" type="button">
                <PiArrowLeftBold className="me-1.5 h-4 w-4" />
                {t("Cancel")}
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-[#1f502a] hover:bg-[#143219]"
              isLoading={isSubmitting}
            >
              <PiFloppyDiskBold className="me-1.5 h-4 w-4" />
              {isEdit ? t("Update Sub Category") : t("Create Sub Category")}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
