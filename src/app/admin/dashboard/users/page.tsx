
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, Trash2, Loader2, Users as UsersIconLucide, UserPlus, Save, Eye, EyeOff, KeyRound, Mail as MailIcon, User as UserIcon } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from '@/types';
import { getAdminUsers, deleteManyAdminUsers, createAdminUser } from '@/services/adminUserService';
import { format } from 'date-fns';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const signupFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(50, { message: "Username too long."}),
  email: z.string().email({ message: "Please enter a valid email address." }).max(100, { message: "Email too long."}),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], 
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function ManageAdminUsersPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isSingleDeleteDialogOpen, setIsSingleDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const addUserForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const fetchAdminUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsers();
      setAdminUsers(data);
    } catch (error: any) {
      console.error("Failed to fetch admin users:", error);
      toast({ title: "Error Loading Users", description: error.message || "Failed to load admin users.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUserIds(prevSelected =>
      checked
        ? [...prevSelected, userId]
        : prevSelected.filter(id => id !== userId)
    );
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(adminUsers.map(user => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const isAllUsersSelected = adminUsers.length > 0 && selectedUserIds.length === adminUsers.length;

  const openSingleDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setIsSingleDeleteDialogOpen(true);
  };

  const handleConfirmSingleDelete = async () => {
    if (!userToDelete) return;
    const user = adminUsers.find(u => u.id === userToDelete);
    if (!user) return;

    try {
      const result = await deleteManyAdminUsers([userToDelete]);
      if (result.success) {
        setAdminUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete));
        setSelectedUserIds(prev => prev.filter(id => id !== userToDelete));
        toast({
          title: "Admin User Deleted",
          description: `User "${user.username}" has been removed.`,
        });
      } else {
        throw new Error(result.error || `Failed to delete user "${user.username}".`);
      }
    } catch (error: any) {
      toast({
        title: "Error Deleting User",
        description: error.message || `Failed to delete user "${user.username}".`,
        variant: "destructive",
      });
    } finally {
      setIsSingleDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const openBatchDeleteDialog = () => {
    if (selectedUserIds.length === 0) {
      toast({ title: "No Users Selected", description: "Please select users to delete.", variant: "destructive" });
      return;
    }
    setIsBatchDeleteDialogOpen(true);
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      const result = await deleteManyAdminUsers(selectedUserIds);
      if (result.success) {
        setAdminUsers(prevUsers => prevUsers.filter(user => !selectedUserIds.includes(user.id)));
        toast({
          title: "Admin Users Deleted",
          description: `${result.deletedCount} user(s) have been removed.`,
        });
        setSelectedUserIds([]);
      } else {
        throw new Error(result.error || "Failed to delete selected users.");
      }
    } catch (error: any) {
      toast({
        title: "Error Deleting Users",
        description: error.message || "Failed to delete selected users.",
        variant: "destructive",
      });
    } finally {
      setIsBatchDeleteDialogOpen(false);
    }
  };

  async function onAddUserSubmit(data: SignupFormValues) {
    setIsCreatingUser(true);
    try {
      const result = await createAdminUser({ username: data.username, email: data.email, password: data.password });
      if (result.success && result.user) {
        toast({
          title: "Admin Account Created!",
          description: `User "${result.user.username}" has been successfully created.`,
        });
        addUserForm.reset();
        setIsAddUserDialogOpen(false);
        fetchAdminUsers(); // Refresh the user list
      } else {
        toast({
          title: "Signup Failed",
          description: result.error || "Could not create admin account.",
          variant: "destructive",
        });
        if (result.error?.toLowerCase().includes('email already exists')) {
          addUserForm.setError("email", { type: "manual", message: "This email is already registered." });
        }
        if (result.error?.toLowerCase().includes('username already exists')) {
          addUserForm.setError("username", { type: "manual", message: "This username is already taken." });
        }
      }
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message || "An unexpected error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Admin Users"
            pageDescriptionText="View, create, and delete admin user accounts."
            TitleIcon={UsersIconLucide}
            mainButtonText="Add New Admin User"
            cardTitleText="All Admin Users"
            cardDescriptionText="List of all registered admin users."
            columnCount={3} 
        />
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
              <UsersIconLucide className="mr-3 h-6 w-6 text-primary" /> Manage Admin Users
            </h1>
            <p className="text-muted-foreground">View, create, and delete admin user accounts.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {selectedUserIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={openBatchDeleteDialog}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedUserIds.length})
              </Button>
            )}
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="button-primary w-full sm:w-auto">
                  <UserPlus className="mr-2 h-5 w-5" /> Add New Admin User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center"><UserPlus className="mr-2 h-6 w-6 text-primary" /> Create New Admin User</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new admin account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Form {...addUserForm}>
                    <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-6">
                      <FormField control={addUserForm.control} name="username" render={({ field }) => (
                          <FormItem><FormLabel>Username</FormLabel><FormControl><div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="text" placeholder="Choose a username" {...field} autoComplete="new-password" className="pl-10"/></div></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={addUserForm.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email Address</FormLabel><FormControl><div className="relative"><MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="email" placeholder="Enter email address" {...field} autoComplete="new-password" className="pl-10"/></div></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={addUserForm.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>Password</FormLabel><FormControl><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type={showPassword ? 'text' : 'password'} placeholder="Create a password (min. 6 characters)" {...field} autoComplete="new-password" className="pl-10 pr-10"/><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={togglePasswordVisibility} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</Button></div></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={addUserForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" {...field} autoComplete="new-password" className="pl-10 pr-10"/><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={toggleConfirmPasswordVisibility} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</Button></div></FormControl><FormMessage /></FormItem>
                      )}/>
                      <DialogFooter className="sm:justify-between items-center pt-4">
                        <DialogClose asChild>
                          <Button type="button" variant="outline" disabled={isCreatingUser}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" className="button-primary" disabled={isCreatingUser}>
                          {isCreatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" /> }
                          Create Admin User
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Admin Users</CardTitle>
            <CardDescription>List of all registered admin users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isAllUsersSelected}
                        onCheckedChange={(value) => handleSelectAllUsers(!!value)}
                        aria-label="Select all users"
                        disabled={adminUsers.length === 0}
                      />
                    </TableHead>
                    <TableHead className="min-w-[150px]">Username</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[150px]">Created At</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.length === 0 && !isLoading && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No admin users found. Add your first admin!</TableCell></TableRow>
                  )}
                  {adminUsers.map((user) => (
                    <TableRow key={user.id} data-state={selectedUserIds.includes(user.id) ? "selected" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUserIds.includes(user.id)}
                          onCheckedChange={(value) => handleSelectUser(user.id, !!value)}
                          aria-label={`Select user ${user.username}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.createdAt ? format(new Date(user.createdAt), 'PP p') : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openSingleDeleteDialog(user.id)}
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

        {/* Single Delete Confirmation Dialog */}
        <AlertDialog open={isSingleDeleteDialogOpen} onOpenChange={setIsSingleDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the admin user account
                "{adminUsers.find(u => u.id === userToDelete)?.username || 'the selected user'}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSingleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Batch Delete Confirmation Dialog */}
        <AlertDialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Admin Users?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {selectedUserIds.length} admin user account(s). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmBatchDelete} className="bg-destructive hover:bg-destructive/90">
                Delete Selected Users
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </FadeIn>
  );
}
