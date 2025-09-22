import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RotateCcw, Calendar, DollarSign, Package, Tag } from "lucide-react";

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
}

export interface FilterValue {
  [key: string]: any;
}

interface AdvancedFilterProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onReset: () => void;
  activeFiltersCount?: number;
}

export default function AdvancedFilter({
  filters,
  values,
  onChange,
  onReset,
  activeFiltersCount = 0,
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const removeFilter = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const getActiveFilters = () => {
    return Object.entries(values).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
      }
      if (typeof value === 'boolean') return true;
      return value !== '' && value !== null && value !== undefined;
    });
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = values[filter.key];
    switch (filter.type) {
      case 'text':
        return (
          <Input
            className="my-2 p-2 border border-gray-300 rounded-md"
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
          />
        );
      case 'select':
        return (
          <div className="my-2">
            <Select
              value={value ?? 'all'}
              onValueChange={(val) => updateFilter(filter.key, val === 'all' ? '' : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder ?? 'All'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'multiselect':
        const selectedValues: string[] = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filter.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.key}-${option.value}`}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter(filter.key, [...selectedValues, option.value]);
                      } else {
                        updateFilter(filter.key, selectedValues.filter((v) => v !== option.value));
                      }
                    }}
                  />
                  <Label htmlFor={`${filter.key}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((val) => {
                  const option = filter.options?.find(o => o.value === val);
                  return (
                    <Badge key={val} variant="secondary" className="text-xs">
                      {option?.label || val}
                      <button
                        onClick={() => updateFilter(filter.key, selectedValues.filter((v) => v !== val))}
                        className="ml-1 hover:bg-red-100 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'range':
        const rangeValue = value || { min: '', max: '' };
        return (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                className="border border-gray-300 rounded-md p-2"
                placeholder="Min"
                type="number"
                value={rangeValue.min}
                onChange={(e) => updateFilter(filter.key, { ...rangeValue, min: e.target.value })}
              />
              <span className="text-muted-foreground">to</span>
              <Input
                className="border border-gray-300 rounded-md p-2"
                placeholder="Max"
                type="number"
                value={rangeValue.max}
                onChange={(e) => updateFilter(filter.key, { ...rangeValue, max: e.target.value })}
              />
            </div>
          </div>
        );
      case 'date':
        const dateValue = value || { from: '', to: '' };
        return (
          <div className="flex flex-col space-y-2">
            <div>
              <Label htmlFor={`${filter.key}-from`} className="text-xs">From</Label>
              <Input
                id={`${filter.key}-from`}
                type="date"
                className="border border-gray-300 rounded-md p-2"
                value={dateValue.from}
                onChange={(e) => updateFilter(filter.key, { ...dateValue, from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`${filter.key}-to`} className="text-xs">To</Label>
              <Input
                id={`${filter.key}-to`}
                type="date"
                className="border border-gray-300 rounded-md p-2"
                value={dateValue.to}
                onChange={(e) => updateFilter(filter.key, { ...dateValue, to: e.target.value })}
              />
            </div>
          </div>
        );
      case 'boolean':
        return (
          <div className="my-2">
            <Select
              value={value === true ? 'true' : value === false ? 'false' : 'all'}
              onValueChange={(val) => updateFilter(filter.key, val === 'all' ? null : val === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="flex items-center gap-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {activeFilters.length > 0 && (
              <Badge className="ml-2 px-1 py-0 text-xs min-w-[1rem] h-5">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 max-h-[70vh] overflow-y-auto p-4"
          align="start"
          side="bottom"
          sideOffset={4}
          collisionPadding={8}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                disabled={activeFilters.length === 0}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  {filter.icon && <span className="mr-1">{filter.icon}</span>}
                  {filter.label}
                </Label>
                {renderFilterInput(filter)}
              </div>
            ))}
            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      )}
      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            if (!filter) return null;

            let displayValue = '';
            if (Array.isArray(value)) {
              displayValue = `${value.length} selected`;
            } else if (typeof value === 'object' && value !== null) {
              const parts = [];
              if (value.min) parts.push(`≥${value.min}`);
              if (value.max) parts.push(`≤${value.max}`);
              if (value.from) parts.push(`from ${value.from}`);
              if (value.to) parts.push(`to ${value.to}`);
              displayValue = parts.join(', ');
            } else if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
            } else if (value !== undefined && value !== null) {
              displayValue = value.toString();
            } else {
              displayValue = '';
            }

            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {filter.icon && <span className="w-3 h-3">{filter.icon}</span>}
                <span className="text-xs">{filter.label}: {displayValue}</span>
                <button
                  onClick={() => removeFilter(key)}
                  className="ml-1 hover:bg-red-100 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Predefined filter configurations for common use cases

export const productFilters: FilterConfig[] = [
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    icon: <Tag className="w-3 h-3" />,
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'laptops', label: 'Laptops' },
      { value: 'audio', label: 'Audio' },
      { value: 'accessories', label: 'Accessories' },
    ],
  },
  {
    key: 'priceRange',
    label: 'Price Range',
    type: 'range',
    icon: <DollarSign className="w-3 h-3" />,
    placeholder: 'Enter price range',
  },
  {
    key: 'stockStatus',
    label: 'Stock Status',
    type: 'select',
    icon: <Package className="w-3 h-3" />,
    options: [
      { value: 'in-stock', label: 'In Stock' },
      { value: 'low-stock', label: 'Low Stock' },
      { value: 'out-of-stock', label: 'Out of Stock' },
    ],
  },
  {
    key: 'supplier',
    label: 'Supplier',
    type: 'select',
    options: [
      { value: 'apple', label: 'Apple Inc.' },
      { value: 'samsung', label: 'Samsung' },
      { value: 'dell', label: 'Dell Technologies' },
    ],
  },
  {
    key: 'dateAdded',
    label: 'Date Added',
    type: 'date',
    icon: <Calendar className="w-3 h-3" />,
  },
  {
    key: 'trackInventory',
    label: 'Track Inventory',
    type: 'boolean',
  },
];

export const customerFilters: FilterConfig[] = [
  {
    key: 'totalPurchases',
    label: 'Total Purchases',
    type: 'range',
    placeholder: 'Number of purchases',
  },
  {
    key: 'totalSpent',
    label: 'Total Spent',
    type: 'range',
    icon: <DollarSign className="w-3 h-3" />,
    placeholder: 'Amount spent',
  },
  {
    key: 'joinDate',
    label: 'Join Date',
    type: 'date',
    icon: <Calendar className="w-3 h-3" />,
  },
  {
    key: 'customerType',
    label: 'Customer Type',
    type: 'select',
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'vip', label: 'VIP' },
      { value: 'wholesale', label: 'Wholesale' },
    ],
  },
];