# Configuração do Carrossel de Imagens

Guia rápido para configurar o carrossel de imagens no projeto.

## 1. Configuração Inicial

1. **Pasta de Imagens:**
   - Crie: `public/images/carousel/`
   - Adicione suas imagens (JPG/PNG)
   - Tamanho: 1920x1080px, máx 500KB
   - Compressão: 85%

2. **Next.js Config:**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       formats: ["image/webp"],
       minimumCacheTTL: 60,
     },
   };
   ```

## 2. Implementação do Componente

1. **Estrutura Básica:**

   ```typescript
   import Image from "next/image";
   import { useState, useEffect } from "react";

   export function Carousel() {
     const [currentIndex, setCurrentIndex] = useState(0);
     // ... restante do código
   }
   ```

2. **Otimizações:**
   - Use `priority` na primeira imagem
   - Configure `sizes` para responsividade
   - Adicione controles de navegação

## 3. Manutenção

1. **Adicionar/Remover Imagens:**
   - Coloque na pasta correta
   - Atualize o array de imagens
   - Mantenha padrões de dimensão

2. **Acessibilidade:**
   - Alt text em todas imagens
   - Controles acessíveis
   - Navegação por teclado

## Resolução de Problemas

- **Imagens não carregam:** Verifique caminhos e extensões
- **Performance ruim:** Otimize tamanhos e cache
- **Layout quebrado:** Confirme dimensões e CSS
