"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  projectCategories,
  type CategoryId,
  type Project,
} from "@/data/projects";
import type { LocalizedText } from "@/lib/localize";
import { cn } from "@/lib/cn";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  SearchIcon,
  UploadIcon,
  LayersIcon,
  CloseIcon,
} from "@/components/ui/icons";
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
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<CategoryId | "all">("all");

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

  const filtered = useMemo(() => {
    if (!projects) return null;
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (filterCategory !== "all" && p.category !== filterCategory) return false;
      if (!q) return true;
      const haystack = [
        p.title.fr,
        p.title.en,
        p.title.ar,
        p.slug,
        p.year,
        categoryLabel(p.category),
      ]
        .filter((x): x is string => Boolean(x))
        .map((x) => x.toLowerCase())
        .join(" ");
      return haystack.includes(q);
    });
  }, [projects, search, filterCategory, categoryLabel]);

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
    if (!window.confirm(`Supprimer le projet « ${project.title.fr} » ?`)) return;
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

  const hasFilters = search.trim() !== "" || filterCategory !== "all";

  return (
    <div className="space-y-6">
      <div className={panelCard}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(panelHeading, "flex items-center gap-2")}>
              <LayersIcon className="h-5 w-5 text-dzb-amber" />
              Galerie — Réalisations
            </h2>
            <p className={panelMuted}>
              Gérez les projets affichés sur la page « Réalisations » : ajout,
              modification, suppression, catégorie et ordre d&apos;affichage.
              Utilisez les flèches pour monter / descendre un projet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(blankProject())}
            className={saveButton}
          >
            <PlusIcon className="h-4 w-4" />
            Nouveau projet
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dzb-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un projet…"
              className={cn(inputClass, "ps-9")}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as CategoryId | "all")}
            className={cn(inputClass, "sm:w-56")}
          >
            <option value="all">Toutes les catégories</option>
            {projectCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryLabel(c.id)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            Erreur lors de l&apos;enregistrement du catalogue.
          </p>
        )}
        {saved && (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            Catalogue enregistré.
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
        <ProjectListSkeleton />
      ) : projects.length === 0 ? (
        <div className={cn(panelCard, "py-14 text-center")}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dzb-tint text-dzb-amber">
            <LayersIcon className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-dzb-navy">Aucun projet pour le moment</p>
          <p className="mt-1 text-sm text-dzb-muted">
            Cliquez sur « Nouveau projet » pour commencer.
          </p>
        </div>
      ) : filtered && filtered.length === 0 ? (
        <div className={cn(panelCard, "py-14 text-center")}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dzb-tint text-dzb-amber">
            <SearchIcon className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-dzb-navy">
            Aucun résultat pour votre recherche
          </p>
          <p className="mt-1 text-sm text-dzb-muted">
            Essayez d&apos;autres mots-clés ou une autre catégorie.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilterCategory("all");
            }}
            className={cn(secondaryButton, "mt-4")}
          >
            <CloseIcon className="h-4 w-4" />
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {hasFilters && (
            <p className="px-1 text-xs font-medium uppercase tracking-wider text-dzb-faint">
              {filtered!.length} projet{filtered!.length > 1 ? "s" : ""} affiché
              {filtered!.length > 1 ? "s" : ""}
            </p>
          )}
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered!.map((project, index) => (
              <li
                key={project.slug}
                className={cn(panelCard, "group flex flex-col overflow-hidden p-0")}
              >
                <div className="relative aspect-[16/10] overflow-hidden border-b border-dzb-creamline bg-dzb-cream">
                  {project.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={MEDIA_URL(project.images[0])}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-dzb-faint">
                      Sans image
                    </div>
                  )}
                  {project.featured && (
                    <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-dzb-amber px-2.5 py-1 text-[11px] font-bold text-dzb-inkdark shadow-sm">
                      ★ Mis en avant
                    </span>
                  )}
                  <span className="absolute bottom-2 start-2 rounded-full bg-dzb-navy/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {categoryLabel(project.category)}
                  </span>
                  {project.year && (
                    <span className="absolute bottom-2 end-2 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-dzb-navy backdrop-blur">
                      {project.year}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="truncate font-display font-bold text-dzb-navy">
                    {project.title.fr || project.slug}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-dzb-faint">
                    /{project.slug}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-dzb-creamline pt-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        aria-label="Monter"
                        title="Monter"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-dzb-creamline text-dzb-muted transition hover:border-dzb-amber hover:text-dzb-amberink disabled:opacity-30 disabled:hover:border-dzb-creamline disabled:hover:text-dzb-muted"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        aria-label="Descendre"
                        title="Descendre"
                        disabled={index === filtered!.length - 1}
                        onClick={() => move(index, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-dzb-creamline text-dzb-muted transition hover:border-dzb-amber hover:text-dzb-amberink disabled:opacity-30 disabled:hover:border-dzb-creamline disabled:hover:text-dzb-muted"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={project.featured ? "Retirer de la page d'accueil" : "Mettre en avant sur la page d'accueil"}
                        title={project.featured ? "Mis en avant (page d'accueil)" : "Mettre en avant"}
                        onClick={() => persist(projects.map((p) => (p.slug === project.slug ? { ...p, featured: !p.featured } : p)))}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-md border text-lg transition",
                          project.featured
                            ? "border-dzb-amber/40 bg-dzb-tint text-dzb-amberink hover:bg-dzb-sand"
                            : "border-dzb-creamline bg-white text-dzb-creamline hover:border-dzb-amber/40 hover:text-dzb-amber"
                        )}
                      >
                        ★
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
                        className={cn(dangerButton, "px-3")}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProjectListSkeleton() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-dzb-creamline bg-white shadow-sm"
          >
            <div className="aspect-[16/10] animate-pulse bg-dzb-cream" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-dzb-creamline" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-dzb-creamline" />
              <div className="flex items-center gap-2 pt-3">
                <div className="h-7 w-16 animate-pulse rounded-md bg-dzb-creamline" />
                <div className="ml-auto h-9 w-20 animate-pulse rounded-lg bg-dzb-creamline" />
              </div>
            </div>
          </div>
        ))}
      </div>
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={cn(panelHeading, "flex items-center gap-2")}>
          <LayersIcon className="h-5 w-5 text-dzb-amber" />
          {project.title.fr ? `Modifier : ${project.title.fr}` : "Nouveau projet"}
        </h2>
      </div>

      <LangTextField
        label="Titre (FR, EN, AR)"
        value={project.title as LocalizedRecord}
        onChange={(title) => onChange({ ...project, title: title as LocalizedText })}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Catégorie</label>
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
        <div>
          <label className={labelClass}>Année</label>
          <input
            value={project.year ?? ""}
            onChange={(e) => onChange({ ...project, year: e.target.value })}
            dir="ltr"
            placeholder="2026"
            className={inputClass}
          />
        </div>
        {project.slug && (
          <div className="sm:col-span-2">
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
        <div className="flex items-center sm:col-span-2">
          <label className={cn(labelClass, "mb-0 flex cursor-pointer items-center gap-2 text-sm font-medium text-dzb-navy")}>
            <input
              type="checkbox"
              checked={project.featured}
              onChange={(e) => onChange({ ...project, featured: e.target.checked })}
              className="h-4 w-4 rounded border-dzb-creamline text-dzb-amber focus:ring-dzb-amber"
            />
            Mis en avant (page d&apos;accueil)
          </label>
        </div>
      </div>

      <ImageManager project={project} token={token} onChange={onChange} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dzb-creamline pt-4">
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
    <div className="mt-4">
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
    <div>
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-dzb-faint">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-dzb-tint text-[9px] font-bold text-dzb-amberink">
          {lang.toUpperCase()}
        </span>
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className={inputClass}
      />
    </div>
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
  const [dragging, setDragging] = useState(false);
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
            ? "Non autorisé : reconnectez-vous."
            : res.status === 413
              ? "Image(s) trop lourde(s)."
              : json?.error === "no_file"
                ? "Aucun fichier reçu."
                : json?.error === "invalid_body"
                  ? "Requête invalide."
                  : `Échec de l'upload (statut ${res.status}).`;
        setUploadError(reason);
      }
    } catch (err) {
      setUploadError(
        `Erreur réseau : ${err instanceof Error ? err.message : String(err)}`
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
    <div className="mt-5 rounded-lg border border-dzb-creamline bg-dzb-cream/60 p-4">
      <p className="text-sm font-medium text-dzb-navy">Images du projet</p>
      <p className="mt-0.5 text-xs text-dzb-muted">
        La première image sert de couverture. Ajoutez plusieurs photos — elles
        apparaîtront dans la galerie de la page projet.
      </p>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((key, i) => (
            <div
              key={key}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-dzb-creamline bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MEDIA_URL(key)} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute start-1 top-1 rounded bg-dzb-amber px-1.5 py-0.5 text-[10px] font-bold text-dzb-inkdark">
                  Couverture
                </span>
              )}
              <button
                type="button"
                aria-label="Supprimer l'image"
                onClick={() => removeImage(key)}
                className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-red-500/90 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
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
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition",
          dragging
            ? "border-dzb-amber bg-dzb-tint"
            : "border-dzb-creamline bg-white hover:border-dzb-amber/50 hover:bg-dzb-tint/40"
        )}
      >
        <UploadIcon className={cn("h-6 w-6", dragging ? "text-dzb-amberink" : "text-dzb-amber")} />
        <div>
          <p className="text-sm font-medium text-dzb-navy">
            {uploading ? "Chargement…" : "Glissez vos images ici"}
          </p>
          <p className="mt-0.5 text-xs text-dzb-muted">ou cliquez pour parcourir</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-dzb-creamline bg-white px-3 py-1.5 text-sm font-medium text-dzb-muted shadow-sm transition hover:border-dzb-amber hover:text-dzb-amberink">
          <PlusIcon className="h-4 w-4" />
          Ajouter des images
        </span>
      </label>
    </div>
  );
}
