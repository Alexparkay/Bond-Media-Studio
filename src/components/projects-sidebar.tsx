"use client";

import { useState, useEffect } from "react";
import { X, Folder, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserApps } from "@/actions/user-apps";
import { deleteApp } from "@/actions/delete-app";
import Link from "next/link";
import { toast } from "sonner";

interface ProjectsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectsSidebar({ isOpen, onClose }: ProjectsSidebarProps) {
  const queryClient = useQueryClient();
  const { data: apps = [] } = useQuery({
    queryKey: ["userApps"],
    queryFn: getUserApps,
    initialData: [],
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDelete = async (e: React.MouseEvent, appId: string, appName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${appName}"?`)) {
      try {
        await deleteApp(appId);
        toast.success("Project deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["userApps"] });
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-96 gradient-premium-dark border-r border-white/10 shadow-2xl z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute inset-0 gradient-radial opacity-50"></div>
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-semibold text-white">Your Projects</h2>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-6">
            {apps.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <Folder className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">No projects yet</p>
                <p className="text-sm text-gray-500">Start creating to see your projects here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apps.map((app) => (
                  <Link
                    key={app.id}
                    href={`/app/${app.id}`}
                    onClick={onClose}
                    className="group block relative"
                  >
                    <div className="gradient-card p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-lg hover:shadow-white/5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
                            {app.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Created {new Date(app.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleDelete(e, app.id, app.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 