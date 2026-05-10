// pages/categories/columns.jsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const createCategoryColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type");
      return (
        <span
          className={`${
            type === "income" ? "text-green-600" : "text-red-600"
          } capitalize`}>
          {type}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(category)}>
            Delete
          </Button>
        </div>
      );
    },
  },
];
