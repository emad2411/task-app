"use client";

import { useTransition, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

type ContactFormInput = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(_data: ContactFormInput) {
    startTransition(async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSuccess(true);
    });
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-brand/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-brand" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Message sent
        </h2>
        <p className="text-muted-foreground mb-8">
          Thanks for reaching out. We typically respond within one business day.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      id="contact-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-name">Name</FieldLabel>
              <Input
                {...field}
                id="contact-name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-email">Email</FieldLabel>
              <Input
                {...field}
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="subject"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
              <Input
                {...field}
                id="contact-subject"
                type="text"
                placeholder="What is this about?"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea
                {...field}
                id="contact-message"
                placeholder="Tell us what's on your mind..."
                rows={5}
                disabled={isPending}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        form="contact-form"
        className="w-full bg-brand text-background hover:bg-brand-deep"
        disabled={isPending}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Message
      </Button>
    </form>
  );
}
