import { useState, useRef, useEffect } from "preact/hooks";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { themes } from "../lib/constants";

export function ThemeToggler() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const current = theme === "system" ? systemTheme : theme;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button onClick={() => setOpen((prev) => !prev)} size={"sm"}>
        {(current ?? "light").charAt(0).toUpperCase() +
          (current ?? "light").slice(1)}
      </Button>

      {open && (
        <div class="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-card border text-card-foreground shadow-lg ring-1 ring-ring/45 focus:outline-none">
          <div class="py-1 flex flex-col gap-0.5">
            {themes.map((t) => (
              <Button
                key={t}
                onClick={() => {
                  setTheme(t);
                  setOpen(false);
                }}
                className="text-left border w-full justify-end"
                size="sm"
                variant={current === t ? "secondary" : "ghost"}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
