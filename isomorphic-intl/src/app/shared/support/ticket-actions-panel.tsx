'use client';

/**
 * Ticket Actions Panel
 * Allows support agents to view and add actions to a ticket
 */

import { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Button,
  Select,
  Textarea,
  Input,
  Badge,
  Loader,
} from 'rizzui';
import {
  PiPlusBold,
  PiCurrencyDollarBold,
  PiGiftBold,
  PiWarningBold,
  PiProhibitBold,
  PiNoteBold,
  PiArrowUpBold,
  PiArrowsClockwiseBold,
} from 'react-icons/pi';
import {
  ActionType,
  CompensationType,
  ActionTypeLabels,
  CompensationTypeLabels,
} from '@/types/firebase.enums';
import { TicketAction, AddTicketActionRequest } from '@/types/support-ticket.types';
import { getTicketActions, addTicketAction } from '@/services/support-ticket.service';
import toast from 'react-hot-toast';

interface TicketActionsPanelProps {
  ticketId: string;
  token: string;
  locale?: string;
  isClosed?: boolean;
}

const actionIcons: Record<ActionType, React.ReactNode> = {
  [ActionType.Refund]: <PiCurrencyDollarBold className="h-4 w-4" />,
  [ActionType.Reorder]: <PiArrowsClockwiseBold className="h-4 w-4" />,
  [ActionType.Compensation]: <PiGiftBold className="h-4 w-4" />,
  [ActionType.Warning]: <PiWarningBold className="h-4 w-4" />,
  [ActionType.Ban]: <PiProhibitBold className="h-4 w-4" />,
  [ActionType.Note]: <PiNoteBold className="h-4 w-4" />,
  [ActionType.EscalateToManager]: <PiArrowUpBold className="h-4 w-4" />,
};

const actionColors: Record<ActionType, string> = {
  [ActionType.Refund]: 'bg-green-100 text-green-700',
  [ActionType.Reorder]: 'bg-blue-100 text-blue-700',
  [ActionType.Compensation]: 'bg-purple-100 text-purple-700',
  [ActionType.Warning]: 'bg-yellow-100 text-yellow-700',
  [ActionType.Ban]: 'bg-red-100 text-red-700',
  [ActionType.Note]: 'bg-gray-100 text-gray-700',
  [ActionType.EscalateToManager]: 'bg-orange-100 text-orange-700',
};

