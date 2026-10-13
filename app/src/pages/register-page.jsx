import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth-store";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function RegisterPage() {
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("HEYA!");
  };

  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  });

  return (
    <div className="w-full max-w-[380px]">
      <div className="mb-9 flex items-center gap-2 text-[16px] font-extrabold text-foreground">
        FlowTech
      </div>

      <div>
        <div className="mb-6">
          <h2 className="mb-1.5 text-[23px] font-extrabold tracking-tight text-foreground">
            Crie sua conta
          </h2>

          <span className="block text-[13.5px] text-muted-foreground">
            Registre-se agora para poder acessar o Vision Center da sua Empresa.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Button
            type="submit"
            className="mt-1.5 w-full rounded-[9px] bg-primary py-3.5 text-[13px] font-bold text-primary-foreground transition hover:bg-primary-hover active:translate-y-px"
          >
            Registrar-se
          </Button>
        </form>
      </div>
    </div>
  );
}
