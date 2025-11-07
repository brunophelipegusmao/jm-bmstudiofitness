"use client";

import { FileText, Folder } from "lucide-react";
import { useState } from "react";

import { ManageCategoriesForm } from "@/components/Admin/ManageCategoriesForm";
import { ManagePostForm } from "@/components/Admin/ManagePostForm";

export function BlogTab() {
  const [activeSubTab, setActiveSubTab] = useState("posts");

  const subTabs = [
    {
      id: "posts",
      label: "Posts",
      icon: FileText,
      description: "Gerenciar posts do blog",
    },
    {
      id: "categories",
      label: "Categorias",
      icon: Folder,
      description: "Gerenciar categorias",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex space-x-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-1">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#C2A537] text-black"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-in fade-in-50 slide-in-from-bottom-2">
        {activeSubTab === "posts" && <ManagePostForm />}
        {activeSubTab === "categories" && <ManageCategoriesForm />}
      </div>
    </div>
  );
}