export function TicketActionsPanel({
  ticketId,
  token,
  locale = 'en',
  isClosed = false,
}: TicketActionsPanelProps) {
  const lang = locale === 'ar' ? 'ar' : 'en';
  
  const [actions, setActions] = useState<TicketAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [actionDetails, setActionDetails] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [compensationType, setCompensationType] = useState<CompensationType | null>(null);
  const [compensationValue, setCompensationValue] = useState<number>(0);

  // Action type options for select
  const actionTypeOptions = Object.values(ActionType)
    .filter(v => typeof v === 'number')
    .map(type => ({
      value: type,
      label: ActionTypeLabels[type as ActionType]?.[lang] || String(type),
    }));

  // Compensation type options for select
  const compensationTypeOptions = Object.values(CompensationType)
    .filter(v => typeof v === 'number')
    .map(type => ({
      value: type,
      label: CompensationTypeLabels[type as CompensationType]?.[lang] || String(type),
    }));

  useEffect(() => {
    fetchActions();
  }, [ticketId]);

  const fetchActions = async () => {
    try {
      setIsLoading(true);
      const data = await getTicketActions(ticketId, token);
      setActions(data || []);
    } catch (error: any) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAction = async () => {
    if (!actionType) {
      toast.error(lang === 'ar' ? 'اختر نوع الإجراء' : 'Select action type');
      return;
    }

    setIsAdding(true);
    try {
      const request: AddTicketActionRequest = {
        actionType: actionType,
        actionDetails: actionDetails || undefined,
      };

      if (actionType === ActionType.Refund && refundAmount > 0) {
        request.refundAmount = refundAmount;
      }

      if (actionType === ActionType.Compensation && compensationType) {
        request.compensationType = compensationType;
        request.compensationValue = compensationValue;
      }

      const newAction = await addTicketAction(ticketId, request, token);
      setActions(prev => [newAction, ...prev]);
      toast.success(lang === 'ar' ? 'تم إضافة الإجراء' : 'Action added successfully');
      
      // Reset form
      setShowAddForm(false);
      setActionType(null);
      setActionDetails('');
      setRefundAmount(0);
      setCompensationType(null);
      setCompensationValue(0);
    } catch (error: any) {
      toast.error(error.message || (lang === 'ar' ? 'فشل إضافة الإجراء' : 'Failed to add action'));
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <Title as="h4" className="text-lg font-semibold">
          {lang === 'ar' ? 'سجل الإجراءات' : 'Actions Log'}
        </Title>
        {!isClosed && !showAddForm && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="bg-primary"
          >
            <PiPlusBold className="me-1 h-4 w-4" />
            {lang === 'ar' ? 'إضافة إجراء' : 'Add Action'}
          </Button>
        )}
      </div>

      {/* Add Action Form */}
      {showAddForm && (
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
          <div className="space-y-4">
            {/* Action Type */}
            <Select
              options={actionTypeOptions}
              value={actionType ? { value: actionType, label: ActionTypeLabels[actionType]?.[lang] } : null}
              onChange={(option: any) => setActionType(option?.value)}
              placeholder={lang === 'ar' ? 'نوع الإجراء...' : 'Action type...'}
              label={lang === 'ar' ? 'نوع الإجراء' : 'Action Type'}
            />

            {/* Refund Amount (if Refund selected) */}
            {actionType === ActionType.Refund && (
              <Input
                type="number"
                placeholder="0.00"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                label={lang === 'ar' ? 'مبلغ الاسترداد' : 'Refund Amount'}
                prefix="$"
              />
            )}

            {/* Compensation fields (if Compensation selected) */}
            {actionType === ActionType.Compensation && (
              <>
                <Select
                  options={compensationTypeOptions}
                  value={compensationType ? { value: compensationType, label: CompensationTypeLabels[compensationType]?.[lang] } : null}
                  onChange={(option: any) => setCompensationType(option?.value)}
                  placeholder={lang === 'ar' ? 'نوع التعويض...' : 'Compensation type...'}
                  label={lang === 'ar' ? 'نوع التعويض' : 'Compensation Type'}
                />
                <Input
                  type="number"
                  placeholder="0"
                  value={compensationValue}
                  onChange={(e) => setCompensationValue(parseFloat(e.target.value) || 0)}
                  label={lang === 'ar' ? 'قيمة التعويض' : 'Compensation Value'}
                />
              </>
            )}

            {/* Action Details */}
            <Textarea
              placeholder={lang === 'ar' ? 'تفاصيل الإجراء (اختياري)...' : 'Action details (optional)...'}
              value={actionDetails}
              onChange={(e) => setActionDetails(e.target.value)}
              label={lang === 'ar' ? 'التفاصيل' : 'Details'}
              rows={3}
            />

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setActionType(null);
                  setActionDetails('');
                }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleAddAction}
                isLoading={isAdding}
                className="bg-primary"
              >
                {lang === 'ar' ? 'إضافة' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Actions List */}
      <div className="max-h-[300px] overflow-y-auto">
        {actions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {lang === 'ar' ? 'لا توجد إجراءات بعد' : 'No actions yet'}
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {actions.map((action) => (
              <div key={action.id} className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-full ${actionColors[action.actionType as ActionType] || 'bg-gray-100'}`}>
                    {actionIcons[action.actionType as ActionType] || <PiNoteBold className="h-4 w-4" />}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" size="sm">
                        {ActionTypeLabels[action.actionType as ActionType]?.[lang] || 'Unknown'}
                      </Badge>
                      {action.refundAmount && action.refundAmount > 0 && (
                        <Text className="text-sm text-green-600 font-medium">
                          ${action.refundAmount}
                        </Text>
                      )}
                      {action.compensationType && (
                        <Badge size="sm" color="secondary">
                          {CompensationTypeLabels[action.compensationType as CompensationType]?.[lang]}
                          {action.compensationValue ? `: ${action.compensationValue}` : ''}
                        </Badge>
                      )}
                    </div>
                    {action.actionDetails && (
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        {action.actionDetails}
                      </Text>
                    )}
                    <Text className="text-xs text-gray-400 mt-1">
                      {new Date(action.createdAt).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketActionsPanel;
