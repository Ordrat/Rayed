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
  PiXCircleBold,
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

// ... imports remain the same

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
  // ... existing state ...
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [actionDetails, setActionDetails] = useState('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [compensationType, setCompensationType] = useState<CompensationType | null>(null);
  const [compensationValue, setCompensationValue] = useState<string>('');

  // ... options and fetch logic remain same ...
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

      if (actionType === ActionType.Refund && refundAmount) {
        const parsedAmount = parseFloat(refundAmount);
        if (parsedAmount > 0) {
          request.refundAmount = parsedAmount;
        }
      }

      if (actionType === ActionType.Compensation && compensationType) {
        request.compensationType = compensationType;
        const parsedValue = parseFloat(compensationValue);
        if (parsedValue > 0) {
          request.compensationValue = parsedValue;
        }
      }

      const newAction = await addTicketAction(ticketId, request, token);
      setActions(prev => [newAction, ...prev]);
      toast.success(lang === 'ar' ? 'تم إضافة الإجراء' : 'Action added successfully');
      
      // Reset form
      setShowAddForm(false);
      setActionType(null);
      setActionDetails('');
      setRefundAmount('');
      setCompensationType(null);
      setCompensationValue('');
    } catch (error: any) {
      toast.error(error.message || (lang === 'ar' ? 'فشل إضافة الإجراء' : 'Failed to add action'));
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <PiNoteBold className="w-5 h-5 text-gray-500" />
          <Title as="h4" className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'سجل الإجراءات' : 'Actions Timeline'}
          </Title>
          <Badge variant="flat" size="sm" className="bg-gray-100 dark:bg-gray-700">
            {actions.length}
          </Badge>
        </div>
      </div>

      {/* Quick Actions Grid */}
      {!isClosed && !showAddForm && (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50">
           {Object.values(ActionType)
             .filter(v => typeof v === 'number')
             .map((type) => (
               <button
                 key={type}
                 onClick={() => {
                   setActionType(type as ActionType);
                   setShowAddForm(true);
                 }}
                 className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group"
               >
                 <div className={`p-2 rounded-full ${actionColors[type as ActionType] || 'bg-gray-100 text-gray-500'} group-hover:scale-110 transition-transform`}>
                   {actionIcons[type as ActionType]}
                 </div>
                 <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary text-center">
                   {ActionTypeLabels[type as ActionType]?.[lang]}
                 </span>
               </button>
             ))}
        </div>
      )}

      {/* Add Action Form */}
      <div className={`transition-all duration-300 ease-in-out border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 ${showAddForm ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'إضافة إجراء جديد' : 'New Action Details'}
            </Text>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <PiXCircleBold className="w-5 h-5" />
            </button>
          </div>

          <Select
            options={actionTypeOptions}
            value={actionType ? { value: actionType, label: ActionTypeLabels[actionType]?.[lang] } : null}
            onChange={(option: any) => setActionType(option?.value)}
            placeholder={lang === 'ar' ? 'اختر نوع الإجراء...' : 'Select Type...'}
            label={lang === 'ar' ? 'نوع الإجراء' : 'Action Type'}
            className="col-span-full"
          />

          {actionType === ActionType.Refund && (
            <Input
              type="number"
              placeholder="0.00"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              label={lang === 'ar' ? 'مبلغ الاسترداد' : 'Refund Amount'}
              prefix={<PiCurrencyDollarBold className="text-gray-400" />}
              min={0}
              step="0.01"
            />
          )}

          {actionType === ActionType.Compensation && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                options={compensationTypeOptions}
                value={compensationType ? { value: compensationType, label: CompensationTypeLabels[compensationType]?.[lang] } : null}
                onChange={(option: any) => setCompensationType(option?.value)}
                placeholder={lang === 'ar' ? 'نوع...' : 'Type...'}
                label={lang === 'ar' ? 'نوع التعويض' : 'Type'}
              />
              <Input
                type="number"
                placeholder="0"
                value={compensationValue}
                onChange={(e) => setCompensationValue(e.target.value)}
                label={lang === 'ar' ? 'القيمة' : 'Value'}
                min={0}
                step="0.01"
              />
            </div>
          )}

          <Textarea
            placeholder={lang === 'ar' ? 'أضف ملاحظات أو تفاصيل إضافية...' : 'Add notes or extra details...'}
            value={actionDetails}
            onChange={(e) => setActionDetails(e.target.value)}
            label={lang === 'ar' ? 'التفاصيل' : 'Details'}
            rows={3}
            className="resize-none"
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setActionType(null);
                setActionDetails('');
              }}
              className="w-24"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleAddAction}
              isLoading={isAdding}
              size="sm"
              className="bg-primary text-white w-24 hover:shadow-md"
            >
              {lang === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Actions Timeline */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <PiNoteBold className="w-8 h-8 text-gray-300" />
            </div>
            <Text className="text-gray-500 font-medium">
              {lang === 'ar' ? 'لا توجد إجراءات مسجلة' : 'No actions recorded'}
            </Text>
            <Text className="text-xs text-gray-400 mt-1 max-w-[200px]">
              {lang === 'ar' 
                ? 'استخدم الزر أعلاه لإضافة إجراء جديد وتوثيق التعامل مع التذكرة' 
                : 'Use the button above to add a new action and document the ticket handling'}
            </Text>
          </div>
        ) : (

          <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700 space-y-7 my-4 ml-4">
            {actions.map((action, index) => (
              <div key={action.id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-[45px] top-0.8 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 shadow-sm z-10 ${actionColors[action.actionType as ActionType] || 'bg-gray-100 text-gray-500'}`}>
                  {actionIcons[action.actionType as ActionType] || <PiNoteBold className="h-4 w-4" />}
                </div>

                {/* Content */}
                <div className="group">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                       {/* Action Title */}
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {ActionTypeLabels[action.actionType as ActionType]?.[lang] || 'Unknown'}
                      </span>
                      
                      {/* Context Badges */}
                      {action.refundAmount && action.refundAmount > 0 && (
                        <Badge variant="flat" size="sm" color="success" className="px-2">
                          ${action.refundAmount}
                        </Badge>
                      )}
                      
                      {action.compensationType && (
                        <Badge variant="flat" size="sm" color="secondary" className="px-2">
                          {CompensationTypeLabels[action.compensationType as CompensationType]?.[lang]}
                          {action.compensationValue ? `: ${action.compensationValue}` : ''}
                        </Badge>
                      )}
                    </div>
                    
                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                      {new Date(action.createdAt).toLocaleDateString()} • {new Date(action.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  {action.actionDetails && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-700/50 group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-colors">
                      {action.actionDetails}
                    </div>
                  )}
                  
                  {/* Agent Name - Placeholder if not available in Action object */}
                  <div className="mt-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] text-gray-400">
                        {lang === 'ar' ? 'بواسطة:' : 'By:'} Agent
                     </span>
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
