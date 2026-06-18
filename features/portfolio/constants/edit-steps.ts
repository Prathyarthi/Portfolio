import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Globe,
  Trophy,
  Layers,
  type LucideIcon,
} from "lucide-react";

export const EDIT_STEPS = [
  { value: "basic", label: "Basic Info", short: "Basic", icon: User },
  { value: "experience", label: "Experience", short: "Exp", icon: Briefcase },
  { value: "education", label: "Education", short: "Edu", icon: GraduationCap },
  { value: "skills", label: "Skills", short: "Skills", icon: Wrench },
  { value: "projects", label: "Projects", short: "Projects", icon: FolderKanban },
  { value: "achievements", label: "Achievements", short: "Awards", icon: Trophy },
  { value: "custom", label: "Custom Sections", short: "Custom", icon: Layers },
  { value: "social", label: "Social Links", short: "Social", icon: Globe },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  short: string;
  icon: LucideIcon;
}>;

export type EditStepValue = (typeof EDIT_STEPS)[number]["value"];
