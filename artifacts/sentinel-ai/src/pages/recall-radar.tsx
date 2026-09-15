import { ChevronLeft, ChevronRight, Clock3, Crosshair, Database, Eye, Filter, ShieldAlert, Users } from 'lucide-react';
import { Link } from 'wouter';
import { useGetRecallRadar, getGetRecallRadarQueryKey, getListRecallsQueryKey, useListRecalls } from '@workspace/api-client-react';
import type { ListRecallsParams, RecallDatasetPage, RecallRadar, RecallSignal } from '@workspace/api-client-react';
import { BarMeter, DataState, EvidenceTag, IntelCard, IntelFrame, Kpi, TrendLine } from './intelligence-shared';
import { useState } from 'react';

function SignalCard({ signal }: { signal: RecallSignal }) {
  const severityColor = signal.severity.toLowerCase().includes('critical') ? 'red' : signal.severity.toLowerCase().includes('high') ? 'amber' : 'teal';
  return <IntelCard testId={`card-recall-signal-${signal.id}`} className="group overflow-hidden transition-colors hover:border-[#4c9291]">
    <div className="border-b border-[#1c3a44] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`mt-1 grid h-8 w-8 shrink-0 place-items-center border ${severityColor === 'red' ? 'border-[#78433e] bg-[#2b1d21] text-[#f27d68]' : severityColor === 'amber' ? 'border-[#66532b] bg-[#211d12] text-[#e0b957]' : 'border-[#285b60] bg-[#112a30] text-[#64c5c0]'}`}><ShieldAlert size={16} /></div>
          <div className="min-w-0"><div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#668d92]">{signal.id} · {signal.component}</div><h3 data-testid={`text-recall-title-${signal.id}`} className="mt-1 font-display text-xl font-bold leading-tight text-[#edf2e8]">{signal.title}</h3><p className="mt-1 text-xs text-[#759398]">{signal.signal}</p></div>
        </div>
        <span data-testid={`status-recall-${signal.id}`} className={`shrink-0 border px-2 py-1 font-mono text-[9px] uppercase ${severityColor === 'red' ? 'border-[#78433e] text-[#f27d68]' : severityColor === 'amber' ? 'border-[#66532b] text-[#e0b957]' : 'border-[#285b60] text-[#64c5c0]'}`}>{signal.severity}</span>
      </div>
      <div className="mt-5 flex items-end justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[.15em] text-[#63858a]">Risk score</div><div data-testid={`value-recall-risk-${signal.id}`} className={`mt-1 font-display text-4xl font-bold ${severityColor === 'red' ? 'text-[#f27d68]' : severityColor === 'amber' ? 'text-[#e0b957]' : 'text-[#64c5c0]'}`}>{signal.riskScore}</div></div><div className="w-36"><BarMeter value={signal.riskScore} color={severityColor} testId={`meter-recall-risk-${signal.id}`} /><div className="mt-2 flex justify-between font-mono text-[9px] text-[#698a8e]"><span>LOW</span><span>THRESHOLD 70</span></div></div></div>
    </div>
    <div className="grid grid-cols-2 gap-px bg-[#1b3740]">
      <div className="bg-[#0b1d27] p-4"><div className="flex items-center gap-2 font-mono text-[9px] uppercase text-[#66878c]"><Users size={12} /> Affected population</div><div data-testid={`value-recall-population-${signal.id}`} className="mt-2 font-display text-xl font-bold text-[#e2eee7]">{signal.affectedVehicles.toLocaleString()}</div></div>
      <div className="bg-[#0b1d27] p-4"><div className="flex items-center gap-2 font-mono text-[9px] uppercase text-[#66878c]"><Clock3 size={12} /> Detection age</div><div data-testid={`value-recall-age-${signal.id}`} className="mt-2 font-display text-xl font-bold text-[#e2eee7]">{signal.detectedDaysAgo}d <span className="font-sans text-xs font-normal text-[#739196]">ago</span></div></div>
      <div className="bg-[#0b1d27] p-4"><div className="font-mono text-[9px] uppercase text-[#66878c]">Confidence</div><div data-testid={`value-recall-confidence-${signal.id}`} className="mt-2 font-display text-xl font-bold text-[#65c9c0]">{signal.confidence}%</div></div>
      <div className="bg-[#0b1d27] p-4"><div className="font-mono text-[9px] uppercase text-[#66878c]">Exposure</div><div data-testid={`value-recall-exposure-${signal.id}`} className="mt-2 font-display text-xl font-bold text-[#e2eee7]">${(signal.exposure / 1000).toFixed(0)}k</div></div>
    </div>
    <div className="p-5"><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.14em] text-[#77979b]"><Eye size={13} /> Why Sentinel flagged it</div><ul className="mt-3 space-y-2">{signal.whyFlagged.map((reason, index) => <li data-testid={`text-recall-reason-${signal.id}-${index}`} key={reason} className="flex gap-2 text-xs leading-5 text-[#a5bbba]"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#d8ae4b]" />{reason}</li>)}</ul><div className="mt-4 border-t border-[#1e3c47] pt-4"><div className="font-mono text-[9px] uppercase text-[#66878c]">Leading hypothesis</div><div data-testid={`text-recall-hypothesis-${signal.id}`} className="mt-1 text-sm font-semibold text-[#dfeae3]">{signal.leadingHypothesis}</div></div><Link href={`/issues/${signal.id}`} data-testid={`link-recall-investigate-${signal.id}`} className="mt-5 flex items-center justify-between border border-[#2d676a] bg-[#102e35] px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[#7bd1c8] transition-colors hover:bg-[#173e45]">Open issue investigation <ChevronRight size={14} /></Link></div>
  </IntelCard>;
}

