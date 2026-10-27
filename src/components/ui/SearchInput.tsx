"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <Search className="w-4 h-4 text-[#A89A85] absolute left-3.5 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full h-10 pl-10 pr-9 bg-[#1A130B] text-[#F5EDE0] placeholder:text-[#6F6354] rounded-full border border-[#C99A45]/25 focus:border-[#E8C77A] focus:outline-none focus:ring-1 focus:ring-[#E8C77A] transition-all text-xs font-sans",
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-0.5 text-[#A89A85] hover:text-[#F5EDE0] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
