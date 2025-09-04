// pages/categories/columns.jsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

// Define your columns for categories
export const columns = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("Edit", category)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => console.log("Delete", category)}>
            Delete
          </Button>
        </div>
      );
    },
  },
];
