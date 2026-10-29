import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, ChevronRight, ClipboardCheck, FileText, FlaskConical, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardHome = () => {
  const today = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  const articles = [
    { title: 'Longitudinal outcomes in post-acute cardiac rehabilitation', meta: 'Cardiología · Equipo de investigación', status: 'En revisión', date: 'Actualizado hace 2 horas', tone: 'amber' },
    { title: 'A multicenter framework for equitable discharge planning', meta: 'Medicina interna · Equipo clínico', status: 'Borrador', date: 'Actualizado ayer', tone: 'slate' },
  ];

  return (
    <div className="space-y-9">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#52766d]">{today}</p>
          <h2 className="font-editorial mt-2 text-[40px] leading-tight tracking-[-.035em] text-[#173d3b] md:text-[48px]">Buen día.</h2>
          <p className="mt-2 text-[13px] text-[#526e68]">Resumen de tu actividad en el Chief Journal.</p>
        </div>
        <Link className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-[#9bcfbb] bg-[#e2f4ec] px-4 text-[12px] font-semibold text-[#07584f] transition hover:border-[#087d70] hover:bg-[#c8ecdc] md:self-auto" to="/biblioteca">
          Explorar biblioteca <ArrowRight size="{15}"/>
        </Link>
      </section>
      
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Mis artículos', value: '08', note: 'Publicados e inéditos', icon: FileText, tint: 'bg-[#d7f2e6] text-[#08745e]' },
          { label: 'En revisión', value: '03', note: 'Pendientes del Comité', icon: ClipboardCheck, tint: 'bg-[#fff0cf] text-[#985b08]' },
          { label: 'Colaboradores', value: '12', note: 'En 4 especialidades', icon: UsersRound, tint: 'bg-[#e6edc9] text-[#526d1c]' },
          { label: 'Recursos', value: '246', note: 'Biblioteca HIEF', icon: BookOpen, tint: 'bg-[#dcecf4] text-[#28677c]' },
        ].map(({ label, value, note, icon: Icon, tint }, i) => (
          <article key={label} className={`rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 ${i === 0 ? 'sm:col-span-2 xl:col-span-1' : ''}`}>
            <div className="flex items-center justify-between"><p className="text-[11px] font-medium text-[#42685e]">{label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}><Icon size="{16}" strokeWidth="{1.7}"/></span></div>
            <div className="mt-4 flex items-end justify-between"><p className="font-editorial text-[37px] leading-none text-[#173d3b]">{value}</p><p className="pb-1 text-[10px] text-[#58786f]">{note}</p></div>
          </article>
        ))}
      </section>
      
      <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
          <div className="flex items-center justify-between border-b border-[#dcebe5] px-5 py-5 md:px-6">
            <div><h3 className="text-[14px] font-semibold text-[#244f47]">Producción científica reciente</h3><p className="mt-1 text-[11px] text-[#58786f]">Vista general de tus manuscritos</p></div>
            <button className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#087366] hover:bg-[#e2f4ec]">Ver todos <ArrowUpRight className="ml-1 inline" size="{13}"/></button>
          </div>
          <div className="divide-y divide-[#e3eee9]">
            {articles.map((article, i) => (
              <article key={i} className="flex items-start justify-between gap-3 px-5 py-5 transition hover:bg-[#f1f9f5] md:px-6">
                <div className="min-w-0"><h4 className="max-w-[520px] text-[12px] font-semibold leading-5 text-[#244f47]">{article.title}</h4><p className="mt-1.5 text-[10px] text-[#52766d]">{article.meta}</p><p className="mt-3 text-[10px] text-[#58786f]">{article.date}</p></div>
                <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${article.tone === 'amber' ? 'bg-[#fff0cf] text-[#85500b]' : 'bg-[#e5edf0] text-[#415e68]'}`}>{article.status}</span>
              </article>
            ))}
          </div>
        </div>
        <aside className="space-y-5">
          <div className="overflow-hidden rounded-2xl bg-[#087366] p-6 text-[#f3fffa]">
            <div className="flex items-center justify-between"><span className="rounded-md border border-[#b3e8d3]/40 bg-[#e9fff5]/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.13em] text-[#d0f2e3]">Convocatoria</span><FlaskConical className="text-[#c0f2df]" size="{18}"/></div>
            <h3 className="font-editorial mt-6 text-[27px] leading-[1.05]">Convocatoria<br />Publicación</h3>
            <div className="mt-6 flex items-center justify-between border-t border-[#b3e8d3]/35 pt-4"><span className="flex items-center gap-2 text-[10px] text-[#e0f4eb]"><CalendarDays size="{13}"/>Próximamente</span><button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7f2e6] text-[#07584f] hover:bg-[#f3fffa]"><ChevronRight size="{16}"/></button></div>
          </div>
        </aside>
      </section>
    </div>
  );
};
export default DashboardHome;