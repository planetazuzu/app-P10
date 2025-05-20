'use client';

import type { EmergencyRequest, RequestStatus, UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpDown, MessageSquare, MoreHorizontal, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';

interface RequestListProps {
  requests: EmergencyRequest[];
  userRole: UserRole;
  onUpdateRequestStatus: (requestId: string, status: RequestStatus) => void;
  onViewDetails: (requestId: string) => void; // For modal or separate page
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-yellow-500 hover:bg-yellow-600',
  dispatched: 'bg-blue-500 hover:bg-blue-600',
  'on-scene': 'bg-indigo-500 hover:bg-indigo-600',
  transporting: 'bg-purple-500 hover:bg-purple-600',
  completed: 'bg-green-500 hover:bg-green-600',
  cancelled: 'bg-gray-500 hover:bg-gray-600',
};

const PRIORITY_STYLES: Record<'high' | 'medium' | 'low', string> = {
    high: "text-red-600 font-semibold",
    medium: "text-orange-500 font-medium",
    low: "text-green-600",
}

export function RequestList({ requests, userRole, onUpdateRequestStatus, onViewDetails }: RequestListProps) {
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<'createdAt' | 'priority' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedRequests = useMemo(() => {
    let processedRequests = [...requests];

    if (filterStatus !== 'all') {
      processedRequests = processedRequests.filter(req => req.status === filterStatus);
    }

    if (searchTerm) {
      processedRequests = processedRequests.filter(req => 
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.patientDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    processedRequests.sort((a, b) => {
        let comparison = 0;
        if (sortColumn === 'createdAt') {
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortColumn === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (sortColumn === 'status') {
            comparison = a.status.localeCompare(b.status);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return processedRequests;
  }, [requests, filterStatus, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: 'createdAt' | 'priority' | 'status') => {
    if (sortColumn === column) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortColumn(column);
        setSortDirection('desc');
    }
  };

  const canManageStatus = userRole === 'admin' || userRole === 'hospital' || userRole === 'ambulance';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="section-title">Emergency Requests</CardTitle>
        <CardDescription>View and manage all submitted requests.</CardDescription>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Input 
                placeholder="Search by ID, patient, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as RequestStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">No requests found.</p>
                <p>Try adjusting your filters or check back later.</p>
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient Details</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('priority')}>
                    Priority <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')}>
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                    Created At <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium text-primary">{request.id.substring(0,8)}...</TableCell>
                <TableCell>{request.patientDetails.substring(0, 30)}...</TableCell>
                <TableCell>
                    <span className={PRIORITY_STYLES[request.priority]}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                </TableCell>
                <TableCell>
                  <Badge className={`${STATUS_COLORS[request.status]} text-white`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{format(parseISO(request.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewDetails(request.id)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      {canManageStatus && request.status !== 'completed' && request.status !== 'cancelled' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          {Object.keys(STATUS_COLORS).filter(s => s !== request.status).map(newStatus => (
                            <DropdownMenuItem key={newStatus} onClick={() => onUpdateRequestStatus(request.id, newStatus as RequestStatus)}>
                              Mark as {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                       <DropdownMenuSeparator />
                       <DropdownMenuItem disabled>
                        <MessageSquare className="mr-2 h-4 w-4" /> Send Message (Soon)
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
