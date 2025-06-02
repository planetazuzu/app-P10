
'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons, IconName } from '@/components/icons'; // Assuming IconName is exported
import { Package, Archive, Box, Layers, ClipboardList, FileText, Filter, Search } from 'lucide-react'; // Added Filter, Search
import { cn } from '@/lib/utils';

type KitStatus = 'ok' | 'low' | 'out';

interface UsabilityKitItem {
  id: string;
  nombreEspacio: string;
  nombreKit: string;
  iconName: IconName | 'Package' | 'Archive' | 'Box' | 'Layers' | 'ClipboardList' | 'FileText'; // Allow specific lucide icons for now
  status: KitStatus;
}

// More generic mock data
const mockGenericInventoryData: UsabilityKitItem[] = [
  { id: 'item1', nombreEspacio: 'Compartimento A1', nombreKit: 'Ítem de Inventario Alpha', iconName: 'Package', status: 'ok' },
  { id: 'item2', nombreEspacio: 'Estantería B2', nombreKit: 'Equipo Beta', iconName: 'Box', status: 'low' },
  { id: 'item3', nombreEspacio: 'Cajón C3', nombreKit: 'Suministro Gamma', iconName: 'Archive', status: 'out' },
  { id: 'item4', nombreEspacio: 'Sección D4', nombreKit: 'Herramienta Delta', iconName: 'Settings', status: 'ok' },
  { id: 'item5', nombreEspacio: 'Compartimento E5', nombreKit: 'Documentación Épsilon', iconName: 'FileText', status: 'ok' },
  { id: 'item6', nombreEspacio: 'Estantería F6', nombreKit: 'Kit de Mantenimiento Zeta', iconName: 'Tool', status: 'low' },
  { id: 'item7', nombreEspacio: 'Cajón G7', nombreKit: 'Componentes Eta', iconName: 'Layers', status: 'ok' },
  { id: 'item8', nombreEspacio: 'Sección H8', nombreKit: 'Material de Oficina Theta', iconName: 'ClipboardList', status: 'out' },
  { id: 'item9', nombreEspacio: 'Compartimento I9', nombreKit: 'Repuestos Iota', iconName: 'Package', status: 'ok' },
  { id: 'item10', nombreEspacio: 'Estantería J10', nombreKit: 'Equipo de Limpieza Kappa', iconName: 'Trash2', status: 'ok' },
  { id: 'item11', nombreEspacio: 'Cajón K11', nombreKit: 'Suministros Lambda', iconName: 'Archive', status: 'low' },
  { id: 'item12', nombreEspacio: 'Sección L12', nombreKit: 'Prototipo Mu', iconName: 'Box', status: 'ok' },
];


const KitCard: React.FC<UsabilityKitItem> = ({ nombreEspacio, nombreKit, iconName, status }) => {
  // Determine icon component
  let IconComponent;
  if (iconName in Icons) {
    IconComponent = Icons[iconName as IconName];
  } else {
    // Fallback for direct lucide icon names
    const LucideIcons = { Package, Archive, Box, Layers, ClipboardList, FileText, Settings: Icons.Settings, Tool: Icons.Tool, Trash2: Icons.Trash2 }; // Include Tool
    IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] || Package; // Default to Package
  }


  const statusClasses: Record<KitStatus, string> = {
    ok: 'bg-green-500',
    low: 'bg-yellow-500',
    out: 'bg-red-500',
  };

  return (
    <Card className="bg-slate-700 text-slate-100 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col aspect-square justify-between p-3">
      <div className="flex justify-between items-start">
        <span className="text-xs text-slate-400">{nombreEspacio}</span>
        <div className={cn("w-3 h-3 rounded-full", statusClasses[status])} title={`Estado: ${status.toUpperCase()}`}></div>
      </div>
      <div className="flex-grow flex items-center justify-center my-2">
        <IconComponent className="w-10 h-10 text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-center truncate" title={nombreKit}>{nombreKit}</p>
    </Card>
  );
};

export default function MaterialManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<KitStatus | 'all'>('all');

  const filteredData = useMemo(() => {
    return mockGenericInventoryData.filter(item => {
      const matchesSearch = item.nombreKit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.nombreEspacio.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const statusFilters: { label: string; value: KitStatus | 'all' }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'OK', value: 'ok' },
    { label: 'Bajo Stock', value: 'low' },
    { label: 'Agotado', value: 'out' },
  ];

  return (
    <div>
      <h1 className="page-title mb-2">Material USVB</h1>
      <p className="text-muted-foreground mb-6">
        Verificación y gestión del equipamiento esencial de la Unidad de Soporte Vital Básico.
        El diseño de esta página (tarjetas, filtros) puede servir de plantilla para otras secciones de gestión de materiales.
      </p>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre de kit o espacio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {statusFilters.map(filter => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    "text-xs px-3 py-1 h-auto",
                    statusFilter === filter.value && "bg-primary text-primary-foreground", // Primary green for active filter
                  )}
                >
                  {filter.label}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Más filtros</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredData.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredData.map(item => (
            <KitCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <Package className="mx-auto h-12 w-12 opacity-50 mb-4" />
          <p className="text-lg font-semibold">No se encontraron ítems.</p>
          <p>Intente ajustar su búsqueda o filtros.</p>
        </div>
      )}
    </div>
  );
}

    