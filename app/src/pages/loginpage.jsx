export default function LoginPage(){
    const loginitems = [
        {title: "Pórticos monitorados", number:"70",description: "distribuídos em 12 rodovias"},
        {title: "Falhas evitadas", number:"18",description: "neste mês, via alertas antecipados"},
        {title: "Disponibilidade", number:"99,8%",description: "uptime garantido da rede"},
        {title: "Tempo de respostas", number:"4 min",description: "tempo médio ate o alerta"},  
    ];

    const caditems = [
      {info:"Nome completo", place:"Insira seu nome"},
      {info:"E-mail", place:"seuemail@email.com"},
      {info:"Senha", place:"Mínimo 8 caracteres"},
      {info:"Codigo", place:"Mínimo 8 caracteres"},
    ]
    return(

       <div className="min-h-screen bg-green-950"> 

  <div className="flex flex-col lg:flex-row min-h-screen">
    <div id="botao-voltar" className="panel-bg relative flex-1 lg:flex-56 px-6 sm:px-10 lg:px-14 py-10 lg:py-12 flex flex-col overflow-hidden">
      <a href="index.html" className="back-btn relative z-10">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar
      </a>
      </div>

      <div className="mt-10 lg:mt-14 max-w-md relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white mb-4">O monitoramento dos
          seus pórticos, sob controle total.</h1>
        <span className="block text-[15px] leading-relaxed text-[#a9c2bc]">Acesse a central do mantenedor e acompanhe a
          saúde de cada pórtico Free Flow em tempo real, com alertas antes que a operação seja afetada.</span>
           <div className="flex-1 min-h-16 text-white mb-4" ></div>
        </div>



<div id="Cards" className=" relative z-10 grid grid-cols-2 gap-3 ">
    {loginitems.map((item) => (
        <LoginItem key={item.title} title={item.title} number={item.number} description={item.description}/>
    ))}
</div>      
    
    <div className="flex-1 lg:flex-44 bg-white flex items-center justify-center px-6 sm:px-8 py-12 lg:py-10">
      <div className="w-full max-w-392px">
        <div className="flex items-center gap-2 font-extrabold text-[16px] text-slate-900 mb-9">FlowTech</div>

        <div id="div_acao">

          <div className="mb-6">
          <h2 className="text-[23px] font-extrabold tracking-tight mb-1.5">Crie sua conta</h2>
          <span className="block text-[13.5px] text-slate-500">Cadastre-se para acompanhar a saúde dos seus pórticos Free
            Flow.</span>
        </div>


        <form onSubmit="return false" className="flex flex-col gap-4">
          
            {caditems.map((item) => (
              <CadastroItem key={item.info} info={item.info} place={item.place}/>
            ))}

          <button type="submit"
                    className="mt-1.5 w-full bg-green700 hover:bg-green600 text-black rounded-[9px] py-3.5 text-[13px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition active:translate-y-px" onClick='cadastro()'>
            Criar conta
           <svg
            className="w-15px h-15px"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M22 11h-6" />
        </svg>
          </button>

          <div className="text-center text-[13px] text-slate-500 mt-2">Já tem conta? <a href="login.html" class="font-bold text-green700 hover:underline">Entrar</a>
          </div>
        </form>
        </div>
      </div>
    </div>
    </div>
</div>


    )
    
    
}
  function LoginItem({title,number,description}){
      return(
        <div className="bg-green700 border border-[#3a8f86] rounded-xl px-4 py-3.5">
          <div className="text-[10.5px] uppercase tracking-wide text-[#8fada6] font-semibold mb-1.5" >{title}
          </div>
          <div className="text-xl text-white leading-none" >{number}</div>
          <div className="text-[11px] text-[#a9c2bc] mt-1.5">{description}</div>
        </div>
);
  }


  function CadastroItem({info, place}){
    return(
      <div>
            <span className="block text-[12.5px] font-bold text-slate-900 mb-1.5">{info}</span>
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
              </svg>
              <input  type="text" placeholder={place}
                className="field-input w-full text-sm text-slate-900 bg-mist border border-lineGray rounded-[9px] pl-10 pr-3.5 py-3 outline-none transition placeholder:text-slate-400"></input>
            </div>
          </div>
    )
  }


  
  
  

