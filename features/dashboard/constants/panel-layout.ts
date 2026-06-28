/** Left tracker / edit rail — edit & import progress stepper. */
export const DASHBOARD_TRACKER_ASIDE_CLASS =
  "hidden h-full min-h-0 shrink-0 flex-col self-start overflow-hidden lg:flex lg:w-[14rem] lg:pl-4 lg:pr-3 xl:w-[15rem] xl:pl-4 xl:pr-3 2xl:w-[15rem]";

/** Preview page inspect & edit sidebar — wider for forms and template picker. */
export const PREVIEW_EDIT_SIDEBAR_CLASS =
  "hidden h-full min-h-0 shrink-0 flex-col overflow-hidden lg:flex lg:w-[18rem] lg:pl-4 lg:pr-4 xl:w-[20rem] xl:pl-5 xl:pr-4 2xl:w-[22rem]";

/** Tighter card padding inside dashboard edit/import forms. */
export const DASHBOARD_FORM_COMPACT_CLASS =
  "[&_[data-slot=card]]:gap-4 [&_[data-slot=card]]:py-4 [&_[data-slot=card-header]]:px-4 [&_[data-slot=card-content]]:px-4";

/** Right main column — fills remaining width like the preview canvas area. */
export const DASHBOARD_MAIN_COLUMN_CLASS =
  "flex min-h-0 min-w-0 w-full flex-1 flex-col gap-3 lg:overflow-hidden";

/** Preview-matched content frame (sunken border wrapper). */
export const DASHBOARD_CONTENT_FRAME_CLASS =
  "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-surface-sunken p-2 shadow-[var(--shadow-modal)] sm:p-3";

export const DASHBOARD_CONTENT_INNER_CLASS =
  "min-h-0 w-full flex-1 overflow-y-auto overscroll-contain rounded-[var(--radius-md)] bg-surface-base p-4 sm:p-5 " +
  DASHBOARD_FORM_COMPACT_CLASS;
