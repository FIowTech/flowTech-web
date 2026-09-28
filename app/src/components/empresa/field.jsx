export function EmpresaField({ label, value, type, placeholder }) {
    return (
        <div>
            <label
                className="block text-[12.5px] font-bold text-slate-900 mb-1.5"
                htmlFor={value}
            >
                {label}
            </label>
            <div className="relative">
                <input
                    className="w-full text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-[9px] pl-3 pr-3.5 py-3 outline-none placeholder:text-slate-400"
                    id={value}
                    type={type}
                    placeholder={placeholder}
                />
            </div>
        </div>
    )
}

export function Button() {
    return (
        <button
            type="submit"
            className="mt-8 h-14 flex w-3/4 mx-auto items-center justify-center gap-2 rounded-[9px] bg-emerald-900 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition hover:bg-emerald-800 active:translate-y-px"
        >
            CADASTRAR EMPRESA
        </button>
    )
}

export function Button2() {
    return (
        <div className="flex mt-5 justify-end">
            <button
                type="submit"
                className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
                Cadastrar
                <span
                    aria-hidden="true"
                    className="text-2xl transition-transform group-hover:translate-x-1 mb-0.5"
                >
                    ›
                </span>
            </button>
        </div>
    )
}