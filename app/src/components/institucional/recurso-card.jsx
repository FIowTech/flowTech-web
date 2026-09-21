
export function RecursoCard({titulo, texto}) {
    return( 
      <div className="flex flex-col rounded-lg border border-gray-200 p-5 shadow-xl w-[23%]">
      <h3 className="font-bold text-[1.25rem] pl-0 p-4">{titulo}</h3>
      <p>{texto}</p>
      </div>
    )
}





