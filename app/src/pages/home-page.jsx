import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth-store";

export default function HomePage() {
  const logout = useAuth((state) => state.logout);

  return (
    <div>
      <h1>HomePage</h1>
      <Button onClick={logout}>Sair</Button>
    </div>
  );
}
