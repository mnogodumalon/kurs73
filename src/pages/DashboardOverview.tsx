import { useEffect, useState } from 'react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Kurse, Anmeldungen } from '@/types/app';
import { GraduationCap, Users, DoorOpen, BookOpen, ClipboardList, TrendingUp, CheckCircle2, Euro, CalendarDays } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
  bgColor: string;
}

function KpiCard({ icon, label, value, sub, accentColor, bgColor }: KpiCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border flex flex-col gap-3 hover:shadow-elevated transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bgColor, color: accentColor }}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const [counts, setCounts] = useState({ dozenten: 0, teilnehmer: 0, raeume: 0, kurse: 0, anmeldungen: 0 });
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, t, r, k, a] = await Promise.all([
          LivingAppsService.getDozenten(),
          LivingAppsService.getTeilnehmer(),
          LivingAppsService.getRaeume(),
          LivingAppsService.getKurse(),
          LivingAppsService.getAnmeldungen(),
        ]);
        setCounts({ dozenten: d.length, teilnehmer: t.length, raeume: r.length, kurse: k.length, anmeldungen: a.length });
        setKurse(k);
        setAnmeldungen(a);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = startOfDay(new Date());

  const activeKurse = kurse.filter(k => {
    const start = k.fields.startdatum ? parseISO(k.fields.startdatum) : null;
    const end = k.fields.enddatum ? parseISO(k.fields.enddatum) : null;
    if (!start) return false;
    return !isBefore(end ?? start, today) && !isAfter(start, today);
  });

  const upcomingKurse = kurse
    .filter(k => k.fields.startdatum && isAfter(parseISO(k.fields.startdatum), today))
    .sort((a, b) => (a.fields.startdatum ?? '').localeCompare(b.fields.startdatum ?? ''))
    .slice(0, 5);

  const bezahltCount = anmeldungen.filter(a => a.fields.bezahlt).length;
  const paymentRate = anmeldungen.length > 0 ? Math.round((bezahltCount / anmeldungen.length) * 100) : 0;

  const totalRevenue = kurse.reduce((sum, k) => {
    if (!k.fields.preis) return sum;
    const paid = anmeldungen.filter(a => a.fields.bezahlt && a.fields.kurs?.includes(k.record_id)).length;
    return sum + paid * (k.fields.preis ?? 0);
  }, 0);

  const monthlyData: { month: string; anmeldungen: number; bezahlt: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = format(d, 'yyyy-MM');
    const monthAnm = anmeldungen.filter(a => a.createdat?.startsWith(monthKey));
    monthlyData.push({
      month: format(d, 'MMM', { locale: de }),
      anmeldungen: monthAnm.length,
      bezahlt: monthAnm.filter(a => a.fields.bezahlt).length,
    });
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8" style={{ color: 'oklch(0.99 0 0)' }}>
        <div className="relative z-10">
          <p className="text-sm font-medium mb-1 tracking-wide uppercase" style={{ opacity: 0.7 }}>Kursverwaltung</p>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Guten Tag!</h1>
          <p className="text-base max-w-md" style={{ opacity: 0.8 }}>
            Hier sehen Sie eine vollständige Übersicht Ihres Kursbetriebs — aktive Kurse, Anmeldungen und Umsätze auf einen Blick.
          </p>
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full" style={{ background: 'oklch(0.99 0 0 / 0.05)' }} />
        <div className="absolute -right-4 top-8 w-32 h-32 rounded-full" style={{ background: 'oklch(0.99 0 0 / 0.07)' }} />
        <div className="absolute right-24 -bottom-8 w-24 h-24 rounded-full" style={{ background: 'oklch(0.99 0 0 / 0.04)' }} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard icon={<GraduationCap size={16} />} label="Dozenten" value={loading ? '—' : counts.dozenten} sub="registriert" accentColor="oklch(0.42 0.11 198)" bgColor="oklch(0.42 0.11 198 / 0.1)" />
        <KpiCard icon={<Users size={16} />} label="Teilnehmer" value={loading ? '—' : counts.teilnehmer} sub="registriert" accentColor="oklch(0.45 0.15 148)" bgColor="oklch(0.45 0.15 148 / 0.1)" />
        <KpiCard icon={<DoorOpen size={16} />} label="Räume" value={loading ? '—' : counts.raeume} sub="verfügbar" accentColor="oklch(0.55 0.14 65)" bgColor="oklch(0.55 0.14 65 / 0.1)" />
        <KpiCard icon={<BookOpen size={16} />} label="Kurse" value={loading ? '—' : counts.kurse} sub={`${activeKurse.length} aktiv`} accentColor="oklch(0.48 0.18 285)" bgColor="oklch(0.48 0.18 285 / 0.1)" />
        <KpiCard icon={<ClipboardList size={16} />} label="Anmeldungen" value={loading ? '—' : counts.anmeldungen} sub={`${paymentRate}% bezahlt`} accentColor="oklch(0.55 0.2 25)" bgColor="oklch(0.55 0.2 25 / 0.1)" />
      </div>

      {/* Row: Chart + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Anmeldungen — letzte 6 Monate</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Gesamt vs. bezahlt</p>
            </div>
            <TrendingUp size={18} className="text-primary opacity-60" />
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Lädt…</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barGap={4} barSize={20}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'oklch(0.52 0.01 250)' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.52 0.01 250)' }} width={24} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid oklch(0.9 0.008 198)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="anmeldungen" name="Anmeldungen" fill="oklch(0.42 0.11 198)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bezahlt" name="Bezahlt" fill="oklch(0.52 0.13 148)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-card rounded-xl shadow-card border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-primary" />
              <h2 className="text-sm font-semibold">Zahlungsstatus</h2>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold">{paymentRate}%</span>
              <span className="text-sm text-muted-foreground pb-1">der Anmeldungen</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${paymentRate}%`, background: 'linear-gradient(90deg, oklch(0.42 0.11 198), oklch(0.52 0.13 148))' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{bezahltCount} bezahlt</span>
              <span>{anmeldungen.length - bezahltCount} ausstehend</span>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Euro size={16} className="text-primary" />
              <h2 className="text-sm font-semibold">Umsatz (bezahlt)</h2>
            </div>
            <div className="text-3xl font-bold">
              {loading ? '—' : `${totalRevenue.toLocaleString('de-DE')} €`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">aus bezahlten Anmeldungen</p>
          </div>
        </div>
      </div>

      {/* Upcoming Courses */}
      {upcomingKurse.length > 0 && (
        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays size={18} className="text-primary" />
            <h2 className="text-base font-semibold tracking-tight">Nächste Kurse</h2>
          </div>
          <div className="space-y-0">
            {upcomingKurse.map((k) => (
              <div key={k.record_id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <div className="font-medium text-sm">{k.fields.titel ?? 'Unbenannter Kurs'}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {k.fields.startdatum
                      ? format(parseISO(k.fields.startdatum), 'EEEE, d. MMMM yyyy', { locale: de })
                      : '—'}
                    {k.fields.enddatum && k.fields.enddatum !== k.fields.startdatum
                      ? ` – ${format(parseISO(k.fields.enddatum), 'd. MMMM', { locale: de })}`
                      : ''}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  {k.fields.preis != null && (
                    <div className="text-sm font-semibold" style={{ color: 'oklch(0.42 0.11 198)' }}>{k.fields.preis.toLocaleString('de-DE')} €</div>
                  )}
                  {k.fields.max_teilnehmer != null && (
                    <div className="text-xs text-muted-foreground">{k.fields.max_teilnehmer} Plätze</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && counts.kurse === 0 && counts.teilnehmer === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Noch keine Daten vorhanden</p>
          <p className="text-sm mt-1">Starten Sie mit Dozenten und Kursen über die Seitenleiste.</p>
        </div>
      )}
    </div>
  );
}
