"use client"

import { useState } from "react"
import { Check, ChevronDown, MapPin, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useCollege } from "@/contexts/college-context"
import type { College } from "@/contexts/college-context"

type CollegeSelectorProps = {
  className?: string
  onSelectCallback?: (college: College) => void
}

export default function CollegeSelector({ className, onSelectCallback }: CollegeSelectorProps) {
  const [open, setOpen] = useState(false)
  const { selectedCollege, setSelectedCollege, colleges } = useCollege()

  const handleSelectCollege = (college: College) => {
    setSelectedCollege(college)
    setOpen(false)
    if (onSelectCallback) {
      onSelectCallback(college)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-full md:w-[240px]", className)}
        >
          {selectedCollege ? (
            <div className="flex items-center">
              <School className="mr-2 h-4 w-4 text-rose-500" />
              <span>{selectedCollege.abbreviation}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <School className="mr-2 h-4 w-4" />
              <span>Select your college</span>
            </div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search colleges..." />
          <CommandEmpty>No college found.</CommandEmpty>
          <CommandList>
            <CommandGroup heading="Bay Area Colleges">
              {colleges.map((college) => (
                <CommandItem key={college.id} value={college.name} onSelect={() => handleSelectCollege(college)}>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <School className="mr-2 h-4 w-4 text-rose-500" />
                      <span>{college.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCollege?.id === college.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      <MapPin className="inline-block h-3 w-3 mr-1" />
                      {college.domain}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
