"use client";

/**
 * Support Tickets Page (Admin)
 * Lists all support tickets with filtering and assignment
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Select, Input } from "rizzui";
import { PiMagnifyingGlass, PiChatCircleText } from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getAllTickets, assignTicketToAgent } from "@/services/support-ticket.service";
import { getAllSupport } from "@/services/support.service";
import { SupportTicket } from "@/types/support-ticket.types";
import { SupportAgent } from "@/types/support.types";
import {
  TicketStatus,
  TicketPriority,
  TicketStatusLabels,
  TicketCategoryLabels,
  TicketPriorityLabels,
} from "@/types/firebase.enums";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";

import cn from "@core/utils/class-names";
import TablePagination from "@/app/shared/controlled-table/table-pagination";
import { useLocale } from "next-intl";

const pageHeader = {
  title: "Support Tickets",
  breadcrumb: [{ name: "Home", href: "/" }, { name: "Admin", href: "#" }, { name: "Support Tickets" }],
};

function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.Open:
      return "info";
    case TicketStatus.Assigned:
    case TicketStatus.InProgress:
      return "warning";
    case TicketStatus.WaitingCustomer:
      return "secondary";
    case TicketStatus.Resolved:
      return "success";
    case TicketStatus.Closed:
      return "secondary";
    default:
      return "secondary";
  }
}

function getPriorityColor(priority: TicketPriority): string {
  switch (priority) {
    case TicketPriority.Urgent:
      return "danger";
    case TicketPriority.High:
      return "warning";
    case TicketPriority.Medium:
      return "info";
    case TicketPriority.Low:
    default:
      return "secondary";
  }
}

export default function SupportTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const lang = locale === "ar" ? "ar" : "en";

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Status filter options
  const statusOptions = [
    { value: "all", label: lang === "ar" ? "جميع الحالات" : "All Statuses" },
    ...Object.entries(TicketStatusLabels).map(([key, labels]) => ({
      value: key,
      label: labels[lang],
    })),
  ];

  // Category filter options
  const categoryOptions = [
    { value: "all", label: lang === "ar" ? "جميع الفئات" : "All Categories" },
    ...Object.entries(TicketCategoryLabels).map(([key, labels]) => ({
      value: key,
      label: labels[lang],
    })),
  ];

  // Priority filter options
  const priorityOptions = [
    { value: "all", label: lang === "ar" ? "جميع الأولويات" : "All Priorities" },
    ...Object.entries(TicketPriorityLabels).map(([key, labels]) => ({
      value: key,
      label: labels[lang],
    })),
  ];

  // Agent options for dropdown
  const agentOptions = useMemo(
    () =>
      agents.map((agent) => ({
        value: agent.id,
        label: `${agent.firstName} ${agent.lastName}`,
      })),
    [agents]
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ticketsData, agentsData] = await Promise.all([
        getAllTickets(session?.accessToken || ""),
        getAllSupport(session?.accessToken || ""),
      ]);
      setTickets(ticketsData || []);
      setAgents(agentsData || []);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn1);
    }
  }, [status, router, fetchData]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const handleAssignAgent = async (ticketId: string, agentId: string) => {
    setAssigningTicketId(ticketId);
    try {
      await assignTicketToAgent(ticketId, agentId, session?.accessToken || "");
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, assignedToSupportId: agentId, status: TicketStatus.Assigned } : t))
      );
      toast.success(lang === "ar" ? "تم تعيين التذكرة بنجاح" : "Ticket assigned successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to assign ticket");
    } finally {
      setAssigningTicketId(null);
    }
  };

  // Filter tickets (client-side for search only, as API handles status/category/priority)
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search filter (client-side)
      const matchesSearch =
        !searchQuery ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter (client-side fallback)
      const matchesStatus = statusFilter === "all" || ticket.status.toString() === statusFilter;

      // Category filter (client-side fallback)
      const matchesCategory = categoryFilter === "all" || ticket.category.toString() === categoryFilter;

      // Priority filter (client-side fallback)
      const matchesPriority = priorityFilter === "all" || ticket.priority.toString() === priorityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  // Paginate tickets
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTickets.slice(startIndex, startIndex + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

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

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Text className="text-gray-500">{lang === "ar" ? "إجمالي التذاكر" : "Total Tickets"}</Text>
          <Title as="h3" className="text-2xl font-bold">
            {tickets.length}
          </Title>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Text className="text-gray-500">{lang === "ar" ? "مفتوحة" : "Open"}</Text>
          <Title as="h3" className="text-2xl font-bold text-blue-600">
            {tickets.filter((t) => t.status === TicketStatus.Open).length}
          </Title>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Text className="text-gray-500">{lang === "ar" ? "قيد المعالجة" : "In Progress"}</Text>
          <Title as="h3" className="text-2xl font-bold text-yellow-600">
            {tickets.filter((t) => t.status === TicketStatus.Assigned || t.status === TicketStatus.InProgress).length}
          </Title>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Text className="text-gray-500">{lang === "ar" ? "تم الحل" : "Resolved"}</Text>
          <Title as="h3" className="text-2xl font-bold text-green-600">
            {tickets.filter((t) => t.status === TicketStatus.Resolved).length}
          </Title>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input
          placeholder={lang === "ar" ? "ابحث عن التذاكر..." : "Search tickets..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<PiMagnifyingGlass className="h-4 w-4 text-gray-500" />}
          className="w-full sm:w-64"
        />
        <Select
          options={statusOptions}
          value={statusOptions.find((opt) => opt.value === statusFilter) || null}
          onChange={(option: any) => setStatusFilter(option?.value || "all")}
          placeholder={lang === "ar" ? "حالة التذكرة" : "Status"}
          className="w-full sm:w-48"
        />
        <Select
          options={categoryOptions}
          value={categoryOptions.find((opt) => opt.value === categoryFilter) || null}
          onChange={(option: any) => setCategoryFilter(option?.value || "all")}
          placeholder={lang === "ar" ? "الفئة" : "Category"}
          className="w-full sm:w-48"
        />
        <Select
          options={priorityOptions}
          value={priorityOptions.find((opt) => opt.value === priorityFilter) || null}
          onChange={(option: any) => setPriorityFilter(option?.value || "all")}
          placeholder={lang === "ar" ? "الأولوية" : "Priority"}
          className="w-full sm:w-40"
        />
      </div>

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full min-w-[800px] text-sm relative">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{lang === "ar" ? "رقم التذكرة" : "Ticket #"}</th>
                <th className="px-4 py-3 text-start font-medium">{lang === "ar" ? "الموضوع" : "Subject"}</th>
                <th className="px-4 py-3 text-start font-medium">{lang === "ar" ? "الفئة" : "Category"}</th>
                <th className="px-4 py-3 text-start font-medium">{lang === "ar" ? "الأولوية" : "Priority"}</th>
                <th className="px-4 py-3 text-start font-medium">{lang === "ar" ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 text-start font-medium">{lang === "ar" ? "تعيين لـ" : "Assign To"}</th>
                <th className="px-4 py-3 text-start font-medium">{lang === "ar" ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {lang === "ar" ? "لا توجد تذاكر" : "No tickets found"}
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 font-medium">#{ticket.ticketNumber}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{TicketCategoryLabels[ticket.category]?.[lang] || "Unknown"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={getPriorityColor(ticket.priority) as any}>
                        {TicketPriorityLabels[ticket.priority]?.[lang] || "Unknown"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={getStatusColor(ticket.status) as any}>
                        {TicketStatusLabels[ticket.status]?.[lang] || "Unknown"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {ticket.status === TicketStatus.Closed ? (
                        <Text className="text-gray-400">—</Text>
                      ) : (
                        <Select
                          options={agentOptions}
                          value={
                            ticket.assignedToSupportId
                              ? {
                                  value: ticket.assignedToSupportId,
                                  label: (() => {
                                    const agent = agents.find((a) => a.id === ticket.assignedToSupportId);
                                    return agent ? `${agent.firstName} ${agent.lastName}` : ticket.assignedToSupportId;
                                  })(),
                                }
                              : null
                          }
                          onChange={(option: any) => handleAssignAgent(ticket.id, option?.value)}
                          placeholder={lang === "ar" ? "اختر..." : "Select..."}
                          className="min-w-[150px]"
                          disabled={assigningTicketId === ticket.id}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={routes.support.ticketDetails(ticket.id)}>
                          <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary">
                            <PiChatCircleText className="me-1 h-4 w-4" />
                            {lang === "ar" ? "عرض" : "View"}
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TablePagination
        total={filteredTickets.length}
        current={currentPage}
        pageSize={pageSize}
        onChange={setCurrentPage}
        setPageSize={setPageSize}
      />
    </>
  );
}
