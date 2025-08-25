// prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.globalConfig.create({
    data: {
      minPixWithdrawal: 10.00,
      minCryptoWithdrawal: 50.00,
      pixFeePercent: 1.50,
      pixFeeFixed: 0.50,
      creditFeePercent: 3.00,
      creditFeeFixed: 1.00,
      reservePercent: 0.50,
      reserveFixed: 0.00,
      siteName: 'MydraPay',
      siteUrl: 'app.mydrapay.com',
      pixAcquirerId: null, // Pode ser configurado depois
      creditAcquirerId: null, // Pode ser configurado depois
      cryptoAcquirerId: null, // Pode ser configurado depois
      siteLogoUrl: '/logo-mydra.png',
      faviconUrl: '/favicon.ico', // Valor gerado; ajuste se necessário
      seoDefaultTitle: 'MydraPay - Gateway de Pagamentos Seguro e Eficiente',
      seoDefaultDescription: 'MydraPay é um gateway de pagamentos confiável que oferece soluções seguras para transações via PIX, cartão de crédito e criptomoedas. Integre facilmente ao seu negócio e processe pagamentos com rapidez e baixa taxa.',
      seoDefaultKeywords: 'gateway de pagamentos, PIX, cartão de crédito, pagamentos com cripto, transações seguras, processamento de pagamentos online',
      flags: {} // Pode adicionar flags personalizadas aqui se necessário
    },
  });
  console.log('Seed de GlobalConfig concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });