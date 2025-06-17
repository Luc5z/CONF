# CONF10 FIGHT - Animação do Sharks

## Funcionalidades Implementadas

### Animação de Caminhada do Sharks
- **Sprites individuais**: O personagem Sharks agora usa sprites individuais (sharks1.png até sharks5.png) para a animação de caminhada
- **Animação fluida**: A animação percorre todas as 5 sprites em sequência durante a caminhada
- **Velocidade otimizada**: Velocidade de animação específica para o Sharks (120ms entre frames)
- **Sistema de ataque corrigido**: Resolvido problema onde o personagem ficava travado ao pressionar "s" (ataque)

### Controles
- **Jogador 1**: 
  - A/D: Mover esquerda/direita
  - W: Pular
  - S: Atacar
  - E: Ataque especial

- **Jogador 2**:
  - Setas: Mover esquerda/direita
  - Seta para cima: Pular
  - Seta para baixo: Atacar
  - Ponto (.): Ataque especial

### Estados de Animação do Sharks
1. **Idle**: Usa a sprite padrão (sharks.png)
2. **Walk**: Cicla através das sprites sharks1.png → sharks2.png → sharks3.png → sharks4.png → sharks5.png
3. **Jump**: Usa a primeira sprite de caminhada (sharks1.png)
4. **Attack**: Usa a última sprite de caminhada (sharks5.png)

### Arquivos Modificados
- `script.js`: Implementação da lógica de animação
- `style.css`: Classes CSS para sprites individuais vs sprite sheets
- `index.html`: Inclusão do arquivo CSS

### Estrutura de Arquivos
```
conf game/
├── index.html
├── script.js
├── style.css
└── img/
    ├── sharks.png (sprite idle)
    ├── sharks1.png (frame 1 da caminhada)
    ├── sharks2.png (frame 2 da caminhada)
    ├── sharks3.png (frame 3 da caminhada)
    ├── sharks4.png (frame 4 da caminhada)
    ├── sharks5.png (frame 5 da caminhada)
    └── ... (outros personagens)
```

## Como Testar
1. Abra o `index.html` no navegador
2. Selecione o personagem "Sharks" para um dos jogadores
3. Use as teclas A/D (Jogador 1) ou setas (Jogador 2) para ver a animação de caminhada
4. Observe a transição suave entre os frames da animação

## Próximos Passos
- Implementar animações similares para outros personagens
- Adicionar sprites específicas para ataques
- Melhorar efeitos visuais durante combate

## Correções Implementadas

### ✅ Bug do Ataque Corrigido (v1.1)
- **Problema**: Personagem Sharks ficava travado ao pressionar "s" (ataque)
- **Causa**: Lógica de transição de estados de animação inadequada
- **Solução**: 
  - Implementada verificação da propriedade `isAttacking` na função `updatePlayer`
  - Adicionado reset automático do estado após duração do ataque (300ms)
  - Melhorada transição entre estados idle/walk/attack/jump

### Sistema de Estados Aprimorado
- Estados agora são gerenciados corretamente baseado na ação atual
- Transições suaves entre todos os estados de animação
- Reset automático para estado idle após ataques
