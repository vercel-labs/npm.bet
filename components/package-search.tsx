"use client";

import { Command as CommandPrimitive } from "cmdk";
import { PackageSearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  type NpmSearchResponse,
  searchPackages,
} from "@/actions/package/search";
import { cn } from "@/lib/utils";
import { usePackages } from "@/providers/filters";
import { Badge } from "./ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";

const DEBOUNCE_MS = 200;

export const PackageSearch = () => {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [packages, setPackages] = usePackages();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [value]);

  const { data, error } = useSWR<NpmSearchResponse>(
    debouncedValue ? debouncedValue.toLowerCase() : null,
    searchPackages,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const handleSelect = (packageName: string) => {
    if (!packages.includes(packageName)) {
      setPackages([...packages, packageName]);
    }
    setValue("");
  };

  const handleRemove = (packageName: string) => {
    setPackages(packages.filter((pkg) => pkg !== packageName));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value.trim() !== "") {
      event.preventDefault();
      handleSelect(value.trim());
    } else if (
      event.key === "Backspace" &&
      value === "" &&
      packages.length > 0
    ) {
      event.preventDefault();
      const newPackages = [...packages];
      newPackages.pop();
      setPackages(newPackages);
    }
  };

  const shouldShowResults = debouncedValue.trim().length > 0;
  const showEmptyState = data && data.objects.length === 0;
  const showResults = data && data.objects.length > 0;

  return (
    <div className="absolute bottom-4 left-1/2 w-full max-w-xs -translate-x-1/2 md:max-w-md">
      <Command className="w-full rounded-lg border">
        {shouldShowResults ? (
          <CommandList>
            {error ? (
              <CommandEmpty>Failed to load packages. Try again.</CommandEmpty>
            ) : null}
            {showEmptyState ? (
              <CommandEmpty className="flex items-center gap-2 p-4 text-muted-foreground text-sm">
                <PackageSearchIcon className="size-3" /> No packages found.
              </CommandEmpty>
            ) : null}
            {showResults ? (
              <CommandGroup>
                {data.objects.map((item) => (
                  <CommandItem
                    key={item.package.name}
                    onSelect={() => handleSelect(item.package.name)}
                    value={item.package.name}
                  >
                    <span className="shrink-0 truncate font-medium">
                      {item.package.name}
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      {item.package.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        ) : null}
        <div className="flex items-center gap-2 overflow-x-auto px-3">
          <PackageSearchIcon className="size-4 shrink-0 opacity-50" />
          {packages.map((pkg) => (
            <Badge className="gap-1 pr-1 pl-2" key={pkg} variant="secondary">
              {pkg}
              <button
                className="rounded-sm p-0.5 transition-colors hover:bg-secondary-foreground/20"
                onClick={() => handleRemove(pkg)}
                type="button"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            autoCapitalize="off"
            autoFocus
            className={cn(
              "flex flex-1 rounded-md bg-transparent py-2 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            )}
            onKeyDown={handleKeyDown}
            onValueChange={setValue}
            placeholder="Search..."
            value={value}
          />
        </div>
      </Command>
    </div>
  );
};
