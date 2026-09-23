
export function MissaoCard({titulo, texto, icone}) {
    return(
      <div className="flex flex-col gap-5 rounded-lg border border-gray-200 bg-white p-5 shadow-xl w-full">
      <div className="flex m-6 items-center justify-start text-6xl">
        {icone}
      </div>
      <div className="flex flex-col w-full">
      <h3 className="font-bold text-[1.25rem] py-5">{titulo}</h3>
      <p>{texto}</p>
      </div>
      </div>
    )
}