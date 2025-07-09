"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Trash, ExternalLink, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteApp } from "@/actions/delete-app";
import { toast } from "sonner";

type AppCardProps = {
  id: string;
  name: string;
  createdAt: Date;
  onDelete?: () => void;
};

export function AppCard({ id, name, createdAt, onDelete }: AppCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/app/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteApp(id);
    toast.success("App deleted successfully");
    if (onDelete) {
      onDelete();
    }

    console.log(`Delete app: ${id}`);
  };

  return (
    <Card className="p-3 sm:p-4 border-white/10 bg-white/5 backdrop-blur-sm rounded-xl h-32 sm:h-36 relative w-full hover:bg-white/10 transition-all duration-200">
      <Link href={`/app/${id}`} className="cursor-pointer block">
        <CardHeader className="p-0">
          <CardTitle className="text-sm sm:text-base truncate text-white">{name}</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-400">
            Created {createdAt.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Link>

      <div className="absolute top-2 right-2 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-md hover:bg-white/10 focus:outline-none">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
            <DropdownMenuItem onClick={handleOpen} className="hover:bg-white/10">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-400 hover:bg-white/10 hover:text-red-300"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
