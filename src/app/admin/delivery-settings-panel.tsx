"use client";

import { useEffect, useRef, useState } from "react";
import type { Commune, Wilaya } from "@/lib/settings-store";
import { cn } from "@/lib/cn";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import type { AdminSettings } from "./admin-types";
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

export function DeliverySettingsPanel({ token }: { token: string }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [chosenFile, setChosenFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [communeWilayaFilter, setCommuneWilayaFilter] = useState<number | "all">(
    "all"
  );
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const s = json?.settings as AdminSettings | undefined;
        if (s) setSettings(s);
      })
      .catch(() => undefined);
  }, []);

  function updateWilaya(index: number, patch: Partial<Wilaya>) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              wilayas: (prev.delivery.wilayas ?? []).map((w, i) =>
                i === index ? { ...w, ...patch } : w
              ),
            },
          }
        : prev
    );
    setSaved(false);
  }

  function removeWilaya(index: number) {
    const prev = settings;
    if (!prev || prev.delivery.wilayas == null) return;
    const removed = prev.delivery.wilayas[index];
    if (!removed) return;
    if (!window.confirm(`Supprimer la wilaya ${removed.name} et ses communes ?`))
      return;
    const communes = (prev.delivery.communes ?? []).filter(
      (c) => c.wilayaId !== removed.id
    );
    setSettings(() => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        wilayas: prev.delivery.wilayas!.filter((_, i) => i !== index),
        communes,
      },
    }));
    setSaved(false);
  }

  function addWilaya() {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              wilayas: [
                ...(prev.delivery.wilayas ?? []),
                {
                  id:
                    (prev.delivery.wilayas ?? []).length > 0
                      ? Math.max(...(prev.delivery.wilayas ?? []).map((w) => w.id)) + 1
                      : 1,
                  name: "",
                  homeFee: 0,
                },
              ],
            },
          }
        : prev
    );
    setSaved(false);
  }

  function updateCommune(index: number, patch: Partial<Commune>) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              communes: (prev.delivery.communes ?? []).map((c, i) =>
                i === index ? { ...c, ...patch } : c
              ),
            },
          }
        : prev
    );
    setSaved(false);
  }

  function addCommune() {
    if (!settings) return;
    const wilayas = settings.delivery.wilayas ?? [];
    const targetWilaya =
      communeWilayaFilter === "all"
        ? wilayas.length === 1
          ? wilayas[0]
          : null
        : wilayas.find((w) => w.id === communeWilayaFilter) ?? null;
    if (targetWilaya == null) return;
    const existingIds = (settings.delivery.communes ?? [])
      .filter((c) => c.wilayaId === targetWilaya.id)
      .map((c) => c.id);
    const nextId =
      existingIds.length > 0
        ? Math.max(...existingIds) + 1
        : targetWilaya.id * 10000 + 1;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              communes: [
                ...(prev.delivery.communes ?? []),
                { id: nextId, wilayaId: targetWilaya.id, name: "" },
              ],
            },
          }
        : prev
    );
    setSaved(false);
  }

  function removeCommune(index: number) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              communes: (prev.delivery.communes ?? []).filter(
                (_, i) => i !== index
              ),
            },
          }
        : prev
    );
    setSaved(false);
  }

  async function onSave() {
    if (!settings) return;
    setSaving(true);
    setError(false);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      const json = await res.json();
      if (json.settings) setSettings(json.settings);
      setSaved(true);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function onImportFile(file: File) {
    if (!token) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/delivery/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        counts?: { wilayas: number; communes: number; offices: number };
        total?: { wilayas: number; communes: number; offices: number };
        log?: string[];
        error?: string;
      } | null;
      if (res.ok && json?.ok && json?.counts) {
        setImportMsg({
          ok: true,
          text: `Importé : ${json.counts.wilayas} wilayas, ${json.counts.communes} communes, ${json.counts.offices} bureaux. Totals : ${json.total?.wilayas} / ${json.total?.communes} / ${json.total?.offices}.${json.log?.length ? ` ${json.log.join(" ")}` : ""}`,
        });
        const sres = await fetch("/api/settings");
        const sjson = await sres.json();
        if (sjson.settings) setSettings(sjson.settings);
      } else {
        setImportMsg({ ok: false, text: `Erreur : ${json?.error ?? "inconnue"}` });
      }
    } catch {
      setImportMsg({ ok: false, text: "Erreur réseau." });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
      setChosenFile(null);
    }
  }

  if (!settings) {
    return (
      <p className="mt-10 text-center text-dzb-faint">
        Chargement des paramètres…
      </p>
    );
  }

  const wilayas = settings.delivery.wilayas ?? [];
  const communes = settings.delivery.communes ?? [];
  const visibleCommunes =
    communeWilayaFilter === "all"
      ? communes
      : communes.filter((c) => c.wilayaId === communeWilayaFilter);

  const hasCommuneWithoutHomeFee =
    wilayas.length > 0 && wilayas.some((w) => !w.homeFee);

  return (
    <div className="space-y-6">
      <div className={panelCard}>
        <h2 className={panelHeading}>Données de livraison</h2>
        <p className={panelMuted}>
          Saisissez manuellement les wilayas et les communes, ou importez-les
          depuis un fichier Excel. Chaque wilaya a un prix à domicile et un prix
          bureau (stop-desk), tous deux utilisés par la page commande.
        </p>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-dzb-navy">Import Excel</h3>
          <p className="mt-1 text-xs text-dzb-muted">
            Le fichier peut contenir des feuilles ou colonnes nommées : wilayas
            (nom, prix à domicile, prix bureau), communes (commune + wilaya).
            Format Guepex pris en charge. Les colonnes sont détectées
            automatiquement (français, arabe ou anglais).
          </p>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) {
                setChosenFile(f);
                setImportMsg(null);
              }
            }}
            className={cn(
              "mt-3 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors",
              dragOver
                ? "border-dzb-amber bg-dzb-cream/50"
                : "border-dzb-creamline bg-dzb-cream/30"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                setChosenFile(e.target.files?.[0] ?? null);
                setImportMsg(null);
              }}
              className="sr-only"
              id="of-excel-file"
              style={{ position: "absolute", width: "1px", height: "1px" }}
            />
            <label
              htmlFor="of-excel-file"
              className="cursor-pointer rounded-lg border border-dzb-creamline bg-white px-4 py-2 text-sm font-medium text-dzb-navy shadow-sm transition hover:border-dzb-amber hover:text-dzb-amberink"
            >
              Choisir un fichier…
            </label>
            {chosenFile && (
              <span className="max-w-[260px] truncate text-sm text-dzb-muted">
                {chosenFile.name}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                if (chosenFile) onImportFile(chosenFile);
              }}
              disabled={!chosenFile || importing}
              className={saveButton}
            >
              {importing ? "Import en cours…" : "Importer le fichier"}
            </button>
          </div>
          {importMsg && (
            <p
              className={cn(
                "mt-2 rounded-lg border px-3 py-2 text-sm",
                importMsg.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-600"
              )}
            >
              {importMsg.text}
            </p>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-dzb-navy">
              Wilayas ({wilayas.length})
            </h3>
            <button type="button" onClick={addWilaya} className={secondaryButton}>
              <PlusIcon className="h-4 w-4" />
              Ajouter
            </button>
          </div>
          {hasCommuneWithoutHomeFee && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
              Certaines wilayas n&apos;ont pas de prix domicile : le tarif général
              sera utilisé pour elles.
            </div>
          )}
          <div className="mt-3 overflow-hidden rounded-xl border border-dzb-creamline">
            <div className="grid grid-cols-[70px_1.2fr_1.2fr_100px_100px_40px] gap-2 bg-dzb-cream/60 px-4 py-2.5 text-[13px] font-semibold text-dzb-navy">
              <span>Id</span>
              <span>Nom</span>
              <span>Nom arabe</span>
              <span>Prix domicile</span>
              <span>Prix bureau</span>
              <span />
            </div>
            {wilayas.map((w, index) => (
              <div
                key={w.id}
                className="grid grid-cols-[70px_1.2fr_1.2fr_100px_100px_40px] items-center gap-2 border-t border-dzb-creamline px-4 py-2.5 transition-colors hover:bg-dzb-cream/30"
              >
                <input
                  type="number"
                  min="1"
                  value={w.id}
                  onChange={(e) =>
                    updateWilaya(index, { id: Number(e.target.value) || 0 })
                  }
                  className={cn(inputClass, "py-1.5 text-xs")}
                />
                <input
                  value={w.name}
                  onChange={(e) =>
                    updateWilaya(index, { name: e.target.value })
                  }
                  placeholder="Alger"
                  className={cn(inputClass, "py-1.5 text-xs")}
                />
                <input
                  value={w.nameAr ?? ""}
                  onChange={(e) =>
                    updateWilaya(index, { nameAr: e.target.value })
                  }
                  placeholder="الجزائر"
                  dir="rtl"
                  className={cn(inputClass, "py-1.5 text-xs")}
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={w.homeFee}
                  onChange={(e) =>
                    updateWilaya(index, {
                      homeFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className={cn(inputClass, "py-1.5 text-xs")}
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={w.stopDeskFee ?? ""}
                  onChange={(e) =>
                    updateWilaya(index, {
                      stopDeskFee: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="0"
                  className={cn(inputClass, "py-1.5 text-xs")}
                />
                <button
                  type="button"
                  aria-label="Supprimer la wilaya"
                  onClick={() => removeWilaya(index)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-dzb-faint transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {wilayas.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-dzb-muted">
                Aucune wilaya : la livraison ne sera pas proposée tant que le
                catalogue n&apos;est pas rempli (manuellement ou via Excel).
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-dzb-navy">
              Communes ({communes.length})
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={communeWilayaFilter}
                onChange={(e) =>
                  setCommuneWilayaFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className={cn(inputClass, "w-56 appearance-none py-2 text-xs")}
              >
                <option value="all">Toutes les wilayas</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCommune}
                disabled={wilayas.length === 0}
                className={cn(secondaryButton, "disabled:opacity-50 disabled:cursor-not-allowed")}
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-dzb-muted">
            Sélectionnez une wilaya pour gérer ses communes puis « Ajouter ».
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-dzb-creamline">
            <div className="grid grid-cols-[120px_1fr_1fr_40px] gap-2 bg-dzb-cream/60 px-4 py-2.5 text-[13px] font-semibold text-dzb-navy">
              <span>Wilaya</span>
              <span>Commune</span>
              <span>Nom arabe</span>
              <span />
            </div>
            {visibleCommunes.map((c) => {
              const globalIndex = communes.findIndex(
                (x) => x.id === c.id && x.wilayaId === c.wilayaId
              );
              const wilayaName =
                wilayas.find((w) => w.id === c.wilayaId)?.name ?? "—";
              return (
                <div
                  key={`${c.wilayaId}-${c.id}`}
                  className="grid grid-cols-[120px_1fr_1fr_40px] items-center gap-2 border-t border-dzb-creamline px-4 py-2.5 transition-colors hover:bg-dzb-cream/30"
                >
                  <span className="truncate text-xs text-dzb-muted">{wilayaName}</span>
                  <input
                    value={c.name}
                    onChange={(e) =>
                      updateCommune(globalIndex, { name: e.target.value })
                    }
                    placeholder="Bab Ezzouar"
                    className={cn(inputClass, "py-1.5 text-xs")}
                  />
                  <input
                    value={c.nameAr ?? ""}
                    onChange={(e) =>
                      updateCommune(globalIndex, { nameAr: e.target.value })
                    }
                    placeholder="باب الزوار"
                    dir="rtl"
                    className={cn(inputClass, "py-1.5 text-xs")}
                  />
                  <button
                    type="button"
                    aria-label="Supprimer la commune"
                    onClick={() => removeCommune(globalIndex)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-dzb-faint transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {visibleCommunes.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-dzb-muted">
                {communeWilayaFilter === "all"
                  ? "Aucune commune : les clients pourront quand même choisir une wilaya pour la livraison à domicile."
                  : "Aucune commune pour cette wilaya."}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className={saveButton}
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {saved && (
            <span className="text-sm font-medium text-emerald-600">
              Paramètres enregistrés.
            </span>
          )}
          {error && (
            <span className="text-sm font-medium text-red-600">
              Impossible d&apos;enregistrer les paramètres.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
