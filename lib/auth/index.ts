export {
  criarSessaoEstudante,
  lerSessaoEstudante,
  encerrarSessaoEstudante,
} from "./session";

export {
  criarSessaoAdmin,
  lerSessaoAdmin,
  encerrarSessaoAdmin,
  type AdminSessaoInput,
} from "./admin-session";

export {
  ehAdminGlobal,
  lerEscopoAdmin,
  lerEscopoAdminGlobal,
} from "./admin-scope";

export type { SessionPayload } from "./edge";

export {
  adminSessionFromJwt,
  escopoDeQuery,
  escopoSolicitacoesSenha,
  podeGerenciarEscola,
  podeGerenciarEstudante,
  podeGerenciarOrganizacao,
  type AdminSessionScope,
} from "./rbac";
