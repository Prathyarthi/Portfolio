import { cn } from "@/lib/utils";
import {
  EDIT_FORM_FIELDS_CLASS,
  EDIT_FORM_SECTION_DESC_CLASS,
  EDIT_FORM_SECTION_HEADER_CLASS,
  EDIT_FORM_SECTION_TITLE_CLASS,
} from "@/features/dashboard/constants/form-layout";

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className={EDIT_FORM_SECTION_HEADER_CLASS}>
        <h3 className={EDIT_FORM_SECTION_TITLE_CLASS}>{title}</h3>
        {description ? (
          <p className={EDIT_FORM_SECTION_DESC_CLASS}>{description}</p>
        ) : null}
      </div>
      <div className={EDIT_FORM_FIELDS_CLASS}>{children}</div>
    </section>
  );
}
