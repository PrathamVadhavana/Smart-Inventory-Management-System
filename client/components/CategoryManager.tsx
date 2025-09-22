import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Tag,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  productCount: number;
  children?: Category[];
}

// Categories will be loaded from localStorage
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    description: "Electronic devices and gadgets",
    displayOrder: 1,
    status: "active",
    productCount: 45,
    children: [
      {
        id: "11",
        name: "Smartphones",
        description: "Mobile phones and accessories",
        parentId: "1",
        displayOrder: 1,
        status: "active",
        productCount: 25,
        children: [
          {
            id: "111",
            name: "iPhone",
            parentId: "11",
            displayOrder: 1,
            status: "active",
            productCount: 12,
          },
          {
            id: "112",
            name: "Samsung",
            parentId: "11",
            displayOrder: 2,
            status: "active",
            productCount: 8,
          },
        ],
      },
      {
        id: "12",
        name: "Laptops",
        parentId: "1",
        displayOrder: 2,
        status: "active",
        productCount: 15,
        children: [
          {
            id: "121",
            name: "MacBook",
            parentId: "12",
            displayOrder: 1,
            status: "active",
            productCount: 6,
          },
          {
            id: "122",
            name: "Windows Laptops",
            parentId: "12",
            displayOrder: 2,
            status: "active",
            productCount: 9,
          },
        ],
      },
      {
        id: "13",
        name: "Audio",
        parentId: "1",
        displayOrder: 3,
        status: "active",
        productCount: 5,
      },
    ],
  },
  {
    id: "2",
    name: "Accessories",
    description: "Phone and laptop accessories",
    displayOrder: 2,
    status: "active",
    productCount: 23,
    children: [
      {
        id: "21",
        name: "Phone Cases",
        parentId: "2",
        displayOrder: 1,
        status: "active",
        productCount: 15,
      },
      {
        id: "22",
        name: "Chargers",
        parentId: "2",
        displayOrder: 2,
        status: "active",
        productCount: 8,
      },
    ],
  },
];

interface CategoryManagerProps {
  onCategorySelect?: (category: Category) => void;
  selectedCategoryId?: string;
}

export default function CategoryManager({ onCategorySelect, selectedCategoryId }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["1", "2"]));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    description: string;
    parentId: string;
    displayOrder: number;
    status: 'active' | 'inactive';
  }>({
    name: "",
    description: "",
    parentId: "",
    displayOrder: 1,
    status: "active",
  });

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      // Update existing category logic would go here
      // Updating category
    } else {
      // Add new category logic would go here
      // Adding new category
    }

    setDialogOpen(false);
    setEditingCategory(null);
    setNewCategory({
      name: "",
      description: "",
      parentId: "",
      displayOrder: 1,
      status: "active",
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
      displayOrder: category.displayOrder,
      status: category.status,
    });
    setDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? All subcategories will be moved to parent level.")) {
      // Delete category logic would go here
      // Deleting category
    }
  };

  const getAllCategories = (categories: Category[], level = 0): (Category & { level: number })[] => {
    let result: (Category & { level: number })[] = [];

    categories.forEach(category => {
      result.push({ ...category, level });
      if (category.children && expandedCategories.has(category.id)) {
        result = result.concat(getAllCategories(category.children, level + 1));
      }
    });

    return result;
  };

  const getFlatCategories = (categories: Category[]): Category[] => {
    let result: Category[] = [];
    categories.forEach(category => {
      result.push(category);
      if (category.children) {
        result = result.concat(getFlatCategories(category.children));
      }
    });
    return result;
  };

  const allCategories = getAllCategories(categories);
  const flatCategories = getFlatCategories(categories);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Category Management
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
                <DialogDescription>
                  Create a new category to organize your products better.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name *</Label>
                  <Input
                    id="category-name"
                    placeholder="Enter category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent-category">Parent Category</Label>
                  <Select
                    value={newCategory.parentId}
                    onValueChange={(value) => setNewCategory({ ...newCategory, parentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Parent (Top Level)</SelectItem>
                      {flatCategories
                        .filter(cat => cat.id !== editingCategory?.id)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter category description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-order">Display Order</Label>
                    <Input
                      id="display-order"
                      type="number"
                      placeholder="1"
                      value={newCategory.displayOrder}
                      onChange={(e) => setNewCategory({ ...newCategory, displayOrder: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newCategory.status}
                      onValueChange={(value: "active" | "inactive") => setNewCategory({ ...newCategory, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCategory} disabled={!newCategory.name}>
                  {editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCategories.map((category) => (
              <TableRow
                key={category.id}
                className={selectedCategoryId === category.id ? "bg-muted" : ""}
                onClick={() => onCategorySelect?.(category)}
              >
                <TableCell>
                  <div className="flex items-center" style={{ paddingLeft: `${category.level * 20}px` }}>
                    {category.children && category.children.length > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(category.id);
                        }}
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    ) : (
                      <div className="w-6 mr-2" />
                    )}
                    {category.children && category.children.length > 0 ? (
                      expandedCategories.has(category.id) ? (
                        <FolderOpen className="w-4 h-4 mr-2 text-yellow-600" />
                      ) : (
                        <Folder className="w-4 h-4 mr-2 text-yellow-600" />
                      )
                    ) : (
                      <Tag className="w-4 h-4 mr-2 text-blue-600" />
                    )}
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{category.productCount}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${category.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {category.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
