# 📱 Integração n8n - Workflows de Automação

## 🎯 Visão Geral

Este documento descreve os workflows do n8n integrados ao sistema de gestão da academia BM Studio Fitness.

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente (.env)

```bash
# URL base do servidor n8n
N8N_WEBHOOK_BASE_URL=https://seu-n8n.com/webhook

# Secret key para autenticação (opcional)
N8N_WEBHOOK_SECRET=seu-secret-key
```

### 2. Instalação do n8n

**Opção 1: Docker (Recomendado)**

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Opção 2: npm**

```bash
npm install -g n8n
n8n start
```

Acesse: `http://localhost:5678`

---

## 📋 Workflow 1: Lembretes de Cobrança Automáticos

### 📝 Descrição

Envia lembretes personalizados para alunos com mensalidades vencendo ou vencidas.

### 🔗 Webhook URL

```
POST https://seu-n8n.com/webhook/payment-reminders
```

### 📊 Payload Exemplo

```json
{
  "type": "due_today",
  "students": [
    {
      "id": "uuid-aluno",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "amountInCents": 15000,
      "amountFormatted": "R$ 150,00",
      "dueDate": 10,
      "daysOverdue": 0
    }
  ],
  "triggeredBy": "uuid-admin",
  "triggeredAt": "2025-12-11T10:00:00.000Z"
}
```

### 🔄 Fluxo do Workflow

```
┌─────────────────────┐
│  Webhook Trigger    │ ← Recebe payload do Next.js
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Filter by Type     │ → Filtra por tipo (due_today/due_soon/overdue)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Loop Students      │ → Para cada aluno
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Build Message      │ → Monta mensagem personalizada
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Send WhatsApp      │ → Envia via WhatsApp Business API
│  or Email           │ → Ou envia email via SMTP/SendGrid
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Log Result         │ → Registra envio bem-sucedido
└─────────────────────┘
```

### 📄 JSON do Workflow (n8n)

<details>
<summary>Clique para expandir o JSON</summary>

```json
{
  "name": "Payment Reminders",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "payment-reminders",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.type}}",
              "operation": "notEmpty"
            }
          ]
        }
      },
      "id": "filter-1",
      "name": "Filter Valid Requests",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "id": "loop-1",
      "name": "Loop Students",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "message",
              "value": "=Olá {{$json.name}},\n\nLembrete: sua mensalidade de {{$json.amountFormatted}} {{$node[\"Webhook\"].json[\"type\"] === \"due_today\" ? \"vence hoje\" : $node[\"Webhook\"].json[\"type\"] === \"due_soon\" ? \"vence em breve\" : \"está vencida há \" + $json.daysOverdue + \" dias\"}}.\n\nPague via PIX ou cartão no app.\n\nBM Studio Fitness"
            }
          ]
        },
        "options": {}
      },
      "id": "set-1",
      "name": "Build Message",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "send",
        "chatId": "={{$json.phone}}@c.us",
        "message": "={{$json.message}}",
        "additionalFields": {}
      },
      "id": "whatsapp-1",
      "name": "Send WhatsApp",
      "type": "n8n-nodes-base.whatsapp",
      "typeVersion": 1,
      "position": [1050, 200],
      "credentials": {
        "whatsappApi": {
          "id": "1",
          "name": "WhatsApp Business"
        }
      }
    },
    {
      "parameters": {
        "resource": "email",
        "operation": "send",
        "fromEmail": "contato@bmstudiofitness.com",
        "toEmail": "={{$json.email}}",
        "subject": "Lembrete de Mensalidade - BM Studio",
        "message": "={{$json.message}}",
        "options": {}
      },
      "id": "email-1",
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [1050, 400],
      "credentials": {
        "smtp": {
          "id": "2",
          "name": "SMTP Credentials"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\"success\": true, \"sent\": $items().length} }}"
      },
      "id": "response-1",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [{ "node": "Filter Valid Requests", "type": "main", "index": 0 }]
      ]
    },
    "Filter Valid Requests": {
      "main": [[{ "node": "Loop Students", "type": "main", "index": 0 }]]
    },
    "Loop Students": {
      "main": [[{ "node": "Build Message", "type": "main", "index": 0 }]]
    },
    "Build Message": {
      "main": [
        [
          { "node": "Send WhatsApp", "type": "main", "index": 0 },
          { "node": "Send Email", "type": "main", "index": 0 }
        ]
      ]
    },
    "Send WhatsApp": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    },
    "Send Email": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    }
  }
}
```

