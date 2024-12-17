"use client"

import Link from "next/link";
import {
    PanelsTopLeft,
    Bookmark,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/Sidebar-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileUpload } from 'primereact/fileupload';
import {
Tooltip,
TooltipTrigger,
TooltipContent,
TooltipProvider
} from "@/components/ui/tooltip";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  
  if(!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <PanelsTopLeft className="w-6 h-6 mr-1" />
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                sidebar?.isOpen === false
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              GTRAG
            </h1>
          </Link>
        </Button>
        <ScrollArea className="[&>div>div[style]]:!block">
            <nav className="mt-8 h-full w-full">
                <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
                    <div className="w-full" key={1}>
                        <TooltipProvider disableHoverableContent>
                            <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <Button
                                    variant={"ghost"}
                                    className="w-full justify-start h-10 mb-1"
                                    asChild
                                    >
                                        <Link href="#">
                                            <span
                                            className={cn(sidebar?.isOpen === false ? "" : "mr-4")}
                                            >
                                            <Bookmark size={18} />
                                            </span>
                                            <p
                                            className={cn(
                                                "max-w-[200px] truncate break-words",
                                                sidebar?.isOpen === false
                                                ? "-translate-x-96 opacity-0"
                                                : "translate-x-0 opacity-100"
                                            )}
                                            >
                                            Upload Files
                                            </p>
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                {sidebar?.isOpen === false && (
                                    <TooltipContent side="right">
                                        Upload files here
                                    </TooltipContent>
                                )}
                            </Tooltip>
                            {sidebar?.isOpen === true && (
                                <div className="card">
                                    <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.(pdf, docx, csv, pptx, xlsx, txt)</p>} />
                                </div>
                            )}
                        </TooltipProvider>
                    </div>
                </ul>
            </nav>
        </ScrollArea>
      </div>
    </aside>
    );
}