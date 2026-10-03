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

export function RevisaoField({ label, value, text }) {
    return (
        <div>
            <label
                className="block text-[12.5px] font-bold text-slate-900 mb-1.5"
                htmlFor={value}
            >
                {label}
            </label>
            <div className="relative w-full text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-[9px] pl-3 pr-3.5 py-3 outline-none">
                {text}
            </div>
        </div>
    )
}

export function ButtonCadastrar() {
    return (
        <div className="flex justify-end">
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

export function ButtonProx() {
    return (
        <div className="flex justify-end">
            <button
                type="submit"
                className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
                Continuar
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

export function ButtonVoltar() {
    return (
        <div className="flex justify-end">
            <button
                type="submit"
                className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
                <span
                    aria-hidden="true"
                    className="text-2xl transition-transform group-hover:-translate-x-1 mb-0.5"
                >
                    ‹
                </span>
                Voltar
            </button>
        </div>
    )
}