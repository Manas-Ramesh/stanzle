import { forwardRef } from "react";
import { Link, type LinkProps } from "react-router";
import { prefetchUnlimitedChallenge } from "@/lib/challenge";

/** Starts loading unlimited challenge on hover/focus so navigation feels instant. */
export const UnlimitedPrefetchLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function UnlimitedPrefetchLink({ onMouseEnter, onFocus, ...rest }, ref) {
    return (
      <Link
        ref={ref}
        {...rest}
        onMouseEnter={(e) => {
          prefetchUnlimitedChallenge();
          onMouseEnter?.(e);
        }}
        onFocus={(e) => {
          prefetchUnlimitedChallenge();
          onFocus?.(e);
        }}
      />
    );
  },
);
