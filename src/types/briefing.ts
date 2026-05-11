export interface BriefingMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  uploaded_at: string;
}

export interface Scene {
  scene_number: number;
  scene_name: string;
  visual_sequence: string;
  copy_direction: string;
  example: string;
  lettering: string;
}

export interface Variation {
  variation_number: number;
  hypothesis: string;
  duration: '10-20' | '30-40' | '40-60';
  pontos_fortes: string[];
  scenes: Scene[];
}

export interface ABTest {
  test_number: number;
  variation_a: number;
  variation_b: number;
  hypothesis_a: string;
  hypothesis_b: string;
}

export interface CreativeStructure {
  name: string;
  pontos_fortes: string[];
  logic: string;
  focus_central?: string; // disruptivo only
  territory?: string[]; // disruptivo only
  variations: Variation[];
  ab_tests: ABTest[];
}

export interface CreativeType {
  structures: CreativeStructure[];
}

// =============================================================================
// Estático — estrutura própria (não tem cenas, tem "peças" com frase + textos fixos)
// =============================================================================
export interface StaticVariation {
  variation_number: number;
  hypothesis: string;         // "RE mensal", "RE anual", "Termo locação de temporada", etc.
  frase_destaque: string;     // "R$ 4.600+ líquidos por mês*"
  textos_fixos: string[];     // lista de bullets que sempre aparecem na peça
}

export interface StaticABTest {
  test_number: number;
  kind: 'AB' | 'ABC';
  hypotheses: string[];       // ["RE mensal", "RE anual"] ou ["Termo locação", "Termo short stay", "Termo airbnb"]
  variations: number[];       // [1, 2] ou [3, 4, 5]
}

export interface StaticStructure {
  name: string;
  base_image: string;         // "Fachada", "Localização", "Rooftop" etc.
  base_image_description: string; // "As 5 variações devem apresentar imagens variadas da fachada..."
  variations: StaticVariation[];
  ab_tests: StaticABTest[];
}

export interface EstaticoContent {
  label?: string;              // "ESTÁTICO — SUL DA ILHA SPOT"
  subtitle?: string;           // "Peças estáticas para feed e stories"
  global_guidelines: string[]; // "Diretrizes obrigatórias para todas as peças"
  structures: StaticStructure[];
  cross_test?: {               // "Teste Extra — Impacto da Imagem"
    hypothesis: string;        // "RE mensal"
    variation_number: number;  // 1
    objective: string;
  };
}

export interface Legend {
  creative_type: string;
  full_headline: string;
  full_body: string;
  full_financial: string;
  full_institutional: string;
  full_cta: string;
  short_headline: string;
  short_body: string;
  short_location: string;
  short_cta: string;
}

export interface Dont {
  titulo: string;
  tag: string;        // "Não mencionar", "Evitar comunicar como absoluto", etc.
  descricao?: string;
  itens?: string[];
  nota?: string;
}

export interface Do {
  titulo: string;
  tag: string;        // "Reforçar"
  descricao: string;
  sub_itens?: string[];
}

export interface HospedeProfile {
  nome: string;
  tag: string;        // "Perfil Principal", "Alta Recorrência", "Experiência", "Fluxo Constante", "Família"
  descricao: string;
}

export interface PontoForteDetalhado {
  sigla: string;
  nome: string;
  descricao: string;
  numeros?: string[];
}

export interface BriefingContent {
  abas: {
    contexto: {
      spot_name: string;
      city: string;
      neighborhood: string;
      region: string;
      product_type: string;
      stage: string;
      presenter: string;
      alvara_status: string;
      positioning: string;
      welcome_p1?: string;
      welcome_p2?: string;
      welcome_p3?: string;
      informacoes_importantes?: string;
      notes: string;
    };
    dados_empreendimento?: {
      quantidade_opcoes: number;
      pavimentos: string;
      tipologias_count: number;
      metragem_min: number;
      metragem_max: number;
      vagas_garagem: string;
      modalidade_aprovacao: string;
      administrador_obras: string;
      arquiteto: string;
      cotas_marketplace: number;
    };
    cronograma?: {
      inicio_vendas: string;
      fechamento_grupo: string;
      inicio_obra: string;
      entrega_obra: string;
      fase_projeto: string;
    };
    informacoes_tecnicas: {
      typologies: string[];
      areas: string[];
      total_units: number;
      amenities: string[];
      construction_details: string;
      notes: string;
    };
    pontos_fortes: {
      selected: string[];
      detalhados?: PontoForteDetalhado[];
      notes: string;
    };
    dados_financeiros: {
      investment_from: number;
      monthly_income: number;
      annual_income: number;
      valorizacao_percentual?: number;
      valorizacao_breakdown?: string;
      entrega_prevista?: string;
      payment_conditions: string;
      financing: string;
      notes: string;
    };
    localizacao: {
      main_attraction: string;
      distance_to_attraction: string;
      distances: { place: string; distance: string }[];
      region_characteristics: string;
      tourist_flow: string;
      seasonality: string;
      guest_profile: string;
      notes: string;
    };
    donts?: Dont[];
    dos?: Do[];
    perfil_hospede?: {
      intro: string;
      descricao: string;
      perfis: HospedeProfile[];
      destino: {
        regiao: string;
        perfil: string;
        praia: string;
        infraestrutura: string;
      };
    };
  };
  criativos: {
    estatico?: CreativeType;           // legacy (com cenas) — manter para briefings antigos
    estatico_v2?: EstaticoContent;     // NOVO formato: peças com frase + textos fixos
    video_apresentadora?: CreativeType;
    video_narrado?: CreativeType;
    disruptivo_apresentadora?: CreativeType;
    disruptivo_narrado?: CreativeType;
  };
  legendas: Legend[];
}

