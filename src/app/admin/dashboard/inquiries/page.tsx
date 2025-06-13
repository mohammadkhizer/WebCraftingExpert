
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, MoreHorizontal, Loader2, FileQuestion, Check, X, Send, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { ServiceInquiry, ServiceInquiryStatus } from '@/types';
import { getServiceInquiries, updateServiceInquiryStatus, deleteServiceInquiry } from '@/services/serviceInquiryService';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const inquiryStatusOptions: ServiceInquiryStatus[] = ['New', 'Pending', 'Contacted', 'Resolved', 'Closed'];

export default function AdminServiceInquiriesPage() {
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<ServiceInquiry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getServiceInquiries();
      setInquiries(data);
    } catch (error: any) {
      console.error("Failed to fetch service inquiries:", error);
      toast({ title: "Error Loading Inquiries", description: error.message || "Failed to load inquiries.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleViewInquiry = (inquiry: ServiceInquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewDialogOpen(true);
  };

  const handleOpenReplyDialog = (inquiry: ServiceInquiry) => {
    setSelectedInquiry(inquiry);
    setReplyText(`Hi ${inquiry.name},\n\nRegarding your inquiry about "${inquiry.serviceName}":\n\n`);
    setIsReplyDialogOpen(true);
  };

  const handleSendInquiryReply = async () => {
    if (!selectedInquiry || !replyText.trim()) return;
    setIsSendingReply(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 700));
      
      if (selectedInquiry.status === 'New' || selectedInquiry.status === 'Pending') {
        const updatedInquiry = await updateServiceInquiryStatus(selectedInquiry.id, 'Contacted');
        if (updatedInquiry) {
          setInquiries(prevInquiries =>
            prevInquiries.map(inq => (inq.id === selectedInquiry.id ? updatedInquiry : inq))
          );
        }
      }

      toast({
        title: "Reply 'Sent' (Simulated)",
        description: `Your reply to ${selectedInquiry.name} regarding "${selectedInquiry.serviceName}" has been simulated as sent.`,
      });
      setIsReplyDialogOpen(false);
      setReplyText("");
      setSelectedInquiry(null); 
    } catch (error: any) {
      toast({ title: "Error Sending Reply", description: error.message || "Failed to simulate reply or update status.", variant: "destructive" });
    } finally {
      setIsSendingReply(false);
    }
  };


  const handleChangeStatus = async (inquiryId: string, newStatus: ServiceInquiryStatus) => {
    setIsUpdatingStatus(inquiryId);
    try {
      const updatedInquiry = await updateServiceInquiryStatus(inquiryId, newStatus);
      if (updatedInquiry) {
        setInquiries(prevInquiries =>
          prevInquiries.map(inq => (inq.id === inquiryId ? updatedInquiry : inq))
        );
        toast({ title: "Status Updated", description: `Inquiry status changed to ${newStatus}.` });
      }
    } catch (error: any) {
      toast({ title: "Error Updating Status", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string, inquiryName: string, serviceName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the inquiry from "${inquiryName}" regarding "${serviceName}"?`);
    if (confirmed) {
      try {
        await deleteServiceInquiry(inquiryId);
        setInquiries(prevInquiries => prevInquiries.filter(inq => inq.id !== inquiryId));
        toast({ title: "Inquiry Deleted", description: `Inquiry from "${inquiryName}" has been removed.` });
      } catch (error: any) {
        toast({ title: "Error Deleting Inquiry", description: error.message, variant: "destructive" });
      }
    }
  };

  const getStatusBadgeVariant = (status: ServiceInquiryStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'New': return 'destructive';
      case 'Pending': return 'secondary';
      case 'Contacted': return 'default';
      case 'Resolved': return 'default'; 
      case 'Closed': return 'outline';
      default: return 'outline';
    }
  };


  if (isLoading) {
    return (
      <AdminTablePageSkeleton
        pageTitleText="Manage Service Inquiries"
        pageDescriptionText="Review and manage inquiries submitted for specific services."
        TitleIcon={FileQuestion}
        mainButtonText="" // No "Add New" button for inquiries
        cardTitleText="All Service Inquiries"
        cardDescriptionText="List of inquiries received through service pages."
        columnCount={5}
      />
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
              <FileQuestion className="mr-3 h-6 w-6 text-primary" /> Manage Service Inquiries
            </h1>
            <p className="text-muted-foreground">Review and manage inquiries submitted for specific services.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Service Inquiries</CardTitle>
            <CardDescription>List of inquiries received through service pages.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Service Name</TableHead>
                    <TableHead className="min-w-[150px]">Inquirer Name</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[120px]">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.length === 0 && !isLoading && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No service inquiries received yet.</TableCell></TableRow>
                  )}
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.serviceName}</TableCell>
                      <TableCell>{inquiry.name}</TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      <TableCell>{inquiry.createdAt ? format(new Date(inquiry.createdAt), 'PP p') : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(inquiry.status)} className="capitalize">
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              {isUpdatingStatus === inquiry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewInquiry(inquiry)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleOpenReplyDialog(inquiry)}>
                              <MessageSquare className="mr-2 h-4 w-4" /> Reply (Simulated)
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Send className="mr-2 h-4 w-4" />
                                <span>Change Status</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuRadioGroup 
                                    value={inquiry.status} 
                                    onValueChange={(newStatus) => handleChangeStatus(inquiry.id, newStatus as ServiceInquiryStatus)}
                                  >
                                    {inquiryStatusOptions.map(statusOpt => (
                                      <DropdownMenuRadioItem key={statusOpt} value={statusOpt} className="capitalize">
                                        {statusOpt}
                                      </DropdownMenuRadioItem>
                                    ))}
                                  </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteInquiry(inquiry.id, inquiry.name, inquiry.serviceName)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Details Dialog */}
      {selectedInquiry && isViewDialogOpen && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Inquiry from: {selectedInquiry.name}</DialogTitle>
              <DialogDescription>
                Regarding Service: {selectedInquiry.serviceName} <br />
                Email: <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">{selectedInquiry.email}</a>
                {selectedInquiry.phone && ` | Phone: ${selectedInquiry.phone}`} <br />
                Date: {selectedInquiry.createdAt ? format(new Date(selectedInquiry.createdAt), 'PP p') : 'N/A'} | Status: <Badge variant={getStatusBadgeVariant(selectedInquiry.status)} className="capitalize ml-1">{selectedInquiry.status}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <h4 className="font-medium text-muted-foreground">Message:</h4>
              <ScrollArea className="h-40 w-full rounded-md border p-3 bg-muted/30">
                <p className="text-sm text-foreground whitespace-pre-wrap">{selectedInquiry.message}</p>
              </ScrollArea>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reply Dialog */}
      {selectedInquiry && isReplyDialogOpen && (
        <Dialog open={isReplyDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setIsReplyDialogOpen(false);
                setSelectedInquiry(null);
                setReplyText("");
            }
        }}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to: {selectedInquiry.name} (Inquiry for {selectedInquiry.serviceName})</DialogTitle>
              <DialogDescription>
                Email: <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">{selectedInquiry.email}</a>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Card className="bg-muted/50 max-h-40 overflow-y-auto">
                <CardHeader className="pb-2 sticky top-0 bg-muted/50 z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Original Inquiry Message:</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedInquiry.message}</p>
                </CardContent>
              </Card>
              
              <div>
                <Label htmlFor="inquiryReplyText" className="text-base font-medium flex items-center mb-2">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary"/> Your Reply:
                </Label>
                <Textarea
                  id="inquiryReplyText"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Replying to ${selectedInquiry.name}...`}
                  className="min-h-[150px] text-sm"
                  disabled={isSendingReply}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between items-center">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSendingReply}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSendInquiryReply} className="button-primary" disabled={isSendingReply || !replyText.trim()}>
                {isSendingReply ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" /> }
                Send Reply (Simulated)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </FadeIn>
  );
}
