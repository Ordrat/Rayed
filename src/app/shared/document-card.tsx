"use client";

import { PiFileTextDuotone, PiEyeBold } from "react-icons/pi";
import { Badge, Button, Text, Title, Popover } from "rizzui";
import { useTranslations } from "next-intl";
import { getDocumentUrl } from "@/config/constants";

interface DocumentCardProps {
  title: string;
  statusLabel: string;
  statusColor: any;
  documentUrl?: string | null;
  rejectionReason?: string | null;
  onApprove: () => void;
  onReject: () => void;
  isProcessing?: boolean;
  showActions?: boolean;
}

export default function DocumentCard({
  title,
  statusLabel,
  statusColor,
  documentUrl,
  rejectionReason,
  onApprove,
  onReject,
  isProcessing = false,
  showActions = false,
}: DocumentCardProps) {
  const t = useTranslations("common");

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-muted bg-gray-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700">
            <PiFileTextDuotone className="h-6 w-6 text-gray-500" />
          </div>
          <Badge variant="flat" color={statusColor} className="capitalize rounded-md">
            {statusLabel}
          </Badge>
        </div>
        <Title as="h5" className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary">
            {title}
        </Title>
        
        {rejectionReason && (
            <Text className="mb-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded">
              {t("Rejection reason")}: {rejectionReason}
            </Text>
        )}
      </div>

      <div className="mt-4 border-t border-muted/50 pt-4">
          <div className="flex gap-3">
             {documentUrl ? (
                <a 
                    href={getDocumentUrl(documentUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                >
                   <Button variant="outline" className="w-full gap-2 dark:bg-gray-700 dark:text-gray-300">
                     <PiEyeBold className="h-4 w-4" /> {t("View Document")}
                   </Button>
                </a>
             ) : (
                <Button variant="outline" disabled className="w-full flex-1">
                   {t("No Document")}
                </Button>
             )}
          </div>

          {showActions && (
             <div className="mt-3 flex gap-2">
                 <Popover placement="top">
                    <Popover.Trigger>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white"
                          disabled={isProcessing}
                        >
                          {t("Approve")}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content className="z-[9999] shadow-xl">
                      {({ setOpen }) => (
                        <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">{t("Approve Document")}?</Title>
                            <Text className="mb-4 text-sm text-gray-500">{t("approve-document-confirm")}</Text>
                            <div className="flex items-center justify-end gap-2">
                                <Button size="sm" onClick={() => { onApprove(); setOpen(false); }} className="bg-green-600 hover:bg-black text-white">{t("text-yes")}</Button>
                                <Button size="sm" variant="outline" onClick={() => setOpen(false)}>{t("text-no")}</Button>
                            </div>
                        </div>
                      )}
                    </Popover.Content>
                 </Popover>

                 <Popover placement="top">
                    <Popover.Trigger>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
                          disabled={isProcessing}
                        >
                          {t("Reject")}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content className="z-[9999] shadow-xl">
                        {({ setOpen }) => (
                           <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">{t("Reject Document")}?</Title>
                            <Text className="mb-4 text-sm text-gray-500">{t("reject-document-confirm")}</Text>
                            <div className="flex items-center justify-end gap-2">
                                <Button size="sm" onClick={() => { onReject(); setOpen(false); }} className="bg-red-600 hover:bg-black text-white">{t("text-yes")}</Button>
                                <Button size="sm" variant="outline" onClick={() => setOpen(false)}>{t("text-no")}</Button>
                            </div>
                        </div>
                        )}
                    </Popover.Content>
                 </Popover>
             </div>
          )}
      </div>
    </div>
  );
}
