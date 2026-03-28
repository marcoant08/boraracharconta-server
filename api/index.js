// Este arquivo é o entrypoint da Vercel.
// O build:vercel compila src/ para dist/, resolvendo todos os path aliases.
// Em runtime, importamos diretamente do dist já compilado.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const handler = require('../dist/serverless').default;
module.exports = handler;
