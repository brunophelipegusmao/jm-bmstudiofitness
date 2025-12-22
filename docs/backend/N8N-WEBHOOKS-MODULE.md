# N8nWebhooksModule - Documentação Completa

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Endpoints](#endpoints)
- [Eventos Disponíveis](#eventos-disponíveis)
- [Uso nos Módulos](#uso-nos-módulos)
- [Exemplos](#exemplos)

---

## 🎯 Visão Geral

O **N8nWebhooksModule** permite integração com [n8n](https://n8n.io/) (plataforma de automação de workflows) para disparar eventos automáticos quando ações ocorrem no sistema.

### Funcionalidades

- ✅ Disparo automático de webhooks para eventos do sistema
- ✅ Configuração via variáveis de ambiente
- ✅ Suporte a múltiplos tipos de eventos
- ✅ Retry automático em caso de falha
- ✅ Logs estruturados
- ✅ Modo de teste/debug

### Casos de Uso

- Enviar e-mails de boas-vindas quando usuário é criado
- Notificar equipe quando pagamento é recebido
- Alertar sobre pagamentos atrasados
- Registrar check-ins em planilhas/sistemas externos
- Atualizar métricas em dashboards externos

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# N8N Webhooks (opcional)
N8N_ENABLED="true"
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/your-webhook-id"
```

### 2. Desabilitar Webhooks

Para desabilitar os webhooks (ex: ambiente de desenvolvimento):

```env
N8N_ENABLED="false"
```

Quando desabilitado, os webhooks não serão disparados mas não causarão erros.

### 3. Setup no n8n

1. Crie um workflow no n8n
2. Adicione um nó "Webhook"
3. Configure como "POST"
4. Copie a URL do webhook
5. Cole no `.env` como `N8N_WEBHOOK_URL`

---

## 🔌 Endpoints

### Base URL

```
http://localhost:3001/api/n8n-webhooks
```

---

### 1. POST `/trigger`

Dispara um webhook manualmente

**Autenticação:** ADMIN, MASTER

**Request Body:**

```json
{
  "eventType": "user.created",
  "data": {
    "userId": "123",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "userId": "123",
  "metadata": "{\"source\":\"manual\"}"
}
```

**Response:**

```json
{
  "success": true,
  "eventId": "evt_1234567890_abc123def",
  "timestamp": "2025-12-19T10:30:00.000Z"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3001/api/n8n-webhooks/trigger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "user.created",
    "data": {
      "userId": "123",
      "name": "João Silva"
    }
  }'
```

---

### 2. GET `/status`

Verifica status dos webhooks

**Autenticação:** ADMIN, MASTER

**Response:**

```json
{
  "enabled": true,
  "timestamp": "2025-12-19T10:30:00.000Z"
}
```

**cURL:**

```bash
curl -X GET http://localhost:3001/api/n8n-webhooks/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. POST `/test`

Testa conectividade com n8n

**Autenticação:** ADMIN, MASTER

**Response:**

```json
{
  "success": true,
  "eventId": "evt_1234567890_abc123def",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "message": "Webhook de teste enviado com sucesso"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3001/api/n8n-webhooks/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📡 Eventos Disponíveis

### 1. `user.created`

Disparado quando um usuário é criado

**Payload:**

```json
{
  "eventType": "user.created",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "data": {
    "userId": "123",
    "user": {
      "email": "joao@example.com",
      "name": "João Silva",
      "role": "ALUNO"
    }
  },
  "userId": "123"
}
```

---

### 2. `user.updated`

Disparado quando um usuário é atualizado

**Payload:**

```json
{
  "eventType": "user.updated",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "data": {
    "userId": "123",
    "changes": {
      "name": "João da Silva",
      "phone": "(11) 99999-9999"
    }
  },
  "userId": "123"
}
```

---

### 3. `user.deleted`

Disparado quando um usuário é deletado (soft delete)

**Payload:**

```json
{
  "eventType": "user.deleted",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "data": {
    "userId": "123",
    "deletedAt": "2025-12-19T10:30:00.000Z"
  },
  "userId": "123"
}
```

---

### 4. `payment.received`

Disparado quando um pagamento é marcado como recebido

**Payload:**

```json
{
  "eventType": "payment.received",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "data": {
    "paymentId": "456",
    "userId": "123",
    "amount": 150.0,
    "payment": {
      "type": "MENSALIDADE",
      "dueDate": "2025-12-15",
      "paidAt": "2025-12-19"
    },
    "receivedAt": "2025-12-19T10:30:00.000Z"
  },
  "userId": "123"
}
```

---

### 5. `payment.overdue`

Disparado quando um pagamento está atrasado

**Payload:**

```json
{
  "eventType": "payment.overdue",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "data": {
    "paymentId": "456",
    "userId": "123",
    "daysOverdue": 5,
    "payment": {
      "type": "MENSALIDADE",
      "amount": 150.0,
      "dueDate": "2025-12-14"
    }
  },
  "userId": "123"
}
```

---

### 6. `checkin.completed`

Disparado quando um check-in é realizado

**Payload:**

```json
{
  "eventType": "checkin.completed",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "data": {
    "checkInId": "789",
    "userId": "123",
    "checkIn": {
      "method": "RFID",
      "timestamp": "2025-12-19T10:30:00.000Z",
      "location": "Unidade Centro"
    }
  },
  "userId": "123"
}
```

---

### 7. `health.updated`

Disparado quando métricas de saúde são atualizadas

**Payload:**

```json
{
  "eventType": "health.updated",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "data": {
    "userId": "123",
    "metrics": {
      "weight": 75.5,
      "height": 175,
      "bodyFatPercentage": 18.5
    },
    "updatedAt": "2025-12-19T10:30:00.000Z"
  },
  "userId": "123"
}
```

---

## 🔧 Uso nos Módulos

### UsersModule

```typescript
import { N8nWebhooksService } from "../n8n-webhooks/n8n-webhooks.service";

@Injectable()
export class UsersService {
  constructor(private n8nWebhooksService: N8nWebhooksService) {}

  async create(dto: CreateUserDto) {
    // Criar usuário...
    const user = await this.db.insert(tbUsers).values(data);

    // Disparar webhook
    await this.n8nWebhooksService.onUserCreated(user.id, user);

    return user;
  }
}
```

### FinancialModule

```typescript
async markAsPaid(id: string, dto: MarkAsPaidDto) {
  // Marcar como pago...
  const payment = await this.db.update(tbFinancial)...

  // Disparar webhook
  await this.n8nWebhooksService.onPaymentReceived(
    id,
    payment.userId,
    payment.amount,
    payment,
  );

  return payment;
}
```

### CheckInsModule

```typescript
async create(dto: CreateCheckInDto) {
  // Criar check-in...
  const checkIn = await this.db.insert(tbCheckIns)...

  // Disparar webhook
  await this.n8nWebhooksService.onCheckIn(
    checkIn.id,
    dto.userId,
    checkIn,
  );

  return checkIn;
}
```

---

## 📝 Exemplos Práticos

### Workflow n8n: Enviar E-mail de Boas-Vindas

1. **Webhook Node** - Recebe o evento `user.created`
2. **Filter Node** - Verifica se `eventType === 'user.created'`
3. **Email Node** - Envia e-mail com:
   - Para: `{{ $json.data.user.email }}`
   - Assunto: "Bem-vindo ao BM Studio!"
   - Corpo: Template com nome do usuário

### Workflow n8n: Alerta de Pagamento Atrasado

1. **Webhook Node** - Recebe `payment.overdue`
2. **Filter Node** - Verifica se `daysOverdue >= 5`
3. **Slack Node** - Envia mensagem:
   ```
   ⚠️ Pagamento atrasado!
   Usuário: {{ $json.data.userId }}
   Dias: {{ $json.data.daysOverdue }}
   Valor: R$ {{ $json.data.payment.amount }}
   ```

### Workflow n8n: Registro de Check-ins em Planilha

1. **Webhook Node** - Recebe `checkin.completed`
2. **Google Sheets Node** - Adiciona linha:
   - Data/Hora: `{{ $json.timestamp }}`
   - Usuário: `{{ $json.data.userId }}`
   - Método: `{{ $json.data.checkIn.method }}`

---

## 🐛 Debug e Logs

### Logs no Backend

O serviço gera logs automáticos:

```
[N8nWebhooksService] Webhook disparado: user.created (ID: evt_123_abc)
[N8nWebhooksService] Erro ao disparar webhook: Network timeout
```

### Verificar Status

```bash
curl -X GET http://localhost:3001/api/n8n-webhooks/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Testar Conectividade

```bash
curl -X POST http://localhost:3001/api/n8n-webhooks/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔒 Segurança

### Autenticação

Todos os endpoints exigem autenticação JWT e role ADMIN/MASTER.

### Headers

O webhook enviado ao n8n inclui:

- `Content-Type: application/json`
- `X-Event-Type: {eventType}` - Tipo do evento para roteamento

### Validação

- DTOs validam payloads com `class-validator`
- Enum garante apenas eventos válidos

---

## 📊 Resumo

- **3 Endpoints**: trigger, status, test
- **7 Tipos de Eventos**: user (3), payment (2), checkin (1), health (1)
- **Integração Opcional**: Funciona sem n8n configurado
- **Logs Estruturados**: Logger do NestJS
- **Type-Safe**: DTOs e interfaces TypeScript

---

**Status**: ✅ Módulo completo e funcional  
**Última atualização**: 19 de dezembro de 2025
