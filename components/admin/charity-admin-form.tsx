"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertCharityAction } from "@/app/actions/admin-charities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Charity = Record<string, unknown> & {
  id?: string;
  name?: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  mission?: string | null;
  website_url?: string | null;
  country?: string | null;
  featured?: boolean;
  tags?: string[] | null;
};

export function CharityAdminForm({ initial }: { initial?: Charity }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const isEdit = Boolean(initial?.id);

  return (
    <form
      className="max-w-xl space-y-4 rounded-xl border border-border/70 bg-card/60 p-6"
      action={(fd) => {
        start(async () => {
          const tagsRaw = (fd.get("tags") as string) || "";
          const tags = tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          const res = await upsertCharityAction({
            id: initial?.id,
            name: fd.get("name") as string,
            slug: fd.get("slug") as string,
            short_description: (fd.get("short_description") as string) || null,
            description: (fd.get("description") as string) || null,
            mission: (fd.get("mission") as string) || null,
            website_url: (fd.get("website_url") as string) || null,
            country: (fd.get("country") as string) || null,
            featured: fd.get("featured") === "on",
            tags,
            logo_url: (fd.get("logo_url") as string) || null,
            cover_image_url: (fd.get("cover_image_url") as string) || null,
          });
          if (!res.ok) {
            toast.error(typeof res.error === "string" ? res.error : "Validation failed");
            return;
          }
          toast.success(isEdit ? "Charity updated" : "Charity created");
          router.refresh();
          if (!isEdit) {
            (fd as unknown as HTMLFormElement).reset();
          }
        });
      }}
    >
      {!isEdit && <h2 className="font-heading text-lg font-semibold">New charity</h2>}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={initial?.name as string | undefined} disabled={pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required defaultValue={initial?.slug as string | undefined} disabled={pending || isEdit} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="short_description">Short description</Label>
        <Input id="short_description" name="short_description" defaultValue={(initial?.short_description as string) ?? ""} disabled={pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mission">Mission</Label>
        <Textarea id="mission" name="mission" defaultValue={(initial?.mission as string) ?? ""} disabled={pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Long description</Label>
        <Textarea id="description" name="description" defaultValue={(initial?.description as string) ?? ""} disabled={pending} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website_url">Website</Label>
          <Input id="website_url" name="website_url" defaultValue={(initial?.website_url as string) ?? ""} disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={(initial?.country as string) ?? "UK"} disabled={pending} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" name="tags" defaultValue={(initial?.tags as string[])?.join(", ") ?? ""} disabled={pending} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input id="logo_url" name="logo_url" defaultValue={(initial?.logo_url as string) ?? ""} disabled={pending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover_image_url">Cover URL</Label>
          <Input id="cover_image_url" name="cover_image_url" defaultValue={(initial?.cover_image_url as string) ?? ""} disabled={pending} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={Boolean(initial?.featured)} disabled={pending} />
        Featured on homepage
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Create charity"}
      </Button>
    </form>
  );
}