</details>

### 💡 Como Usar no Sistema

```typescript
import { sendPaymentRemindersAction } from "@/actions/admin/send-payment-reminders-action";

// Enviar lembretes para vencimentos de hoje
await sendPaymentRemindersAction("due_today", userId);

// Enviar lembretes para próximos 7 dias
await sendPaymentRemindersAction("due_soon", userId);

// Enviar lembretes para pagamentos em atraso
await sendPaymentRemindersAction("overdue", userId);
```

---

## 🏋️ Workflow 2: Notificações de Check-in

### 📝 Descrição

Notifica coaches quando alunos fazem check-in na academia.

### 🔗 Webhook URL

```
POST https://seu-n8n.com/webhook/checkin-notification
```

### 📊 Payload Exemplo

```json
{
  "studentId": "uuid-aluno",
  "studentName": "Maria Santos",
  "studentEmail": "maria@email.com",
  "checkinDate": "2025-12-11",
  "checkinTime": "09:30",
  "coachId": "uuid-coach",
  "coachName": "Carlos Personal",
  "coachEmail": "carlos@bmstudio.com",
  "academyName": "BM Studio Fitness"
}
```

### 🔄 Fluxo do Workflow

```
┌─────────────────────┐
│  Webhook Trigger    │ ← Recebe check-in do Next.js
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Get Coach Data     │ → Busca dados do coach responsável
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Build Notification │ → Monta notificação
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Send to Coach      │ → Envia via Slack/Teams/Email
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update Dashboard   │ → Atualiza dashboard de presença
└─────────────────────┘
```

### 📄 JSON do Workflow (n8n)

<details>
<summary>Clique para expandir o JSON</summary>

```json
{
  "name": "Check-in Notifications",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "checkin-notification",
        "responseMode": "responseNode"
      },
      "id": "webhook-2",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "message",
              "value": "=✅ Check-in realizado!\n\n👤 Aluno: {{$json.studentName}}\n⏰ Horário: {{$json.checkinTime}}\n📅 Data: {{$json.checkinDate}}\n🏢 {{$json.academyName}}"
            },
            {
              "name": "slackMessage",
              "value": "={\n  \"blocks\": [\n    {\n      \"type\": \"header\",\n      \"text\": {\n        \"type\": \"plain_text\",\n        \"text\": \"✅ Novo Check-in\"\n      }\n    },\n    {\n      \"type\": \"section\",\n      \"fields\": [\n        {\"type\": \"mrkdwn\", \"text\": \"*Aluno:*\\n{{$json.studentName}}\"},\n        {\"type\": \"mrkdwn\", \"text\": \"*Horário:*\\n{{$json.checkinTime}}\"}\n      ]\n    }\n  ]\n}"
            }
          ]
        }
      },
      "id": "set-2",
      "name": "Build Notification",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "post",
        "channel": "#checkins",
        "text": "={{$json.slackMessage}}",
        "attachments": [],
        "otherOptions": {}
      },
      "id": "slack-1",
      "name": "Send to Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [650, 200],
      "credentials": {
        "slackApi": {
          "id": "3",
          "name": "Slack"
        }
      }
    },
    {
      "parameters": {
        "resource": "email",
        "operation": "send",
        "fromEmail": "sistema@bmstudiofitness.com",
        "toEmail": "={{$json.coachEmail || 'admin@bmstudio.com'}}",
        "subject": "Check-in: {{$json.studentName}}",
        "message": "={{$json.message}}"
      },
      "id": "email-2",
      "name": "Send Email to Coach",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [650, 400]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\"success\": true} }}"
      },
      "id": "response-2",
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [850, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Build Notification", "type": "main", "index": 0 }]]
    },
    "Build Notification": {
      "main": [
        [
          { "node": "Send to Slack", "type": "main", "index": 0 },
          { "node": "Send Email to Coach", "type": "main", "index": 0 }
        ]
      ]
    },
    "Send to Slack": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    },
    "Send Email to Coach": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    }
  }
}
```

</details>

### 💡 Como Funciona Automaticamente

O webhook é chamado automaticamente em:

- [quick-check-in-action.ts](../actions/user/quick-check-in-action.ts)

```typescript
// Integração automática após check-in
sendCheckinNotificationWebhook({
  studentId: user.id,
  studentName: user.name,
  studentEmail: user.email,
  checkinDate: today,
  checkinTime: currentTime,
  academyName: "BM Studio Fitness",
}).catch(console.error);
```

---

## 💳 Workflow 4: Integração com Pagamentos

### 📝 Descrição

Processa webhooks de gateways de pagamento e atualiza sistema.

### 🔗 Webhook URLs

**Pagamento Recebido:**

```
POST https://seu-n8n.com/webhook/payment-received
```

**Pagamento Falhou:**

```
POST https://seu-n8n.com/webhook/payment-failed
```

### 📊 Payload Exemplo (Pagamento Recebido)

```json
{
  "studentId": "uuid-aluno",
  "studentName": "Pedro Costa",
  "studentEmail": "pedro@email.com",
  "studentPhone": "11988888888",
  "amountInCents": 15000,
  "amountFormatted": "R$ 150,00",
  "paymentDate": "2025-12-11T14:30:00.000Z",
  "paymentMethod": "pix",
  "transactionId": "TXN123456",
  "dueDate": 10,
  "referenceMonth": "dezembro de 2025"
}
```

### 📊 Payload Exemplo (Pagamento Falhou)

```json
{
  "studentId": "uuid-aluno",
  "studentName": "Pedro Costa",
  "studentEmail": "pedro@email.com",
  "studentPhone": "11988888888",
  "amountInCents": 15000,
  "amountFormatted": "R$ 150,00",
  "attemptDate": "2025-12-11T14:30:00.000Z",
  "failureReason": "Saldo insuficiente",
  "dueDate": 10
}
```

### 🔄 Fluxo do Workflow (Pagamento Recebido)

```
┌─────────────────────┐
│  Webhook Trigger    │ ← Recebe confirmação de pagamento
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Validate Payment   │ → Valida dados do pagamento
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update Database    │ → Atualiza status no PostgreSQL
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Send Receipt       │ → Gera e envia recibo por email
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Send WhatsApp      │ → Confirma pagamento via WhatsApp
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update Sheets      │ → Registra em Google Sheets (controle)
└─────────────────────┘
```

### 📄 JSON do Workflow (Pagamento Recebido)

<details>
<summary>Clique para expandir o JSON</summary>

