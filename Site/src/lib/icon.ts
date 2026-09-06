import type { ComponentType } from "react";

/** Shape every lucide-react icon satisfies. Use instead of `typeof SomeIcon`. */
export type IconComponent = ComponentType<{ className?: string }>;