export interface OutroBriefing {
  id: string;
  share_id: string;
  created_by: string | null;
  status: 'em_revisao' | 'publicado';
  vertical: 'szi' | 'marketplace';
  titulo: string;
  spot_name: string | null;
  contexto: string | null;
  o_que_precisamos: string | null;
  link_referencia: string | null;
  data_entrega: string | null;
  referencia_media: BriefingMedia[];
  is_legacy?: boolean;
  legacy_content?: Record<string, any> | null;
  legacy_source_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BriefingComment {
  id: string;
  briefing_id: string;
  location_key: string;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  is_admin: boolean;
  body: string;
  resolved: boolean;
  created_at: string;
}

export interface Briefing {
  id: string;
  share_id: string;
  created_by: string | null;
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'publicado';
  spot_name: string;
  city: string | null;
  neighborhood: string | null;
  category: string | null;
  investment_from: number | null;
  monthly_income: number | null;
  annual_income: number | null;
  content: BriefingContent;
  media_estatico: BriefingMedia[];
  media_video_apresentadora: BriefingMedia[];
  media_video_narrado: BriefingMedia[];
  media_disruptivo_apresentadora: BriefingMedia[];
  media_disruptivo_narrado: BriefingMedia[];
  original_docx_url: string | null;
  is_legacy?: boolean;
  legacy_content?: Record<string, any> | null;
  legacy_source_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Pontos Fortes official matrix
export const PONTOS_FORTES = {
  C:  { name: 'Credibilidade', color: '#2E75B6', description: 'Seazone como gestora, track record' },
  L:  { name: 'Localização', color: '#548235', description: 'Região, bairro, cidade turística' },
  D:  { name: 'Distância', color: '#0048D7', description: 'Proximidade funcional de atrativos' },
  Re: { name: 'Rendimento', color: '#BF8F00', description: 'Rendimento líquido estimado' },
  T:  { name: 'Ticket', color: '#C00000', description: 'Valor de entrada / investimento' },
  Pa: { name: 'Produto/Amenidades', color: '#8B5CF6', description: 'Infraestrutura do prédio' },
  F:  { name: 'Facilidade', color: '#8B5CF6', description: 'Condições de pagamento' },
  M:  { name: 'Mercado', color: '#555555', description: 'Dados de mercado' },
  E:  { name: 'Exclusividade', color: '#555555', description: 'Estoque limitado' },
  Va: { name: 'Valorização', color: '#555555', description: 'Potencial de valorização' },
  Pe: { name: 'Personalização', color: '#555555', description: 'Possibilidade de personalizar' },
  Em: { name: 'Emoção', color: '#7B5CE0', description: 'Conexão emocional com destino' },
  Ro: { name: 'ROI', color: '#555555', description: 'Retorno sobre investimento' },
  V:  { name: 'Vista', color: '#8B5CF6', description: 'Vista mar, natureza' },
} as const;

export type PontoForteKey = keyof typeof PONTOS_FORTES;

export const CREATIVE_TYPE_LABELS: Record<string, string> = {
  estatico: 'Estático',
  video_apresentadora: 'Vídeo Apresentadora',
  video_narrado: 'Vídeo Narrado',
  disruptivo_apresentadora: 'Disruptivo — Apresentadora',
  disruptivo_narrado: 'Disruptivo — Narrado',
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: '#94A3B8' },
  em_revisao: { label: 'Em revisão', color: '#F59E0B' },
  aprovado: { label: 'Aprovado', color: '#10B981' },
  publicado: { label: 'Publicado', color: '#3B82F6' },
};
