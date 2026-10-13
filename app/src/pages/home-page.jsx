import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth-store";

export default function HomePage() {
  const logout = useAuth((state) => state.logout);
  const user = useAuth((state) => state.usuario);

  return (
    <div>
      <h1>HomePage</h1>
      <p>Usuário Logado: {JSON.stringify(user, null, 2)}</p>
      <Button onClick={logout}>Sair</Button>
    </div>
  );
}
