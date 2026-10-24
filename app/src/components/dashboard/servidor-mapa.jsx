import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

const cores = {
  verde: "#4fc58a",
  amarelo: "#f0c04d",
  vermelho: "#d2394e",
};

const centroInicial = [-23.5505, -46.6333]; // São Paulo

function pegarCor(status) {
  return status === 1 ? cores.verde : cores.vermelho;
}

// o mysql devolve lat/lon como texto, ex.: "-23.5505".
// aqui convertemos para número e devolvemos null se o servidor não tiver coordenada.
function pegarCoordenada(servidor) {
  const { lat, lon } = servidor.endereco ?? {};

  if (lat == null || lon == null) return null;

  return [Number(lat), Number(lon)];
}

// O Leaflet usa imagens como marcador. Aqui a gente troca por uma bolinha colorida em HTML.
// O servidor selecionado fica maior que os outros.
function criarIcone(status, selecionado) {
  const tamanho = selecionado ? 24 : 16;

  return L.divIcon({
    className: "",
    iconSize: [tamanho, tamanho],
    html: `<span style="display:block;width:${tamanho}px;height:${tamanho}px;border-radius:9999px;background:${pegarCor(status)};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
  });
}

// Componente "invisível": não desenha nada, só mexe no mapa.
// Ele precisa ficar DENTRO do <MapContainer>, senão o useMap() não funciona.
function AjustarMapa({ servidores }) {
  const map = useMap();

  // Roda quando a lista de servidores muda (ex.: o usuário digitou na busca)
  useEffect(() => {
    // Só servidores que têm coordenada
    const pontos = servidores
      .map(pegarCoordenada)
      .filter((coordenada) => coordenada !== null);

    if (pontos.length === 0) return;

    // Com um servidor só, não existe "área": só centraliza nele
    if (pontos.length === 1) {
      map.setView(pontos[0], 13);
      return;
    }

    // Com vários, ajusta o zoom para todos caberem na tela (padding = margem)
    map.fitBounds(pontos, { padding: [40, 40] });
  }, [map, servidores]);

  return null;
}

export function ServidorMapa({ servidores, selecionadoId, onSelecionar }) {
  return (
    <div className="isolate h-105 overflow-hidden rounded-xl ring-1 ring-foreground/10 lg:h-full lg:min-h-105">
      <MapContainer center={centroInicial} zoom={10} className="size-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AjustarMapa servidores={servidores} />

        {servidores.map((servidor) => {
          const posicao = pegarCoordenada(servidor);
          if (!posicao) return null;

          const selecionado = servidor.id_embarcado === selecionadoId;

          return (
            <Marker
              key={servidor.id_embarcado}
              position={posicao}
              icon={criarIcone(servidor.status, selecionado)}
              eventHandlers={{ click: () => onSelecionar(servidor.id_embarcado) }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
