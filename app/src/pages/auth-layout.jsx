import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import { Link, Outlet } from "react-router";

const benefitCardContents = [
  {
    id: 1,
    title: "Observabilidade",
    number: "+12 Métricas",
    description: "distribuidas em gráficos diferentes",
  },
  {
    id: 2,
    title: "Gestão de Equipe",
    number: "até 50",
    description: "funcionários sob um mesmo projeto",
  },
  {
    id: 3,
    title: "Disponibilidade",
    number: "99.9%",
    description: "de uptime garantido pela integração dos serviços com a Nuvem",
  },
  {
    id: 4,
    title: "Tempo de respostas",
    number: "~3 min",
    description: "tempo médio até o alerta chegar",
  },
];

export default function AuthLayout() {
  return (
    <div className="w-full min-h-dvh flex flex-col lg:flex-row">
      <div className="relative max-w-xl flex flex-col space-y-8 py-4 px-8 bg-background">
        <Link to="/">
          <Badge
            variant="outline"
            className="flex items-center space-x-1 p-4 bg-background-light"
          >
            <ArrowLeftIcon size={18} />
            <span>Voltar</span>
          </Badge>
        </Link>

        <div className="flex flex-col space-y-12">
          <h1 className="text-4xl font-heading font-bold mb-6 tracking-wide leading-relaxed">
            Observabilidade total acessando o
            <span className="font-bold italic text-primary bg-primary-foreground">
              Vision Center
            </span>
          </h1>
          <span className="text-justify text-text-secondary">
            Acessando o Vision Center da FlowTech você terá acesso a uma
            Dashboard integrada com as principais métricas e KPIs capazes de
            fazer a diferença para a operação da sua Empresa.
          </span>

          <div className="relative z-10 mt-10 grid grid-cols-2 gap-3 lg:mt-auto">
            {benefitCardContents.map((item) => (
              <Card
                key={item.id}
                className="hover:-translate-y-0.5 transition-all"
              >
                <CardHeader>
                  <CardTitle className="font-sans text-md">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold font-heading">
                  {item.number}
                </CardContent>
                <CardFooter className="text-xs text-text-secondary">
                  {item.description}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
