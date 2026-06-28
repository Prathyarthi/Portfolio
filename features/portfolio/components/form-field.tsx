import { cn } from "@/lib/utils";
import { EDIT_FORM_FIELD_CLASS } from "@/features/dashboard/constants/form-layout";

type FormFieldProps = {
  children: React.ReactNode;
  className?: string;
};

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn(EDIT_FORM_FIELD_CLASS, className)}>{children}</div>;
}
