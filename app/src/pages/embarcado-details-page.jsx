import { useParams } from "react-router";

export default function EmbarcadosDetailsPage() {
  const { id } = useParams();

  return <div>DetailsPage | id: {id}!</div>;
}
