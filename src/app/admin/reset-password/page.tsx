
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, KeyRound, ArrowLeft, Send } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSiteSettings } from '@/services/siteSettingsService';
import { useAuth } from '@/contexts/auth-context';

const passwordResetSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmNewPassword: z.string().min(6, { message: "Please confirm your new password." }),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isFetchingSettings, setIsFetchingSettings] = useState(true);

  const fetchAdminEmail = useCallback(async () => {
    setIsFetchingSettings(true);
    try {
      const settings = await getSiteSettings();
      setAdminEmail(settings.adminEmail || null);
    } catch (error) {
      toast({
        title: "Error fetching admin email",
        description: "Could not retrieve admin email for OTP. Please ensure it's set in Site Settings.",
        variant: "destructive",
      });
      setAdminEmail(null);
    } finally {
      setIsFetchingSettings(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdminEmail();
  }, [fetchAdminEmail]);

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleSendOtp = async () => {
    if (!adminEmail) {
      toast({
        title: "Admin Email Not Configured",
        description: "Cannot send OTP. Please set the admin email in Site Settings.",
        variant: "destructive",
      });
      return;
    }
    setIsSendingOtp(true);
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "OTP Sent (Simulated)",
      description: `An OTP has been "sent" to ${adminEmail}. Check your inbox. (Use '123456' for this demo).`,
    });
    setOtpSent(true);
    setIsSendingOtp(false);
  };

  async function onSubmit(data: PasswordResetFormValues) {
    setIsLoading(true);

    if (data.otp !== "123456") {
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. (Hint: use '123456')",
        variant: "destructive",
      });
      form.setError("otp", { type: "manual", message: "Invalid OTP." });
      setIsLoading(false);
      return;
    }

    // Simulate successful password change. This does NOT update the database.
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Password Changed (Simulated)",
      description: "Your admin password has been notionally 'updated'. You will be logged out and redirected to login. Please use your actual database credentials to log back in.",
    });
    form.reset();
    setOtpSent(false);
    setIsLoading(false);

    logout();
    router.push('/admin/login');
  }

  if (isFetchingSettings) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading admin email...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Reset Admin Password</h1>
        <p className="text-muted-foreground">Change the password for accessing the admin panel via OTP verification.</p>
      </div>

      <Alert variant="default" className="mb-6 border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
        <KeyRound className="h-4 w-4" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-300">Important Note</AlertTitle>
        <AlertDescription>
          This is a <strong>simulated</strong> password reset page with OTP. The actual login password is now managed in the database. This page does <strong>not</strong> change the database password. A real application would require a secure backend process for OTP generation, email sending, and database password updates. The admin email for OTP "sending" is configured in Site Settings.
        </AlertDescription>
      </Alert>

      {!otpSent ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Initiate Password Reset</CardTitle>
            <CardDescription>
              {adminEmail
                ? `An OTP will be "sent" to the configured admin email: ${adminEmail}.`
                : "Admin email not configured. Please set it in Site Settings."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleSendOtp} className="w-full button-primary" disabled={isSendingOtp || !adminEmail || isFetchingSettings}>
              {isFetchingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isSendingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isFetchingSettings ? 'Loading Email...' : isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Enter OTP & New Password</CardTitle>
                <CardDescription>An OTP was "sent" to {adminEmail}. Please enter it below along with your new password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="otp" render={({ field }) => (
                    <FormItem><FormLabel>One-Time Password (OTP)</FormLabel><FormControl><Input type="text" placeholder="Enter 6-digit OTP (e.g., 123456)" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="newPassword" render={({ field }) => (
                    <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" placeholder="Enter new password (min. 6 characters)" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="confirmNewPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" placeholder="Confirm new password" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button type="submit" className="button-primary" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Changes...</>) : (<><Save className="mr-2 h-4 w-4" /> Change Password (Simulated)</>)}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </FadeIn>
  );
}
