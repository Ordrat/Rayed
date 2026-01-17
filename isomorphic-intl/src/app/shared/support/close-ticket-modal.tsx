"use client";

/**
 * Close Ticket Modal
 * Modal dialog for entering closure notes when closing a support ticket
 */

import { useState } from "react";
import { Modal, Title, Text, Button, Textarea, Switch } from "rizzui";
import { PiXCircleBold, PiWarningCircleBold } from "react-icons/pi";

interface CloseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { closureNotes: string; archiveMessages: boolean; deleteFirebaseChat: boolean }) => void;
  isLoading?: boolean;
  locale?: string;
}

export function CloseTicketModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  locale = "en",
}: CloseTicketModalProps) {
  const isArabic = locale === "ar";
  const [closureNotes, setClosureNotes] = useState("");
  const [archiveMessages, setArchiveMessages] = useState(true);
  const [deleteFirebaseChat, setDeleteFirebaseChat] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    // Validate closure notes
    if (!closureNotes.trim()) {
      setError(isArabic ? "يرجى إدخال ملاحظات الإغلاق" : "Please enter closure notes");
      return;
    }

    setError("");
    onConfirm({
      closureNotes: closureNotes.trim(),
      archiveMessages,
      deleteFirebaseChat,
    });
  };

  const handleClose = () => {
    // Reset form state
    setClosureNotes("");
    setArchiveMessages(true);
    setDeleteFirebaseChat(false);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} containerClassName="max-w-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <PiXCircleBold className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <Title as="h4" className="font-bold text-gray-900 dark:text-white">
              {isArabic ? "إغلاق التذكرة" : "Close Ticket"}
            </Title>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {isArabic
                ? "أدخل ملاحظات الإغلاق قبل إغلاق هذه التذكرة"
                : "Enter closure notes before closing this ticket"}
            </Text>
          </div>
        </div>

        {/* Closure Notes Input */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? "ملاحظات الإغلاق *" : "Closure Notes *"}
            </label>
            <Textarea
              value={closureNotes}
              onChange={(e) => {
                setClosureNotes(e.target.value);
                if (error) setError("");
              }}
              placeholder={
                isArabic
                  ? "أدخل سبب إغلاق التذكرة أو ملخص الحل..."
                  : "Enter the reason for closing or resolution summary..."
              }
              rows={4}
              className={`w-full ${error ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {error && (
              <div className="mt-2 flex items-center gap-1 text-sm text-red-500">
                <PiWarningCircleBold className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium text-gray-700 dark:text-gray-300">
                  {isArabic ? "أرشفة الرسائل" : "Archive Messages"}
                </Text>
                <Text className="text-xs text-gray-500">
                  {isArabic ? "حفظ سجل الدردشة في قاعدة البيانات" : "Save chat history to database"}
                </Text>
              </div>
              <Switch
                checked={archiveMessages}
                onChange={() => setArchiveMessages(!archiveMessages)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium text-gray-700 dark:text-gray-300">
                  {isArabic ? "حذف دردشة Firebase" : "Delete Firebase Chat"}
                </Text>
                <Text className="text-xs text-gray-500">
                  {isArabic ? "حذف الدردشة الحية من Firebase" : "Remove live chat from Firebase"}
                </Text>
              </div>
              <Switch
                checked={deleteFirebaseChat}
                onChange={() => setDeleteFirebaseChat(!deleteFirebaseChat)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-gray-200 hover:border-gray-300"
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleConfirm}
            isLoading={isLoading}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <PiXCircleBold className="h-4 w-4" />
            {isArabic ? "إغلاق التذكرة" : "Close Ticket"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
