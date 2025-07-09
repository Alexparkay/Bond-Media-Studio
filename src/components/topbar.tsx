// Note: No "use client" directive, so it can be used in a server component

import { ArrowUpRightIcon, Code2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

export function TopBar({
  appName,
  children,
  codeServerUrl,
}: {
  appName: string;
  children?: React.ReactNode;
  codeServerUrl: string;
}) {
  return (
    <div className="h-12 sticky top-0 flex items-center px-4 border-b border-gray-800 bg-black justify-between">
      <Link href={"/"} className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
        <Code2 className="h-5 w-5" />
        <span className="font-semibold">Bond Media Studio</span>
      </Link>
      <a target="_blank" href={codeServerUrl} className="hidden md:block">
        <Button size="sm" variant={"outline"} className="border-gray-700 hover:bg-white/10">
          {/* <img src="/vscode-logo.svg" className="h-4 w-4" /> */}
          VS Code
          <ArrowUpRightIcon />
        </Button>
      </a>
    </div>
  );
}