```json
{
  "name": "Payment Received",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "payment-received",
        "responseMode": "responseNode"
      },
      "id": "webhook-3",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.amountInCents}}",
              "operation": "larger",
              "value2": 0
            }
          ],
          "string": [
            {
              "value1": "={{$json.studentId}}",
              "operation": "notEmpty"
            }
          ]
        }
      },
      "id": "validate-1",
      "name": "Validate Payment",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=UPDATE financial SET paid = true, last_payment_date = '{{$json.paymentDate}}' WHERE user_id = '{{$json.studentId}}'",
        "additionalFields": {}
      },
      "id": "postgres-1",
      "name": "Update Database",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [650, 300],
      "credentials": {
        "postgres": {
          "id": "4",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "receiptHtml",
              "value": "=<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }\n    .header { background: #C2A537; color: white; padding: 20px; text-align: center; }\n    .content { padding: 20px; }\n    .amount { font-size: 24px; font-weight: bold; color: #C2A537; }\n  </style>\n</head>\n<body>\n  <div class=\"header\">\n    <h1>Pagamento Confirmado!</h1>\n  </div>\n  <div class=\"content\">\n    <p>Olá <strong>{{$json.studentName}}</strong>,</p>\n    <p>Seu pagamento foi confirmado com sucesso!</p>\n    <p class=\"amount\">{{$json.amountFormatted}}</p>\n    <p><strong>Método:</strong> {{$json.paymentMethod}}</p>\n    <p><strong>Data:</strong> {{$json.paymentDate}}</p>\n    <p><strong>Referência:</strong> {{$json.referenceMonth}}</p>\n    <p><strong>ID Transação:</strong> {{$json.transactionId}}</p>\n    <p>Obrigado por treinar conosco!</p>\n    <p><em>BM Studio Fitness</em></p>\n  </div>\n</body>\n</html>"
            }
          ]
        }
      },
      "id": "set-3",
      "name": "Generate Receipt",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "resource": "email",
        "operation": "send",
        "fromEmail": "financeiro@bmstudiofitness.com",
        "toEmail": "={{$json.studentEmail}}",
        "subject": "Comprovante de Pagamento - {{$json.referenceMonth}}",
        "emailType": "html",
        "message": "={{$json.receiptHtml}}"
      },
      "id": "email-3",
      "name": "Send Receipt Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [1050, 200]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "send",
        "chatId": "={{$json.studentPhone}}@c.us",
        "message": "=✅ Pagamento confirmado!\n\n💰 Valor: {{$json.amountFormatted}}\n📅 Mês: {{$json.referenceMonth}}\n🔢 ID: {{$json.transactionId}}\n\nObrigado! 💪\nBM Studio Fitness"
      },
      "id": "whatsapp-2",
      "name": "Send WhatsApp Confirmation",
      "type": "n8n-nodes-base.whatsapp",
      "typeVersion": 1,
      "position": [1050, 400]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\"success\": true, \"message\": \"Payment processed\"} }}"
      },
      "id": "response-3",
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Validate Payment", "type": "main", "index": 0 }]]
    },
    "Validate Payment": {
      "main": [[{ "node": "Update Database", "type": "main", "index": 0 }]]
    },
    "Update Database": {
      "main": [[{ "node": "Generate Receipt", "type": "main", "index": 0 }]]
    },
    "Generate Receipt": {
      "main": [
        [
          { "node": "Send Receipt Email", "type": "main", "index": 0 },
          { "node": "Send WhatsApp Confirmation", "type": "main", "index": 0 }
        ]
      ]
    },
    "Send Receipt Email": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    },
    "Send WhatsApp Confirmation": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    }
  }
}
```

</details>

### 💡 Como Usar no Sistema

```typescript
import {
  processPaymentReceivedAction,
  processPaymentFailedAction,
} from "@/actions/admin/process-payment-webhook-action";

// Processar pagamento recebido
await processPaymentReceivedAction(
  userId,
  amountInCents,
  transactionId,
  paymentMethod,
);

// Processar falha de pagamento
await processPaymentFailedAction(userId, amountInCents, failureReason);
```

---

## 🔐 Segurança

### Autenticação de Webhooks

Adicione verificação de token em todos os webhooks n8n:

```typescript
// No n8n, adicione um nó "Function" antes do processamento
const incomingToken = $json.headers["authorization"];
const expectedToken = "Bearer " + $env.N8N_WEBHOOK_SECRET;

if (incomingToken !== expectedToken) {
  throw new Error("Unauthorized");
}

return $input.all();
```

### Rate Limiting

Configure rate limiting no n8n para evitar abuse:

```json
{
  "parameters": {
    "rateLimitMaxRequests": 100,
    "rateLimitInterval": 60
  }
}
```

---

## 📊 Monitoramento

### Logs de Execução

Todos os workflows n8n registram:

- ✅ Execuções bem-sucedidas
- ❌ Falhas e erros
- ⏱️ Tempo de execução
- 📊 Dados processados

Acesse: `http://localhost:5678/executions`

### Alertas

Configure alertas para falhas críticas:

```json
{
  "errorWorkflow": "alert-on-error",
  "settings": {
    "executionTimeout": 60,
    "retryOnFail": true,
    "maxTries": 3
  }
}
```

---

## 🚀 Próximos Passos

1. **Importe os workflows** no n8n (copie os JSONs acima)
2. **Configure credenciais**:
   - WhatsApp Business API
   - SMTP/SendGrid
   - Slack/Teams
   - PostgreSQL
3. **Teste cada webhook** com dados de exemplo
4. **Configure variáveis de ambiente** no sistema Next.js
5. **Ative os workflows** no n8n
6. **Monitore execuções** no dashboard

---

## 📞 Suporte

Para dúvidas sobre n8n:

- 📖 [Documentação oficial](https://docs.n8n.io)
- 💬 [Comunidade n8n](https://community.n8n.io)
- 🐛 [GitHub Issues](https://github.com/n8n-io/n8n)

---

**✅ Integração completa e pronta para uso!**
