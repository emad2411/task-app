import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2,
  Circle,
  Copy,
  Moon,
  Sun,
  Palette,
  Type,
  LayoutGrid,
  MousePointer,
  Search,
} from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-6xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1
            className="text-4xl md:text-5xl font-semibold tracking-tight"
            style={{ letterSpacing: "-1.28px" }}
          >
            Design System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A living documentation of TaskFlow&apos;s design tokens. Inspired by Mintlify — clean, airy, and engineered for legibility.
          </p>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-2 h-auto p-1 bg-transparent border rounded-lg">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="interactive" className="flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Interactive
            </TabsTrigger>
          </TabsList>

          {/* Colors */}
          <TabsContent value="colors" className="space-y-8 mt-8">
            {/* Primary Colors */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Primary Colors</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Near Black" value="#0d0d0d" textColor="text-white" />
                <ColorSwatch name="Pure White" value="#ffffff" border />
                <ColorSwatch name="Brand Green" value="#18E299" />
                <ColorSwatch name="Brand Green Light" value="#d4fae8" textColor="#0fa76e" />
              </div>
            </section>

            {/* Neutral Scale */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Neutral Scale</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Gray 900" value="#0d0d0d" textColor="text-white" />
                <ColorSwatch name="Gray 700" value="#333333" textColor="text-white" />
                <ColorSwatch name="Gray 500" value="#666666" textColor="text-white" />
                <ColorSwatch name="Gray 400" value="#888888" textColor="text-white" />
                <ColorSwatch name="Gray 200" value="#e5e5e5" />
                <ColorSwatch name="Gray 100" value="#f5f5f5" />
                <ColorSwatch name="Gray 50" value="#fafafa" />
              </div>
            </section>

            {/* Accents */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Accent Colors</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Brand Green Deep" value="#0fa76e" textColor="text-white" />
                <ColorSwatch name="Warm Amber" value="#c37d0d" textColor="text-white" />
                <ColorSwatch name="Soft Blue" value="#3772cf" textColor="text-white" />
                <ColorSwatch name="Error Red" value="#d45656" textColor="text-white" />
              </div>
            </section>

            {/* Borders */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Borders</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BorderSwatch name="Subtle (5%)" value="rgba(0,0,0,0.05)" />
                <BorderSwatch name="Medium (8%)" value="rgba(0,0,0,0.08)" />
                <BorderSwatch name="Focus" value="#18E299" isFocus />
              </div>
            </section>
          </TabsContent>

          {/* Typography */}
          <TabsContent value="typography" className="space-y-8 mt-8">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Type Scale</h2>
              <div className="space-y-6">
                <TypeSample size="64px" weight={600} tracking="-1.28px" label="Display Hero" />
                <TypeSample size="40px" weight={600} tracking="-0.8px" label="Section Heading" />
                <TypeSample size="24px" weight={500} tracking="-0.24px" label="Sub-heading" />
                <TypeSample size="20px" weight={600} tracking="-0.2px" label="Card Title" />
                <TypeSample size="18px" weight={400} label="Body Large" />
                <TypeSample size="16px" weight={400} label="Body" />
                <TypeSample size="15px" weight={500} label="Button" />
                <TypeSample size="14px" weight={500} label="Link" />
                <TypeSample size="13px" weight={500} tracking="0.65px" label="Label Uppercase" isUppercase />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Monospace</h2>
              <div className="space-y-6 font-mono">
                <TypeSample size="12px" weight={500} tracking="0.6px" label="Mono Code" isMono isUppercase />
                <TypeSample size="12px" weight={600} tracking="0.6px" label="Mono Badge" isMono isUppercase />
                <TypeSample size="10px" weight={500} label="Mono Micro" isMono isUppercase />
              </div>
            </section>
          </TabsContent>

          {/* Components */}
          <TabsContent value="components" className="space-y-8 mt-8">
            {/* Buttons */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Buttons</h2>
              <Card className="p-6">
                <div className="flex flex-wrap gap-4">
                  <Button className="rounded-full px-6">Primary</Button>
                  <Button variant="outline" className="rounded-full px-6">
                    Secondary
                  </Button>
                  <Button variant="ghost" className="rounded-full px-6">
                    Ghost
                  </Button>
                  <Button variant="link" className="px-6">
                    Link
                  </Button>
                </div>
              </Card>
            </section>

            {/* Badges */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Badges</h2>
              <Card className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge className="bg-[#d4fae8] text-[#0fa76e] hover:bg-[#d4fae8]/80">
                    Brand
                  </Badge>
                </div>
              </Card>
            </section>

            {/* Inputs */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Inputs</h2>
              <Card className="p-6">
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="hello@example.com" className="rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Enter password" className="rounded-full" />
                  </div>
                </div>
              </Card>
            </section>

            {/* Cards */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Cards</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Standard Card</CardTitle>
                    <CardDescription>Border: rgba(0,0,0,0.05), Radius: 16px</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Cards use generous padding (24px) with large radii and whisper-thin borders.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-[rgba(0,0,0,0.08)]">
                  <CardHeader>
                    <CardTitle>Featured Card</CardTitle>
                    <CardDescription>Radius: 24px, Padding: 32px</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Featured cards use larger radius for emphasis and more internal padding.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Form Elements */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Form Elements</h2>
              <Card className="p-6">
                <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="marketing" />
                    <Label htmlFor="marketing">Receive marketing emails</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </section>
          </TabsContent>

          {/* Interactive */}
          <TabsContent value="interactive" className="space-y-8 mt-8">
            {/* States */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">States</h2>
              <Card className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Default</h3>
                    <Button className="w-full rounded-full">Get Started</Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Hover</h3>
                    <Button className="w-full rounded-full opacity-90">Get Started</Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Disabled</h3>
                    <Button className="w-full rounded-full" disabled>
                      Get Started
                    </Button>
                  </div>
                </div>
              </Card>
            </section>

            {/* Loading */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Loading States</h2>
              <Card className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Skeleton</h3>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Skeleton Card</h3>
                    <Card className="p-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </Card>
                  </div>
                </div>
              </Card>
            </section>

            {/* Focus Ring */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Focus Ring</h2>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Focus rings use brand green (#18E299) for accessibility compliance.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="rounded-full focus:ring-2 focus:ring-[#18E299] focus:ring-offset-2">
                    Focusable Button
                  </Button>
                  <Input
                    className="max-w-xs rounded-full focus:ring-2 focus:ring-[#18E299] focus:ring-offset-2"
                    placeholder="Focus me"
                  />
                </div>
              </Card>
            </section>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Separator />
        <div className="text-center text-sm text-muted-foreground">
          <p>Design tokens inspired by Mintlify · Built with shadcn/ui</p>
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({
  name,
  value,
  textColor = "text-white",
  border,
}: {
  name: string;
  value: string;
  textColor?: string;
  border?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={`h-20 rounded-xl flex items-center justify-center ${textColor} ${border ? "border border-[rgba(0,0,0,0.08)]" : ""}`}
        style={{ backgroundColor: value }}
      >
        <span className="text-xs font-mono uppercase tracking-wider opacity-70">{value}</span>
      </div>
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

function BorderSwatch({
  name,
  value,
  isFocus,
}: {
  name: string;
  value: string;
  isFocus?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={`h-20 rounded-xl flex items-center justify-center border-2 ${
          isFocus ? "border-[#18E299]" : "border-[rgba(0,0,0,0.08)]"
        }`}
        style={{ backgroundColor: isFocus ? undefined : value }}
      >
        <span className="text-xs font-mono uppercase tracking-wider opacity-70">
          {isFocus ? "Focus" : value}
        </span>
      </div>
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

function TypeSample({
  size,
  weight,
  tracking,
  label,
  isUppercase,
  isMono,
}: {
  size: string;
  weight: number;
  tracking?: string;
  label: string;
  isUppercase?: boolean;
  isMono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-[rgba(0,0,0,0.05)] pb-2">
      <span
        className={isMono ? "font-mono" : "font-sans"}
        style={{ fontSize: size, fontWeight: weight, letterSpacing: tracking }}
      >
        {label}
      </span>
      <span className="text-sm text-muted-foreground font-mono">
        {size} / {weight} {tracking && `/ ${tracking}`}
      </span>
    </div>
  );
}