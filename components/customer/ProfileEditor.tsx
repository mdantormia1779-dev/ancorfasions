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

interface ProfileEditorProps {
  profile: CustomerProfile | null;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error("Failed to update profile");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
                name="first_name"
                defaultValue={profile?.first_name || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={profile?.last_name || ""}
              />
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
              name="phone"
              type="tel"
              defaultValue={profile?.phone || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={profile?.date_of_birth?.split("T")[0] || ""}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
