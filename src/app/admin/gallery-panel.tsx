"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  projectCategories,
  type CategoryId,
  type Project,
} from "@/data/projects";
import type { LocalizedText } from "@/lib/localize";
import { cn } from "@/lib/cn";
import { PlusIcon, TrashIcon, CheckIcon } from "@/components/ui/icons";
import {
  inputClass,
  labelClass,
  panelCard,
  panelHeading,
  panelMuted,
  saveButton,
  secondaryButton,
  dangerButton,
} from "./admin-types";

const MEDIA_URL = (key: string) => `/api/media/${key}`;

type LocalizedRecord = { fr: string; en: string; ar: string };

const EMPTY_LANG: LocalizedRecord = { fr: "", en: "", ar: "" };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function blankProject(): Project {
  return {
    slug: "",
    title: EMPTY_LANG,
    category: "impression-3d",
    summary: {}, problem: {}, solution: {}, method: {}, result: {},
    client: {}, duration: {},
    year: String(new Date().getFullYear()),
    featured: false,
    images: [],
  };
}

export function GalleryPanel({ token }: { token: string }) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const load = useCallback(() => {
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (Array.isArray(json?.projects)) setProjects(json.projects);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryLabel = useCallback(
    (id: CategoryId): string => {
      const c = projectCategories.find((x) => x.id === id);
      return c?.label.fr ?? id;
    },
    []
  );

  async function persist(next: Project[]) {
    setSaving(true);
    setError(false);
    setSaved(false);
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projects: next }),
      });
      if (!res.ok) {
        setError(true);
        return false;
      }
      const json = await res.json();
      if (Array.isArray(json?.projects)) setProjects(json.projects);
      setSaved(true);
      return true;
    } catch {
      setError(true);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    if (!projects) return;
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    persist(next);
  }

  function removeProject(project: Project) {
    if (!projects) return;
    if (!window.confirm(`Supprimer le projet Â« ${project.title.fr} Â» ?`)) return;
    persist(projects.filter((p) => p.slug !== project.slug));
  }

  async function saveEdited() {
    if (!editing || !projects) return;
    const frTitle = editing.title.fr ?? "";
    const slug = editing.slug.trim() || slugify(frTitle);
    if (!slug || !frTitle.trim()) {
      setError(true);
      return;
    }
    const clean: Project = { ...editing, slug };
    const exists = projects.some((p) => p.slug === slug && p.slug !== (editing.slug || slug));
    if (exists) {
      setError(true);
      return;
    }
    const existing = projects.find((p) => p.slug === editing.slug);
    const next = existing
      ? projects.map((p) => (p.slug === existing.slug ? clean : p))
      : [...projects, clean];
    setEditing(null);
    await persist(next);
  }

  return (
    <div className="space-y-6">
      <div className={panelCard}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={panelHeading}>Galerie â€” RÃ©alisations</h2>
            <p className={panelMuted}>
              GÃ©rez les projets affichÃ©s sur la page Â« RÃ©alisations Â» : ajout,
              modification, suppression, catÃ©gorie et ordre d&apos;affichage.
              Utilisez les flÃ¨ches pour monter / descendre un projet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(blankProject())}
            className={secondaryButton}
          >
            <PlusIcon className="h-4 w-4" />
            Nouveau projet
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            Erreur lors de l&apos;enregistrement du catalogue.
          </p>
        )}
        {saved && (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            Catalogue enregistrÃ©.
          </p>
        )}
      </div>

      {editing && (
        <ProjectEditor
          project={editing}
          token={token}
          onCancel={() => setEditing(null)}
          onSave={saveEdited}
          onChange={setEditing}
          cancelDisabled={saving}
          categoryLabel={categoryLabel}
        />
      )}

      {projects === null ? (
        <p className="py-10 text-center text-[#9a97a6]">Chargementâ€¦</p>
      ) : projects.length === 0 ? (
        <p className={cn(panelCard, "py-14 text-center text-[#6b6878]")}>
          Aucun projet. Cliquez sur Â« Nouveau projet Â» pour commencer.
        </p>
      ) : (
        <ul className="space-y-3">
          {projects.map((project, index) => (
            <li
              key={project.slug}
              className={cn(panelCard, "flex items-center gap-4 p-4")}
            >
              {/* Reorder */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  aria-label="Monter"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[#e6d9bf] text-[#6b6878] transition hover:border-dzb-amber hover:text-dzb-amberink disabled:opacity-30"
                >
                  â–²
                </button>
                <button
                  type="button"
                  aria-label="Descendre"
                  disabled={index === projects.length - 1}
                  onClick={() => move(index, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-[#e6d9bf] text-[#6b6878] transition hover:border-dzb-amber hover:text-dzb-amberink disabled:opacity-30"
                >
                  â–¼
                </button>
              </div>

              {/* Cover */}
              <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-[#f0e6d2] bg-[#f8f2e5]">
                {project.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={MEDIA_URL(project.images[0])}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[#9a97a6]">
                    Sans image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#2b2b46]">
                  {project.title.fr || project.slug}
                </p>
                <p className="mt-0.5 truncate text-sm text-[#6b6878]">
                  {categoryLabel(project.category)} Â· {project.year}
                  {project.featured ? " Â· â˜… Mis en avant" : ""}
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-[#9a97a6]">
                  /{project.slug}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={project.featured ? "Retirer de la page d'accueil" : "Mettre en avant sur la page d'accueil"}
                  title={project.featured ? "Mis en avant (page d'accueil)" : "Mettre en avant"}
                  onClick={() => persist(projects.map((p) => (p.slug === project.slug ? { ...p, featured: !p.featured } : p)))}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-md border text-lg transition",
                    project.featured
                      ? "border-amber-300 bg-amber-50 text-amber-500 hover:bg-amber-100"
                      : "border-[#e6d9bf] bg-white text-[#e6d9bf] hover:border-amber-300 hover:text-amber-400"
                  )}
                >
                  â˜…
                </button>
                <button
                  type="button"
                  onClick={() => setEditing({ ...project, images: [...(project.images ?? [])] })}
                  className={secondaryButton}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  aria-label="Supprimer"
                  onClick={() => removeProject(project)}
                  className={dangerButton}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectEditor({
  project,
  token,
  onChange,
  onSave,
  onCancel,
  cancelDisabled,
  categoryLabel,
}: {
  project: Project;
  token: string;
  onChange: (p: Project) => void;
  onSave: () => void;
  onCancel: () => void;
  cancelDisabled: boolean;
  categoryLabel: (id: CategoryId) => string;
}) {
  return (
    <div className={panelCard}>
      <h2 className={panelHeading}>
        {project.title.fr ? `Modifier : ${project.title.fr}` : "Nouveau projet"}
      </h2>

      <LangTextField
        label="Titre (FR, EN, AR)"
        value={project.title as LocalizedRecord}
        onChange={(title) => onChange({ ...project, title: title as LocalizedText })}
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>CatÃ©gorie</label>
          <select
            value={project.category}
            onChange={(e) =>
              onChange({ ...project, category: e.target.value as CategoryId })
            }
            className={cn(inputClass, "appearance-none")}
          >
            {projectCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryLabel(c.id)}
              </option>
            ))}
          </select>
        </div>
        {project.slug && (
          <div>
            <label className={labelClass}>Lien (slug)</label>
            <input
              value={project.slug}
              onChange={(e) => onChange({ ...project, slug: e.target.value })}
              dir="ltr"
              placeholder={slugify(project.title.fr ?? "") || "mon-projet"}
              className={cn(inputClass, "font-mono text-xs")}
            />
          </div>
        )}
        <div className="flex items-end">
          <label className={cn(labelClass, "flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4a4560]")}>
            <input
              type="checkbox"
              checked={project.featured}
              onChange={(e) => onChange({ ...project, featured: e.target.checked })}
              className="h-4 w-4 rounded border-[#e6d9bf] text-dzb-amberink focus:ring-dzb-amber"
            />
            Mis en avant (page d&apos;accueil)
          </label>
        </div>
      </div>

      <ImageManager project={project} token={token} onChange={onChange} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f8f2e5] pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelDisabled}
          className={secondaryButton}
        >
          Annuler
        </button>
        <button type="button" onClick={onSave} disabled={cancelDisabled} className={saveButton}>
          <CheckIcon className="h-4 w-4" />
          Enregistrer le projet
        </button>
      </div>
    </div>
  );
}

function LangTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocalizedRecord;
  onChange: (v: LocalizedRecord) => void;
}) {
  return (
    <div className="mt-3">
      <label className={labelClass}>{label}</label>
      <div className="grid gap-2 sm:grid-cols-3">
        <LangInput lang="fr" value={value.fr} onChange={(v) => onChange({ ...value, fr: v })} />
        <LangInput lang="en" value={value.en} onChange={(v) => onChange({ ...value, en: v })} dir="ltr" />
        <LangInput lang="ar" value={value.ar} onChange={(v) => onChange({ ...value, ar: v })} dir="rtl" />
      </div>
    </div>
  );
}

function LangInput({
  lang,
  value,
  onChange,
  dir,
}: {
  lang: string;
  value: string;
  onChange: (v: string) => void;
  dir?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir={dir}
      placeholder={lang}
      className={inputClass}
    />
  );
}

function ImageManager({
  project,
  token,
  onChange,
}: {
  project: Project;
  token: string;
  onChange: (p: Project) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const images = project.images ?? [];

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      for (const file of Array.from(files)) fd.append("file", file);
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        keys?: string[];
        error?: string;
      } | null;
      if (res.ok && json?.ok && json.keys) {
        onChange({ ...project, images: [...images, ...json.keys] });
      } else {
        const reason =
          res.status === 401
            ? "Non autorisÃ© : reconnectez-vous."
            : res.status === 413
              ? "Image(s) trop lourde(s)."
              : json?.error === "no_file"
                ? "Aucun fichier reÃ§u."
                : json?.error === "invalid_body"
                  ? "RequÃªte invalide."
                  : `Ã‰chec de l'upload (statut ${res.status}).`;
        setUploadError(reason);
      }
    } catch (err) {
      setUploadError(
        `Erreur rÃ©seau : ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeImage(key: string) {
    onChange({ ...project, images: images.filter((k) => k !== key) });
    try {
      await fetch(`/api/media/${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-5 rounded-lg border border-[#f0e6d2] bg-[#fdfaf3]/60 p-4">
      <p className="text-sm font-medium text-[#4a4560]">Images du projet</p>
      <p className="mt-0.5 text-xs text-[#6b6878]">
        La premiÃ¨re image sert de couverture. Ajoutez plusieurs photos â€” elles
        apparaÃ®tront dans la galerie de la page projet.
      </p>
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((key, i) => (
            <div
              key={key}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#e6d9bf] bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MEDIA_URL(key)} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute start-1 top-1 rounded bg-dzb-amber px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Couverture
                </span>
              )}
              <button
                type="button"
                aria-label="Supprimer l'image"
                onClick={() => removeImage(key)}
                className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-red-500/90 text-white opacity-0 transition group-hover:opacity-100"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onFiles(e.target.files)}
        className="sr-only"
        id="gallery-files"
        style={{ position: "absolute", width: "1px", height: "1px" }}
      />
      {uploadError && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {uploadError}
        </p>
      )}
      <label
        htmlFor="gallery-files"
        className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#e6d9bf] bg-white px-3 py-2 text-sm font-medium text-[#4a4560] shadow-sm transition hover:border-dzb-amber hover:text-dzb-amberink"
      >
        <PlusIcon className="h-4 w-4" />
        {uploading ? "Chargementâ€¦" : "Ajouter des images"}
      </label>
    </div>
  );
}