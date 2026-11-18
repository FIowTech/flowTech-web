import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HeatLayer } from "leaflet.heat";
import { pegarStatusServidor } from "@/utils/status-servidor";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

const cores = {
  verde: "#4fc58a",
  amarelo: "#f0c04d",
  vermelho: "#d2394e",
};

const centroInicial = [-23.5505, -46.6333]; // São Paulo

const pesoPorStatus = { critico: 1, alerta: 0.6, controlado: 0.3 };

const gradienteCalor = {
  0.3: cores.verde,
  0.6: cores.amarelo,
  1: cores.vermelho,
};

function pegarCor(status) {
  if (status === "critico") return cores["vermelho"];
  if (status === "alerta") return cores["amarelo"];

  return cores["verde"];
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

// Camada do mapa de calor. Também fica DENTRO do <MapContainer>, igual ao AjustarMapa.
function CamadaCalor({ servidores }) {
  const map = useMap();

  useEffect(() => {
    // Cada ponto é [latitude, longitude, intensidade]
    const pontos = [];

    for (const servidor of servidores) {
      const coordenada = pegarCoordenada(servidor);
      if (!coordenada) continue;

      const intensidade = pesoPorStatus[pegarStatusServidor(servidor)];
      pontos.push([coordenada[0], coordenada[1], intensidade]);
    }

    // maxZoom: abaixo desse zoom o calor vai enfraquecendo; deste zoom para cima fica com força total
    const camada = new HeatLayer(pontos, {
      radius: 45,
      blur: 30,
      max: 1,
      maxZoom: 8,
      gradient: gradienteCalor,
    }).addTo(map);

    // quando a lista muda (ou volta para o mapa normal), tira a camada antiga
    return () => {
      camada.remove();
    };
  }, [map, servidores]);

  return null;
}

function LegendaCalor() {
  return (
    <div className="absolute bottom-3 left-3 z-1000 rounded-lg bg-background/90 px-3 py-2 text-[10px] shadow-sm ring-1 ring-foreground/10">
      <p className="mb-1 font-medium">Concentração de criticidade</p>

      <div className="h-2 w-36 rounded-full bg-linear-to-r from-[#4fc58a] via-[#f0c04d] to-[#d2394e]" />

      <div className="mt-0.5 flex justify-between text-muted-foreground">
        <span>Baixa</span>
        <span>Alta</span>
      </div>
    </div>
  );
}

export function ServidorMapa({
  servidores,
  selecionadoId,
  onSelecionar,
  visao = "mapa",
}) {
  return (
    <div className="relative isolate h-105 overflow-hidden rounded-xl ring-1 ring-foreground/10 lg:h-full lg:min-h-105">
      <MapContainer center={centroInicial} zoom={10} className="size-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AjustarMapa servidores={servidores} />

        {visao === "calor" && <CamadaCalor servidores={servidores} />}

        {visao === "mapa" &&
          servidores.map((servidor) => {
            const posicao = pegarCoordenada(servidor);
            if (!posicao) return null;

            const selecionado = servidor.id_embarcado === selecionadoId;
  
            return (
              <Marker
                key={servidor.id_embarcado}
                position={posicao}
                icon={criarIcone(pegarStatusServidor(servidor), selecionado)}
                eventHandlers={{
                  click: () => onSelecionar(servidor.id_embarcado),
                }}
              />
            );
          })}
      </MapContainer>

      {visao === "calor" && <LegendaCalor />}
    </div>
  );
}
