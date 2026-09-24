"use client";

import { useTransition } from "react";
import { CustomerProfile } from "@/types/customer.types";
import { updateProfileAction } from "@/app/actions/customer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Please enter a valid BD phone number (e.g. 01712345678)")
    .or(z.literal(""))
    .optional(),
  date_of_birth: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditorProps {
  profile: CustomerProfile | null;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
      date_of_birth:
        typeof profile?.date_of_birth === "string"
          ? profile.date_of_birth.split("T")[0]
          : "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("first_name", values.first_name);
    formData.append("last_name", values.last_name);
    formData.append("phone", values.phone || "");
    formData.append("date_of_birth", values.date_of_birth || "");

    startTransition(async () => {
      try {
        const res = await updateProfileAction(formData);
        if (res && res.success) {
          toast.success("Profile updated successfully");
        } else {
          toast.error("Failed to update profile");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update profile");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.first_name || "Avatar"}
              />
              <AvatarFallback>
                {profile?.first_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                Upload Avatar
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, GIF or PNG. Max size of 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                className={errors.first_name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.first_name && (
                <p className="text-xs text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                className={errors.last_name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.last_name && (
                <p className="text-xs text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              defaultValue={profile?.email || ""}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register("date_of_birth")}
              className={errors.date_of_birth ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.date_of_birth && (
              <p className="text-xs text-destructive">{errors.date_of_birth.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
