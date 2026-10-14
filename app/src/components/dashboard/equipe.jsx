


const membros = [
  {
    nome: "Kevin Augusto",
    iniciais: "KA",
    cargo: "Supervisor",
    email: "kevin.augusto595@gmail.com",
    
  },
  {
    nome: "Vitória Nogueira",
    iniciais: "VN",
    cargo: "Analista",
    email: "vivinogueira@gmail.com",
  },
  {
    nome: "Marcio Eduardo",
    iniciais: "ME",
    cargo: "Técnico",
    email: "marcio.eduardo@gmail.com",
  },
  {
    nome: "Jorge Paulo",
    iniciais: "JP",
    cargo: "Supervisor",
    email: "jppaulo@gmail.com",
  },
];

export default function DashboardMembros() {
  return (
    <main className="min-h-screen 
bg-slate-50 p-5 text-slate-800 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">

    
        <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm text-slate-500">
              Logado como:
            </p>

            <h1 className="text-xl font-semibold sm:text-2xl">
              Kevin Augusto
              <span className="text-emerald-600">
                {" "}• Supervisor
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              
              <p>09/10/2026 - 14:15</p>
            </div>

            <button
              type="button"
              aria-label="Sair"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 transition hover:bg-red-100"
            >
              
            </button>
          </div>
        </header>

        // Conteúdo principal 
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">

          // Membros 
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold leading-tight">
                Membros de{" "}
                <span className="text-emerald-600">
                  Vias do Brasil S.A.
                </span>
              </h2>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                Convidar Membro
               
              </button>
            </div>

            <div className="space-y-3">
              {membros.map((membro) => (
                <article
                  key={membro.email}
                  className={`flex items-center gap-3 rounded-lg border p-3 sm:p-4 ${
                    membro.atual
                      ? "border-dashed border-emerald-400 bg-emerald-50/70"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  } transition`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-700">
                    {membro.iniciais}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-slate-800">
                      {membro.nome}
                    </h3>

                    <p className="mt-1 wrap-break-words text-sm text-slate-500">
                      {membro.cargo} • {membro.email}
                    </p>
                  </div>

                  {!membro.atual && (
                    <button
                      type="button"
                      aria-label={`Editar ${membro.nome}`}
                      className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                    
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>

         
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-7 text-center text-2xl font-semibold">
              Convites Criados
            </h2>

            <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  cod: XPTO1234ABCD
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  usos: 2/5
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  criado em: 14/02/2026 12:45
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  expira em: 16/02/2026 12:45
                </span>
              </div>

              <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-500">
                  Criado por{" "}
                  <span className="font-medium text-slate-700">
                    Kevin Augusto
                  </span>
                  {" "}•{" "}
                  <span className="text-emerald-600">
                    Encontra-se Ativo
                  </span>
                </p>

                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 sm:self-auto"
                >
                  Revogar
                  
                </button>
              </div>
            </article>
          </section>

        </div>
      </div>
    </main>
  );
}
