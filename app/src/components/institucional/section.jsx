export function Section({id, className="", title, description, subtitle, children}) {

  return (
    <section id={id}
      className={`flex flex-col items-center gap-8 px-6 py-10 sm:px-10 lg:gap-10 lg:px-16 lg:py-16 ${className}`}>
      <div className="flex w-full max-w-4xl flex-col gap-5 text-center">
        <h2 className="font-bold text-gray-700">{title}</h2>
        <p className="text-3xl font-bold leading-tight sm:text-4xl">
            {subtitle}
        </p>
        <p>
          {description}
        </p>
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}
