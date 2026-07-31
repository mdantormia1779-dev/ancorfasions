import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="flex-1 bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Have a question about an order, our products, or our stores? We're
              here to help. Reach out to us using the form below or our contact
              details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Contact Information */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="border-none bg-slate-50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Headquarters
                      </h3>
                      <p className="text-sm text-slate-600">
                        123 Fashion Avenue
                        <br />
                        Dhaka 1212, Bangladesh
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Phone</h3>
                      <p className="text-sm text-slate-600">+880 1234 567890</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Email</h3>
                      <p className="text-sm text-slate-600">
                        support@anchorfashion.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Support Hours
                      </h3>
                      <p className="text-sm text-slate-600">
                        Sun - Thu: 9:00 AM - 6:00 PM
                        <br />
                        Fri - Sat: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium text-slate-700"
                        >
                          Full Name
                        </label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-slate-700"
                        >
                          Email Address
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-sm font-medium text-slate-700"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="Order Inquiry, Returns, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-sm font-medium text-slate-700"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        className="min-h-[150px]"
                      />
                    </div>
                    <Button type="button" className="w-full sm:w-auto">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
