export declare function PublishSummary({ flags, onLockToggle, }: {
    flags: {
        rounded?: boolean;
        taxAdjust?: boolean;
        manualAdjust?: boolean;
    };
    onLockToggle?: (next: 'Draft' | 'Published') => void;
}): import("react/jsx-runtime").JSX.Element;