export default function RecallRadarPage() {
  const q = useGetRecallRadar({ query: { queryKey: getGetRecallRadarQueryKey() } });
  const data = q.data as RecallRadar | undefined;
  const [draftFilters, setDraftFilters] = useState({ recall: '', vehicle: '', component: '', remedy: '' });
  const [filters, setFilters] = useState<ListRecallsParams>({ page: 1, pageSize: 5 });
  const recallQuery = useListRecalls(filters, { query: { queryKey: getListRecallsQueryKey(filters), placeholderData: (previous) => previous } });
  const dataset = recallQuery.data as RecallDatasetPage | undefined;
  const updateDraft = (key: keyof typeof draftFilters, value: string) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const applyFilters = () => {
    const next: ListRecallsParams = { page: 1, pageSize: 5 };
    for (const [key, value] of Object.entries(draftFilters)) {
      if (value.trim()) next[key as keyof typeof draftFilters] = value.trim();
    }
    setFilters(next);
  };
  const clearFilters = () => {
    setDraftFilters({ recall: '', vehicle: '', component: '', remedy: '' });
    setFilters({ page: 1, pageSize: 5 });
  };
  return <IntelFrame eyebrow="Flagship milestone · recall intelligence" title="Recall radar" detail="Ranked weak signals moving toward recall-level exposure, with the provided Ford recall sample available for transparent analyst review." action={<EvidenceTag>{data?.datasetCoverage.label ?? data?.syntheticLabel ?? 'Synthetic / model-estimated'}</EvidenceTag>}>
    {q.isLoading ? <DataState kind="loading" /> : q.isError ? <DataState kind="error" retry={() => q.refetch()} /> : !data || data.signals.length === 0 ? <DataState kind="empty" /> : <><div className="mb-7 grid gap-5 border-b border-[#1c3540] pb-7 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Vehicles at risk" value={data.totalAtRisk.toLocaleString()} detail="Across ranked signals" testId="kpi-recall-total-at-risk" tone="red" /><Kpi label="Critical signals" value={String(data.criticalSignals)} detail="Above intervention threshold" testId="kpi-recall-critical" tone="red" /><Kpi label="Average lead time" value={`${data.averageLeadTime} days`} detail="Before escalation window" testId="kpi-recall-lead-time" tone="amber" /><Kpi label="Signal confidence" value={`${Math.round(data.signals.reduce((sum, signal) => sum + signal.confidence, 0) / data.signals.length)}%`} detail="Cross-source agreement" testId="kpi-recall-confidence" /></div><div className="mb-7 grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><IntelCard className="p-5"><div className="mb-4 flex items-start justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#668a8f]">Detection velocity</div><h3 className="mt-1 font-display text-xl font-bold text-[#ebf0e7]">Risk signals are accelerating</h3></div><Crosshair className="text-[#65c9c0]" size={19} /></div><TrendLine points={data.detectionTrend} testId="chart-recall-detection-trend" /><div className="mt-3 flex items-center justify-between text-xs text-[#78979a]"><span>Indexed detection events</span><span className="font-mono text-[#d9b45b]">MODEL WINDOW · 30D</span></div></IntelCard><IntelCard className="relative overflow-hidden p-5"><div className="absolute right-5 top-5 h-20 w-20 rounded-full border border-[#25565c] opacity-70 [box-shadow:0_0_0_12px_rgba(68,165,162,.06),0_0_0_24px_rgba(68,165,162,.04)]" /><div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#668a8f]">Operating posture</div><h3 className="mt-1 max-w-xs font-display text-xl font-bold text-[#ebf0e7]">Investigate before the curve turns vertical.</h3><p className="mt-4 max-w-sm text-sm leading-6 text-[#8ba9aa]">Every card below is a model-ranked lead, not a recall determination. Use the linked issue workspace to validate source evidence and ownership.</p><div className="mt-5"><EvidenceTag>Human review required</EvidenceTag></div></IntelCard></div><div className="mb-7"><DatasetExplorer data={dataset} isLoading={recallQuery.isLoading} isError={recallQuery.isError} filters={draftFilters} updateDraft={updateDraft} applyFilters={applyFilters} clearFilters={clearFilters} page={filters.page ?? 1} setPage={(page) => setFilters((current) => ({ ...current, page }))} /></div><div className="grid gap-5 lg:grid-cols-2">{data.signals.map((signal) => <SignalCard key={signal.id} signal={signal} />)}</div></>}
  </IntelFrame>;
}

function DatasetExplorer({
  data,
  isLoading,
  isError,
  filters,
  updateDraft,
  applyFilters,
  clearFilters,
  page,
  setPage,
}: {
  data?: RecallDatasetPage;
  isLoading: boolean;
  isError: boolean;
  filters: { recall: string; vehicle: string; component: string; remedy: string };
  updateDraft: (key: 'recall' | 'vehicle' | 'component' | 'remedy', value: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  page: number;
  setPage: (page: number) => void;
}) {
  const coverage = data?.coverage;
  return <IntelCard className="overflow-hidden" testId="ford-recall-dataset-explorer">
    <div className="border-b border-[#1c3a44] p-5 md:p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-[#64c5c0]"><Database size={13} /> Dataset coverage</div><h3 className="mt-2 font-display text-2xl font-bold text-[#ebf0e7]">Ford vehicle error recalls</h3><p className="mt-1 max-w-2xl text-xs leading-5 text-[#8ba9aa]">{coverage?.sourceDescription ?? 'Provided Ford recall CSV loaded by the API.'}</p></div><EvidenceTag testId="tag-ford-dataset">{coverage?.label ?? 'Synthetic/demo dataset'}</EvidenceTag></div><div className="mt-5 grid gap-3 border-t border-[#1c3a44] pt-4 text-xs sm:grid-cols-3"><div><span className="font-mono text-[9px] uppercase text-[#66878c]">Coverage</span><div className="mt-1 font-semibold text-[#e2eee7]">{coverage?.recordCount ?? '—'} campaigns · {coverage?.coveragePeriod ?? '—'}</div></div><div><span className="font-mono text-[9px] uppercase text-[#66878c]">Estimated units</span><div className="mt-1 font-semibold text-[#e2eee7]">{coverage?.estimatedUnitsAffected.toLocaleString() ?? '—'}</div></div><div><span className="font-mono text-[9px] uppercase text-[#66878c]">Source file</span><div className="mt-1 break-all font-mono text-[10px] text-[#a5bbba]">{coverage?.sourceFile ?? '—'}</div></div></div></div>
    <div className="border-b border-[#1c3a44] bg-[#0a1b24] p-5"><div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.16em] text-[#d9b45b]"><Filter size={13} /> Server-side filters</div><div className="grid gap-3 md:grid-cols-4">{([['recall', 'Campaign or description'], ['vehicle', 'Vehicle model'], ['component', 'Component / system'], ['remedy', 'Remedy action']] as const).map(([key, placeholder]) => <label key={key} className="block"><span className="sr-only">{placeholder}</span><input value={filters[key]} onChange={(event) => updateDraft(key, event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyFilters(); }} placeholder={placeholder} data-testid={`input-filter-${key}`} className="w-full border border-[#2b4f59] bg-[#102a34] px-3 py-2.5 text-xs text-[#e2eee7] outline-none placeholder:text-[#66878c] focus:border-[#64c5c0]" /></label>)}</div><div className="mt-4 flex flex-wrap gap-3"><button onClick={applyFilters} data-testid="button-apply-recall-filters" className="bg-[#d9b45b] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#10212a]">Apply filters</button><button onClick={clearFilters} data-testid="button-clear-recall-filters" className="border border-[#355963] px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[#a5bbba] hover:border-[#64c5c0] hover:text-[#e2eee7]">Clear</button></div></div>
    {isLoading && !data ? <div className="p-8 text-center text-sm text-[#78979a]">Loading Ford recall records…</div> : isError ? <div className="p-8 text-center text-sm text-[#f27d68]">Recall dataset unavailable. Retry by refreshing the workspace.</div> : <><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-[#1c3a44] bg-[#0b202b] font-mono text-[9px] uppercase tracking-[.12em] text-[#66878c]"><tr><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Vehicle models</th><th className="px-5 py-3">Component</th><th className="px-5 py-3">Units</th><th className="px-5 py-3">Remedy</th></tr></thead><tbody>{data?.items.map((recall) => <tr key={recall.campaignId} data-testid={`row-recall-${recall.campaignId}`} className="border-b border-[#17343e] align-top hover:bg-[#102a34]"><td className="px-5 py-4 font-mono text-[#d9b45b]">{recall.campaignId}<div className="mt-1 max-w-xs font-sans leading-5 text-[#a5bbba]">{recall.errorDescription}</div></td><td className="px-5 py-4 text-[#dfeae3]">{recall.vehicleModels}</td><td className="px-5 py-4 text-[#dfeae3]">{recall.component}</td><td className="px-5 py-4 whitespace-nowrap font-semibold text-[#f27d68]">{recall.estimatedUnitsAffected.toLocaleString()}</td><td className="px-5 py-4 text-[#a5bbba]">{recall.remedyAction}</td></tr>)}</tbody></table>{data?.items.length === 0 && <div className="p-8 text-center text-sm text-[#78979a]">No Ford recall records match these filters.</div>}</div><div className="flex flex-col justify-between gap-3 border-t border-[#1c3a44] p-4 text-xs text-[#78979a] sm:flex-row sm:items-center"><span>Showing {data?.items.length ?? 0} of {data?.total ?? 0} matching campaigns · page {data?.page ?? page} of {data?.totalPages ?? 1}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))} aria-label="Previous recall page" className="border border-[#355963] p-2 disabled:opacity-30"><ChevronLeft size={14} /></button><button disabled={!data || page >= data.totalPages} onClick={() => setPage(page + 1)} aria-label="Next recall page" className="border border-[#355963] p-2 disabled:opacity-30"><ChevronRight size={14} /></button></div></div></>}
  </IntelCard>;
}