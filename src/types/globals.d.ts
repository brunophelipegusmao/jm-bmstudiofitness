// Declarações de tipos para arquivos CSS
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// Declarações para módulos CSS globais
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
