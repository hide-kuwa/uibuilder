"use client";
import React, { useMemo } from "react";
import { useDesignTokens } from "@/store/designTokensStore";
export default function TokenStyle() {
  const t = useDesignTokens((s) => s.tokens);
  const css = useMemo(() => {
    const vars: string[] = [];
    Object.entries(t.color || {}).forEach(([k, v]) =>
      vars.push(`--color-${k}:${v}`),
    );
    Object.entries(t.radius || {}).forEach(([k, v]) =>
      vars.push(`--radius-${k}:${v}px`),
    );
    Object.entries(t.space || {}).forEach(([k, v]) =>
      vars.push(`--space-${k}:${v}px`),
    );
    Object.entries(t.fontSize || {}).forEach(([k, v]) =>
      vars.push(`--fontSize-${k}:${v}px`),
    );
    Object.entries(t.fontFamily || {}).forEach(([k, v]) =>
      vars.push(`--fontFamily-${k}:${v}`),
    );
    return `:root{${vars.join(";")}}`;
  }, [t]);
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
