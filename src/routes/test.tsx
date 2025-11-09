import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("text-title-4 font-semibold text-black")}>
        Input Types
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">text</label>
          <Input type="text" placeholder="Text input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">email</label>
          <Input type="email" placeholder="Email input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">password</label>
          <Input type="password" placeholder="Password input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">number</label>
          <Input type="number" placeholder="Number input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">search</label>
          <Input type="search" placeholder="Search input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">tel</label>
          <Input type="tel" placeholder="Tel input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">url</label>
          <Input type="url" placeholder="URL input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">date</label>
          <Input type="date" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">time</label>
          <Input type="time" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">datetime-local</label>
          <Input type="datetime-local" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">month</label>
          <Input type="month" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">week</label>
          <Input type="week" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">color</label>
          <Input type="color" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">range</label>
          <Input type="range" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-black">file</label>
          <Input type="file" />
        </div>
      </div>
    </div>
  );
}
