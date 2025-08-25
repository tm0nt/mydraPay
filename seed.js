const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes (opcional, para reset)
  await prisma.transaction.deleteMany();
  await prisma.statement.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.kyc.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.user.deleteMany();

  // Criar User de teste (todos os campos necessários)
  const testUser = await prisma.user.create({
    data: {
      id: 'user-test-uuid-123', // Ou use uuid() se preferir automático
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      version: 1,
      name: 'Test User',
      email: 'test@example.com',
      phone: '(11) 99999-9999',
      passwordHash: 'hashedpassword123', // Use hash real em prod
      type: 'INDIVIDUAL', // Enum UserType
      taxId: '123.456.789-00',
      avatarUrl: 'https://example.com/avatar.png',
      isActive: true,
      canGeneratePix: true,
      canWithdraw: true,
      kycApproved: true,
    },
  });

  // Criar Credential associada (todos os campos)
  await prisma.credential.create({
    data: {
      id: 'cred-test-uuid-123',
      userId: testUser.id,
      publicKey: 'public-key-test',
      secretKey: 'secret-key-test',
      rotatedAt: null,
      rotationBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    },
  });

  // Criar Kyc associado (exemplo para compliance)
  await prisma.kyc.create({
    data: {
      id: 'kyc-test-uuid-123',
      userId: testUser.id,
      type: 'NATIONAL_ID', // Enum KycType
      fileFront: 'https://example.com/front.png',
      fileBack: 'https://example.com/back.png',
      selfieUrl: 'https://example.com/selfie.png',
      createdAt: new Date(),
      verifiedAt: new Date(),
      verifiedBy: 'admin',
      notes: 'Approved for testing',
    },
  });

  // Criar Customer de teste (para simular comprador)
  const testCustomer = await prisma.customer.create({
    data: {
      id: 'cust-test-uuid-123',
      userId: testUser.id,
      name: 'Test Customer',
      taxId: '987.654.321-00',
      email: 'customer@example.com',
      phone: '(11) 88888-8888',
      product: 'Test Product',
      amount: 100.00, // Decimal
      payment: 'PIX', // Enum PaymentMethod
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      version: 1,
      address: { street: 'Test Street', number: '123' }, // JSON
      metadata: { extra: 'test' }, // JSON
    },
  });

  // Criar Transaction de teste (simulando PIX gerado)
  await prisma.transaction.create({
    data: {
      id: 'tx-test-uuid-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      userId: testUser.id,
      amount: 100.00,
      currency: 'BRL',
      type: 'INCOMING',
      method: 'PIX',
      status: 'PENDING',
      feeAmount: 1.00,
      description: 'Test PIX',
      externalRef: 'ext-ref-123',
      payload: { qrcode: 'test-qrcode' },
      metadata: { details: 'test' },
      customerId: testCustomer.id,
      acquirerId: null, // Opcional
      checkoutId: null,
      checkoutVariantId: null,
      funnelStage: null,
    },
  });

  // Criar Statement de teste
  await prisma.statement.create({
    data: {
      id: 'stmt-test-uuid-123',
      createdAt: new Date(),
      userId: testUser.id,
      currentBalance: 0.00,
      pendingBalance: 100.00,
      blockedBalance: 0.00,
      reserveBalance: 0.00,
      initialBalance: 0.00,
      variation: 100.00,
      finalBalance: 100.00,
      asOf: new Date(),
      source: 'PIX_GENERATED',
    },
  });

  // Outros dados opcionais (ex.: Analytic, DomainEvent) para completude
  await prisma.analytic.create({
    data: {
      id: 'analytic-test-uuid-123',
      createdAt: new Date(),
      sessions: 1,
      users: 1,
      pixGenerated: 1,
      pixPaid: 0,
      creditPaid: 0,
      creditError: 0,
      rejections: 0,
      avgPixTimeSec: null,
      trafficSources: null,
      technology: null,
    },
  });

  await prisma.domainEvent.create({
    data: {
      id: 'event-test-uuid-123',
      createdAt: new Date(),
      processedAt: null,
      status: 'PENDING',
      eventName: 'PIX_CREATED',
      payload: { transactionId: 'tx-test-uuid-123', userId: testUser.id },
      attempts: 0,
      actorUserId: testUser.id,
      correlationId: null,
      idempotencyKey: null,
    },
  });

  console.log('Seed concluído! User de teste criado com ID:', testUser.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
