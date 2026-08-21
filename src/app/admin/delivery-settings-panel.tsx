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
          text: `ImportÃ© : ${json.counts.wilayas} wilayas, ${json.counts.communes} communes, ${json.counts.offices} bureaux. Totals : ${json.total?.wilayas} / ${json.total?.communes} / ${json.total?.offices}.${json.log?.length ? ` ${json.log.join(" ")}` : ""}`,
        });
        const sres = await fetch("/api/settings");
        const sjson = await sres.json();
        if (sjson.settings) setSettings(sjson.settings);
      } else {
        setImportMsg({ ok: false, text: `Erreur : ${json?.error ?? "inconnue"}` });
      }
    } catch {
      setImportMsg({ ok: false, text: "Erreur rÃ©seau." });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
      setChosenFile(null);
    }
  }

  if (!settings) {
    return (
      <p className="mt-10 text-center text-[#9a97a6]">
        Chargement des paramÃ¨tresâ€¦
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
        <h2 className={panelHeading}>DonnÃ©es de livraison</h2>
        <p className={panelMuted}>
          Saisissez manuellement les wilayas et les communes, ou importez-les
          depuis un fichier Excel. Chaque wilaya a un prix Ã  domicile et un prix
          bureau (stop-desk), tous deux utilisÃ©s par la page commande.
        </p>

        {/* Excel import */}
        <div className="mt-4 rounded-lg border border-dashed border-[#e6d9bf] bg-[#fdfaf3] p-4">
          <p className="text-sm font-medium text-[#4a4560]">
            Importer depuis Excel (.xlsx / .xls / .csv)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#6b6878]">
            Le fichier peut contenir des feuilles ou colonnes nommÃ©es : wilayas
            (nom, prix Ã  domicile, prix bureau), communes (commune + wilaya).
            Format Guepex pris en charge. Les colonnes sont dÃ©tectÃ©es
            automatiquement (franÃ§ais, arabe ou anglais).
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
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
              className="cursor-pointer rounded-md border border-[#e6d9bf] bg-white px-3 py-2 text-sm font-medium text-[#4a4560] shadow-sm transition hover:border-dzb-amber hover:text-dzb-amberink"
            >
              Choisir un fichierâ€¦
            </label>
            {chosenFile && (
              <span className="max-w-[220px] truncate text-sm text-[#5f5975]">
                ðŸ“Ž {chosenFile.name}
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
              {importing ? "Import en coursâ€¦" : "âŸ³ Importer le fichier"}
            </button>
          </div>
          {importMsg && (
            <p
              className={cn(
                "mt-2 text-sm",
                importMsg.ok ? "text-emerald-600" : "text-red-600"
              )}
            >
              {importMsg.text}
            </p>
          )}
        </div>

        {/* Wilayas */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#4a4560]">
              Wilayas ({wilayas.length}) â€” prix domicile &amp; bureau
            </p>
            <button type="button" onClick={addWilaya} className={secondaryButton}>
              <PlusIcon className="h-4 w-4" />
              Ajouter
            </button>
          </div>
          {hasCommuneWithoutHomeFee && (
            <p className="mt-2 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Certaines wilayas n&apos;ont pas de prix : le tarif gÃ©nÃ©ral sera
              utilisÃ© pour elles.
            </p>
          )}
          <div className="mt-3 space-y-2.5">
            {wilayas.map((w, index) => (
              <div
                key={w.id}
                className="grid gap-2.5 rounded-lg border border-[#f0e6d2] bg-white p-3 sm:grid-cols-[90px_1.2fr_1.2fr_110px_110px_auto]"
              >
                <div>
                  <label className={labelClass}>Id</label>
                  <input
                    type="number"
                    min="1"
                    value={w.id}
                    onChange={(e) =>
                      updateWilaya(index, { id: Number(e.target.value) || 0 })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Nom</label>
                  <input
                    value={w.name}
                    onChange={(e) =>
                      updateWilaya(index, { name: e.target.value })
                    }
                    placeholder="Alger"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Nom arabe (optionnel)</label>
                  <input
                    value={w.nameAr ?? ""}
                    onChange={(e) =>
                      updateWilaya(index, { nameAr: e.target.value })
                    }
                    placeholder="Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±"
                    dir="rtl"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Prix domicile</label>
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
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Prix bureau</label>
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
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Supprimer la wilaya"
                  onClick={() => removeWilaya(index)}
                  className="mt-5 flex h-8 w-8 items-center justify-center self-start rounded-md border border-[#e6d9bf] text-[#9a97a6] transition hover:border-red-300 hover:text-red-500"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {wilayas.length === 0 && (
              <p className="rounded-lg bg-[#fdfaf3] px-3 py-3 text-xs text-[#6b6878]">
                Aucune wilaya : la livraison ne sera pas proposÃ©e tant que le
                catalogue n&apos;est pas rempli (manuellement ou via Excel).
              </p>
            )}
          </div>
        </div>

        {/* Communes */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-[#4a4560]">
              Communes ({communes.length})
            </p>
            <div className="flex items-center gap-2">
              <select
                value={communeWilayaFilter}
                onChange={(e) =>
                  setCommuneWilayaFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className={cn(inputClass, "w-56 appearance-none")}
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
                className={cn(secondaryButton, "disabled:opacity-50")}
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-[#6b6878]">
            SÃ©lectionnez une wilaya pour gÃ©rer ses communes puis Â« Ajouter Â».
          </p>
          <div className="mt-3 space-y-2">
            {visibleCommunes.map((c, index) => {
              const globalIndex = communes.findIndex(
                (x) => x.id === c.id && x.wilayaId === c.wilayaId
              );
              const wilayaName =
                wilayas.find((w) => w.id === c.wilayaId)?.name ?? "â€”";
              return (
                <div
                  key={`${c.wilayaId}-${c.id}`}
                  className="grid grid-cols-[110px_1fr_1.2fr_auto] items-center gap-2.5 rounded-lg border border-[#f0e6d2] bg-white p-3"
                >
                  <span className="text-xs text-[#6b6878]">{wilayaName}</span>
                  <div>
                    <input
                      value={c.name}
                      onChange={(e) =>
                        updateCommune(globalIndex, { name: e.target.value })
                      }
                      placeholder="Bab Ezzouar"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <input
                      value={c.nameAr ?? ""}
                      onChange={(e) =>
                        updateCommune(globalIndex, { nameAr: e.target.value })
                      }
                      placeholder="Ø¨Ø§Ø¨ Ø§Ù„Ø²ÙˆØ§Ø±"
                      dir="rtl"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Supprimer la commune"
                    onClick={() => removeCommune(globalIndex)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e6d9bf] text-[#9a97a6] transition hover:border-red-300 hover:text-red-500"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {visibleCommunes.length === 0 && (
              <p className="rounded-lg bg-[#fdfaf3] px-3 py-3 text-xs text-[#6b6878]">
                {communeWilayaFilter === "all"
                  ? "Aucune commune : les clients pourront quand mÃªme choisir une wilaya pour la livraison Ã  domicile."
                  : "Aucune commune pour cette wilaya."}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={cn(saveButton, "mt-6")}
        >
          {saving ? "Enregistrementâ€¦" : "Enregistrer"}
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          Impossible d&apos;enregistrer les paramÃ¨tres.
        </p>
      )}
      {saved && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          ParamÃ¨tres enregistrÃ©s.
        </p>
      )}
    </div>
  );
}