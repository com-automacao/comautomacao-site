"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

// Accordion (originui/21st.dev) sobre os primitivos do Radix — comportamento e
// acessibilidade do Radix, estilizado com as classes do design system (.faq*).
function Accordion(
  props: React.ComponentProps<typeof AccordionPrimitive.Root>,
) {
  return <AccordionPrimitive.Root {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item className={cn("faq-item", className)} {...props} />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="faq-header">
      <AccordionPrimitive.Trigger
        className={cn("faq-trigger", className)}
        {...props}
      >
        <span>{children}</span>
        <span className="faq-icon" aria-hidden />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className="faq-content" {...props}>
      <div className={cn("faq-answer", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
