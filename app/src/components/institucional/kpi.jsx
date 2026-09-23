export function Kpi ({titulo, porcentagem, status}) {
return(
      <div className="flex flex-col rounded-lg border border-gray-200 p-5 shadow-xl">
        <span>{titulo}</span>
        <p className="text-[0.75rem]">
          <span className="text-[2rem] font-bold">{porcentagem}</span> STATUS:{" "}
          <span>{status}</span>
        </p>
      </div>
)
}