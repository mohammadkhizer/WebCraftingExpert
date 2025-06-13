
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LucideIcon } from "lucide-react";

interface AdminTablePageSkeletonProps {
  pageTitleText?: string;
  pageDescriptionText?: string;
  TitleIcon?: LucideIcon;
  mainButtonText?: string;
  cardTitleText?: string;
  cardDescriptionText?: string;
  columnCount?: number;
  rowCount?: number;
}

export function AdminTablePageSkeleton({
  pageTitleText = "Manage Items",
  pageDescriptionText = "View, add, edit, or remove items.",
  TitleIcon,
  mainButtonText = "Add New Item",
  cardTitleText = "All Items",
  cardDescriptionText = "A list of all items.",
  columnCount = 4,
  rowCount = 3,
}: AdminTablePageSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-2xl font-semibold text-foreground flex items-center">
            {TitleIcon && <Skeleton className="mr-3 h-6 w-6 rounded-md" />}
            <Skeleton className="h-7 w-48" />
          </div>
          <Skeleton className="h-5 w-64 mt-1" />
        </div>
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(columnCount)].map((_, i) => (
                    <TableHead key={i} className="min-w-[100px]">
                      <Skeleton className="h-5 w-20" />
                    </TableHead>
                  ))}
                  <TableHead className="text-right min-w-[100px]">
                     <Skeleton className="h-5 w-16 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(rowCount)].map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {[...Array(columnCount)].map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
