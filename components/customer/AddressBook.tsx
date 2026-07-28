'use client';

import { useState, useTransition } from 'react';
import { CustomerAddress } from '@/types/customer.types';
import { createAddressAction } from '@/app/actions/customer.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AddressBookProps {
  addresses: CustomerAddress[];
}

export function AddressBook({ addresses }: AddressBookProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('is_default_shipping', (e.currentTarget.elements.namedItem('is_default_shipping') as HTMLInputElement).checked ? 'true' : 'false');
    formData.append('is_default_billing', (e.currentTarget.elements.namedItem('is_default_billing') as HTMLInputElement).checked ? 'true' : 'false');
    
    startTransition(async () => {
      try {
        await createAddressAction(formData);
        toast.success('Address added successfully');
        setIsOpen(false);
      } catch (error) {
        toast.error('Failed to add address');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button />}>
            Add New Address
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input id="address_line_1" name="address_line_1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
                <Input id="address_line_2" name="address_line_2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" name="state" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP / Postal Code</Label>
                  <Input id="zip" name="zip" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" required defaultValue="US" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_default_shipping">Set as Default Shipping</Label>
                <Switch id="is_default_shipping" name="is_default_shipping" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_default_billing">Set as Default Billing</Label>
                <Switch id="is_default_billing" name="is_default_billing" />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Address'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
            No addresses saved yet.
          </div>
        ) : (
          addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{address.first_name} {address.last_name}</CardTitle>
                  <div className="flex gap-2">
                    {address.is_default_shipping && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Shipping</span>}
                    {address.is_default_billing && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Billing</span>}
                  </div>
                </div>
                <CardDescription>{address.phone}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{address.address_line_1}</p>
                {address.address_line_2 && <p>{address.address_line_2}</p>}
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>{address.country}</p>
              </CardContent>
              <CardFooter className="pt-0 justify-end gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
