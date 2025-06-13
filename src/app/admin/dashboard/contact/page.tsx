
"use client"; 

import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FadeIn } from '@/components/motion/fade-in';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast"; 
import type { ContactMessage, ContactInfo } from '@/types';
import { getContactMessages, updateMessageStatus, deleteContactMessage, deleteManyContactMessages, getContactInfo, updateContactInfo } from '@/services/contactService';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Edit, Trash2, Eye, MoreHorizontal, MessageSquare, Send, Save, XCircle, Loader2, UserCircle } from 'lucide-react';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminContactPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [editedContactInfo, setEditedContactInfo] = useState<Omit<ContactInfo, 'id' | 'createdAt' | 'updatedAt'> | null>(null);
  const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingContactInfo, setIsLoadingContactInfo] = useState(true);
  const [isSavingContactInfo, setIsSavingContactInfo] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [currentMessageForReply, setCurrentMessageForReply] = useState<ContactMessage | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isSingleDeleteDialogOpen, setIsSingleDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);


  const fetchMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (error: any) {
      toast({ title: "Error Loading Messages", description: error.message || "Failed to load messages.", variant: "destructive" });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast]);

  const fetchContactInfo = useCallback(async () => {
    setIsLoadingContactInfo(true);
    try {
      const data = await getContactInfo();
      setContactInfo(data);
      const { id, createdAt, updatedAt, ...editableData } = data;
      setEditedContactInfo(editableData);
    } catch (error: any) {
      toast({ title: "Error Loading Contact Info", description: error.message || "Failed to load contact info.", variant: "destructive" });
    } finally {
      setIsLoadingContactInfo(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMessages();
    fetchContactInfo();
  }, [fetchMessages, fetchContactInfo]);

   useEffect(() => {
    if (!isEditingContactInfo && contactInfo) {
      const { id, createdAt, updatedAt, ...editableData } = contactInfo;
      setEditedContactInfo(editableData);
    }
  }, [isEditingContactInfo, contactInfo]);


  const handleOpenReplyDialog = (message: ContactMessage) => {
    setCurrentMessageForReply(message);
    setReplyText(`Hi ${message.name},\n\nThanks for reaching out regarding "${message.subject}".\n\n`);
    setIsReplyDialogOpen(true);
  };

  const handleSendReply = async () => {
    if (!currentMessageForReply || !replyText.trim()) return;
    setIsSendingReply(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 700));
      const updatedMessage = await updateMessageStatus(currentMessageForReply.id, 'Replied');
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === currentMessageForReply.id ? { ...msg, status: 'Replied', date: updatedMessage.date } : msg
        )
      );
      toast({
        title: "Reply 'Sent' (Simulated)",
        description: `Your reply to ${currentMessageForReply.name} has been 'sent' and status updated. No actual email was dispatched.`,
      });
      setIsReplyDialogOpen(false);
      setReplyText("");
      setCurrentMessageForReply(null);
    } catch (error: any) {
      toast({ title: "Error Sending Reply", description: error.message || "Failed to update message status.", variant: "destructive" });
    } finally {
      setIsSendingReply(false);
    }
  };

  const openSingleDeleteDialog = (id: string) => {
    setMessageToDelete(id);
    setIsSingleDeleteDialogOpen(true);
  };

  const handleConfirmSingleDelete = async () => {
    if (!messageToDelete) return;
    const message = messages.find(m => m.id === messageToDelete);
    if (!message) return;
    try {
      await deleteContactMessage(messageToDelete);
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageToDelete));
      setSelectedMessageIds(prev => prev.filter(id => id !== messageToDelete));
      toast({
        title: "Message Deleted",
        description: `Message from "${message.name}" has been removed.`,
      });
    } catch (error: any) {
       toast({ title: "Error Deleting Message", description: error.message || "Failed to delete message.", variant: "destructive" });
    } finally {
      setIsSingleDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };
  
  const openBatchDeleteDialog = () => {
    if (selectedMessageIds.length === 0) {
      toast({ title: "No Messages Selected", description: "Please select messages to delete.", variant: "destructive" });
      return;
    }
    setIsBatchDeleteDialogOpen(true);
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedMessageIds.length === 0) return;
    try {
      const result = await deleteManyContactMessages(selectedMessageIds);
      if (result.success) {
        setMessages(prevMessages => prevMessages.filter(msg => !selectedMessageIds.includes(msg.id)));
        toast({
          title: "Messages Deleted",
          description: `${result.deletedCount} message(s) have been removed.`,
        });
        setSelectedMessageIds([]);
      } else {
        throw new Error(result.error || "Failed to delete selected messages.");
      }
    } catch (error: any) {
       toast({
        title: "Error Deleting Messages",
        description: error.message || "Failed to delete selected messages.",
        variant: "destructive",
      });
    } finally {
      setIsBatchDeleteDialogOpen(false);
    }
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    setSelectedMessageIds(prevSelected =>
      checked
        ? [...prevSelected, messageId]
        : prevSelected.filter(id => id !== messageId)
    );
  };

  const handleSelectAllMessages = (checked: boolean) => {
    if (checked) {
      setSelectedMessageIds(messages.map(m => m.id));
    } else {
      setSelectedMessageIds([]);
    }
  };
  
  const isAllMessagesSelected = messages.length > 0 && selectedMessageIds.length === messages.length;


  const handleEditContactInfo = () => {
    if (contactInfo) {
      const { id, createdAt, updatedAt, ...editableData } = contactInfo;
      setEditedContactInfo(editableData);
    }
    setIsEditingContactInfo(true);
  };

  const handleSaveContactInfo = async () => {
    if (!editedContactInfo) return;
    setIsSavingContactInfo(true);
    try {
      const updated = await updateContactInfo(editedContactInfo);
      setContactInfo(updated); 
      const { id, createdAt, updatedAt, ...editableData } = updated;
      setEditedContactInfo(editableData);
      setIsEditingContactInfo(false);
      toast({
        title: "Contact Info Updated",
        description: "Agency contact details have been updated.",
      });
    } catch (error: any) {
       toast({ title: "Error Updating Contact Info", description: error.message || "Failed to update contact info.", variant: "destructive" });
    } finally {
      setIsSavingContactInfo(false);
    }
  };

  const handleCancelEditContactInfo = () => {
     if (contactInfo) {
        const { id, createdAt, updatedAt, ...editableData } = contactInfo;
        setEditedContactInfo(editableData);
    }
    setIsEditingContactInfo(false);
  };

  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; 
    setEditedContactInfo(prev => prev ? ({ ...prev, [name]: value }) : null);
  };


  if (isLoadingContactInfo || isLoadingMessages) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Contact Information & Messages"
            pageDescriptionText="Update your agency's contact details and review incoming messages."
            TitleIcon={UserCircle}
            mainButtonText="" // No Add New button for this page
            cardTitleText="Received Messages"
            cardDescriptionText="Messages submitted through your website's contact form."
            columnCount={6} // Checkbox, Name, Email, Subject, Date, Status
        />
    );
  }


  return (
    <FadeIn>
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <UserCircle className="mr-3 h-6 w-6 text-primary"/> Manage Contact Information & Messages
        </h1>
        <p className="text-muted-foreground">Update your agency's contact details and review incoming messages.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agency Contact Details</CardTitle>
          <CardDescription>This information is displayed on your public contact page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contactInfo && editedContactInfo ? (
            <>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={isEditingContactInfo ? editedContactInfo.email : contactInfo.email} 
                    readOnly={!isEditingContactInfo} 
                    onChange={handleContactInfoChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    name="phone" 
                    value={isEditingContactInfo ? editedContactInfo.phone : contactInfo.phone} 
                    readOnly={!isEditingContactInfo} 
                    onChange={handleContactInfoChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Physical Address</Label>
                <Textarea 
                  id="address"
                  name="address" 
                  value={isEditingContactInfo ? editedContactInfo.address : contactInfo.address} 
                  readOnly={!isEditingContactInfo} 
                  onChange={handleContactInfoChange}
                  className="mt-1 min-h-[60px]"
                  rows={2}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                {isEditingContactInfo ? (
                  <>
                    <Button onClick={handleSaveContactInfo} className="button-primary w-full sm:w-auto" disabled={isSavingContactInfo}>
                        {isSavingContactInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
                        Save Changes
                    </Button>
                    <Button onClick={handleCancelEditContactInfo} variant="outline" className="w-full sm:w-auto" disabled={isSavingContactInfo}>
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEditContactInfo} className="w-full sm:w-auto">
                      <Edit className="mr-2 h-4 w-4" /> Edit Contact Info
                  </Button>
                )}
              </div>
            </>
          ) : (<p className="text-muted-foreground text-center p-4">Contact information could not be loaded.</p>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Received Messages</CardTitle>
            <CardDescription>Messages submitted through your website's contact form.</CardDescription>
          </div>
           {selectedMessageIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={openBatchDeleteDialog}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedMessageIds.length})
            </Button>
          )}
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                       <Checkbox
                          checked={isAllMessagesSelected}
                          onCheckedChange={(value) => handleSelectAllMessages(!!value)}
                          aria-label="Select all messages"
                          disabled={messages.length === 0}
                        />
                    </TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[200px]">Subject</TableHead>
                    <TableHead className="min-w-[120px]">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.length === 0 && (
                     <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No messages received yet.</TableCell></TableRow>
                  )}
                  {messages.map((message) => (
                    <TableRow key={message.id} data-state={selectedMessageIds.includes(message.id) ? "selected" : ""}>
                      <TableCell>
                         <Checkbox
                            checked={selectedMessageIds.includes(message.id)}
                            onCheckedChange={(value) => handleSelectMessage(message.id, !!value)}
                            aria-label={`Select message from ${message.name}`}
                          />
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>{message.date ? format(new Date(message.date), 'PP') : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={
                            message.status === 'New' ? 'destructive' : 
                            message.status === 'Read' ? 'secondary' : 
                            message.status === 'Replied' ? 'default' : 
                            'outline' 
                        } className="capitalize">
                            {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isReplyDialogOpen && currentMessageForReply?.id === message.id} onOpenChange={(isOpen) => {
                            if (!isOpen) {
                                setIsReplyDialogOpen(false);
                                setCurrentMessageForReply(null);
                            }
                        }}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenReplyDialog(message)}>
                                    <Eye className="mr-2 h-4 w-4" /> View & Reply
                                </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openSingleDeleteDialog(message.id)} 
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Message from: {currentMessageForReply?.name}</DialogTitle>
                              <DialogDescription>
                                Subject: {currentMessageForReply?.subject} <br />
                                Email: <a href={`mailto:${currentMessageForReply?.email}`} className="text-primary hover:underline">{currentMessageForReply?.email}</a> | Date: {currentMessageForReply?.date ? format(new Date(currentMessageForReply.date), 'PP') : 'N/A'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <Card className="bg-muted/50 max-h-60 overflow-y-auto">
                                <CardHeader className="pb-2 sticky top-0 bg-muted/50 z-10">
                                  <CardTitle className="text-sm font-medium text-muted-foreground">Original Message:</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{currentMessageForReply?.messageBody}</p>
                                </CardContent>
                              </Card>
                              
                              <div>
                                <Label htmlFor="replyText" className="text-base font-medium flex items-center mb-2">
                                    <MessageSquare className="mr-2 h-5 w-5 text-primary"/> Your Reply:
                                </Label>
                                <Textarea
                                  id="replyText"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Replying to ${currentMessageForReply?.name}...`}
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
                              <Button type="button" onClick={handleSendReply} className="button-primary" disabled={isSendingReply || !replyText.trim()}>
                                {isSendingReply ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" /> }
                                Send Reply (Simulated)
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={isSingleDeleteDialogOpen} onOpenChange={setIsSingleDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the message from
              "{messages.find(m => m.id === messageToDelete)?.name || 'the selected user'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSingleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Delete Confirmation Dialog */}
      <AlertDialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Messages?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMessageIds.length} message(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBatchDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
    </FadeIn>
  );
}
