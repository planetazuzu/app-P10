'use client';

import type { AmbulanceType, AmbulanceStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface AmbulanceFiltersProps {
  types: AmbulanceType[];
  statuses: AmbulanceStatus[];
  selectedType: AmbulanceType | 'all';
  selectedStatus: AmbulanceStatus | 'all';
  onTypeChange: (type: AmbulanceType | 'all') => void;
  onStatusChange: (status: AmbulanceStatus | 'all') => void;
}

export function AmbulanceFilters({
  types,
  statuses,
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange,
}: AmbulanceFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-secondary">Filter Ambulances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ambulance-type" className="text-sm font-medium">Type</Label>
          <Select value={selectedType} onValueChange={(value) => onTypeChange(value as AmbulanceType | 'all')}>
            <SelectTrigger id="ambulance-type" className="w-full mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ambulance-status" className="text-sm font-medium">Status</Label>
           <Select value={selectedStatus} onValueChange={(value) => onStatusChange(value as AmbulanceStatus | 'all')}>
            <SelectTrigger id="ambulance-status" className="w-full mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
