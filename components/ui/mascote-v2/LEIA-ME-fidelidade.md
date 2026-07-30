# Performance e fidelidade: a conta refeita

Mobile como secundário. Os dois critérios agora são desempenho em desktop e fidelidade à referência.

---

## 1. Onde isso nos deixa

Meu argumento mais forte a favor do sprite era que celular não pagaria a conta. Você tirou esse argumento da mesa. Mas os dois critérios que entraram no lugar apontam na mesma direção, e com menos margem para discussão.

**Fidelidade não é um empate. É uma derrota do WebGL, e não por pouco.**

A questão é simples: o sprite **é** o render de referência. Não há aproximação porque não há tradução. O R3F precisa reconstruir em tempo real, com rasterização, aquilo que o Cycles resolveu com path tracing.

---

## 2. O que o R3F perde, item por item

| Elemento | Cycles (sprite) | R3F em tempo real | Impacto visual |
|---|---|---|---|
| Iluminação global | Bounce real, multi-bounce | Nenhum. Só o environment map | Sombras do casco branco ficam mortas, sem o preenchimento suave que dá a leitura de plástico |
| Sombra de contato | Penumbra correta, escurece no contato e abre com a distância | `ContactShadows` ou gradiente CSS | Sombra chapada. É o detalhe que faz o objeto "pousar" ou "flutuar" |
| Clearcoat do visor | Fresnel e camada de verniz resolvidos fisicamente | Aproximação analítica do `MeshPhysicalMaterial` | Reflexo do visor mais duro, perde o gradiente do brilho |
| Reflexos no visor | Reflete a cena e o ambiente real | Reflete um `RoomEnvironment`, que é uma caixa falsa | Reflexo genérico, sem a assinatura de estúdio da referência |
| Oclusão de ambiente | Calculada por amostragem | Só se você assar um mapa | Assável, mas o mapa assado é estático e não acompanha a pose |
| Antialiasing | Sampling do Cycles, mais supersampling de 1,5x | MSAA do WebGL | Borda do visor e contorno dos dedos visivelmente mais limpos no sprite |
| Profundidade de cor | 16 bits no render, gradientes suaves | 8 bits com dithering | Banding sutil nos gradientes do casco branco |

Nenhum desses itens é fatal isolado. Somados, são a diferença entre "parece o render" e "parece uma versão em tempo real do render".

**Onde o R3F ganha em fidelidade:** ele é sempre um frame correto. O sprite faz crossfade entre dois frames, e em movimento muito rápido de cursor dá para perceber um fantasma leve se você procurar. Com 25 frames e passo de 2,0° isso fica no limiar do perceptível.

---

## 3. Desempenho, sem o argumento mobile

| | Sprite v2 | R3F enxuto |
|---|---|---|
| JS na thread principal | ~2 KB | ~600 KB para parsear e executar |
| Inicialização | decodifica imagem, fora da thread principal | contexto WebGL, upload de geometria, compilação de shader |
| Frames com cursor parado | 0 | 0 |
| Frames com cursor em movimento | 0 render de GPU, só `transform` composto | render completo por frame |
| Memória | ~41 MB de bitmap | 30 a 80 MB de contexto |
| Primeiro movimento em máquina fria | instantâneo | engasgo de compilação, mitigável com `gl.compile` |
| Bytes desktop | ~350 a 500 KB | ~395 KB |

Bytes empataram. **O que não empata é o trabalho na thread principal**, e é ali que mora INP, que é a métrica que o usuário sente como "o site trava quando eu mexo".

---

## 4. O que mudou no sprite agora que o orçamento abriu

Com mobile fora da restrição, a v1 estava conservadora demais. A v2 gasta o orçamento em fidelidade:

| | v1 | v2 |
|---|---|---|
| Frames | 15 | 25 |
| Passo angular | 3,4° | **2,0°** |
| Resolução por frame | 560 px | 640 px |
| Supersampling | nenhum | **1,5x com redução Lanczos** |
| Amostras do Cycles | 256 | 512 |
| Profundidade do render | 8 bits | 16 bits |
| Alfa na codificação | q90 | **q100** |
| Formato da folha | tira 15x1 | grade 5x5 |
| Memória | 20 MB | 41 MB |

O supersampling é o item que mais rende: renderizar a 960 px e reduzir com Lanczos até 640 dá borda mais limpa do que renderizar direto a 640, porque o filtro de reconstrução trabalha com mais informação. Custa tempo de render, que é offline, e zero em runtime.

A grade 5x5 substituiu a tira porque 25 frames em tira dariam 16.000 px de largura, encostando no limite de textura dos navegadores.

---

## 5. Recomendação revisada

**Sprite, com convicção maior do que eu tinha antes.**

Pelos seus dois critérios declarados, ele ganha nos dois. Não é um trade-off, é uma escolha dominante. Eu vinha defendendo o sprite por economia, que era o argumento mais fraco. O argumento forte sempre foi fidelidade, e eu não tinha colocado o peso certo nele.

### Onde eu estaria errado

Existe uma ambiguidade na palavra fidelidade que muda a resposta, e eu não sei qual das duas você quis dizer:

**Fidelidade à imagem de referência.** O mascote precisa aparecer no site exatamente como naquele PNG. Sprite, sem discussão.

**Fidelidade como 3D de verdade.** O que importa é que o objeto se comporte como um objeto tridimensional, responda continuamente, e não seja uma sequência de imagens fingindo. Aí o R3F ganha, porque a mentira do sprite tem bordas: ela quebra se o fundo mudar, se o site ganhar tema escuro, se você quiser outro ângulo de câmera, ou se o usuário puder arrastar.

Se for a segunda leitura, ignore esta recomendação e vá de R3F enxuto, que já está pronto.

Pelo contexto do seu site institucional, aposto na primeira. Mas é aposta, não leitura.

---

## 6. Pipeline

```bash
blender mascote.blend --background --python scripts/render_sprites.py
RES=640 COLS=5 bash scripts/build-sprite.sh
```

```tsx
<div className="h-[420px]">
  <MascotSprite basePath="/mascote" frames={25} cols={5} priority />
</div>
```

**Regra de resolução:** `RES` precisa ser o tamanho de exibição em CSS px multiplicado por 2. Exibindo a 320 px, `RES = 640`. Renderizar abaixo disso joga fora exatamente a fidelidade que o resto do pipeline está tentando preservar.

---

## 7. Se quiser empurrar a fidelidade além

Em ordem de retorno por esforço:

1. **Supersampling 2x em vez de 1,5x.** Só custa tempo de render. Ganho pequeno mas real na borda do visor.
2. **31 frames em grade 6x6.** Passo cai para 1,6°, memória sobe para 59 MB. O crossfade praticamente desaparece.
3. **Grade 2D de guinada por inclinação.** Substitui o `rotateX` em CSS por inclinação renderizada de verdade. 15 x 5 dá 75 frames e cerca de 94 MB. É o teto do que dá para fazer sem WebGL, e provavelmente exagero: a inclinação é sutil e o CSS engana bem.

Faria o 1 sem pensar, o 2 se sobrar tempo, e o 3 só se alguém reclamar especificamente da inclinação.

---

## 8. Verificação de fidelidade

Não aceite o resultado sem estes quatro:

- [ ] `poster.avif` lado a lado com o PNG de referência, a 100%. Se o branco lavou, o view transform do Blender não estava em Standard
- [ ] Borda do visor a 200% de zoom. Franja escura significa alfa mal codificado, suba a quality do AVIF
- [ ] Gradiente do casco branco em tela boa. Banding significa que o render saiu em 8 bits
- [ ] Cursor varrendo a largura do hero devagar e depois rápido. No rápido, procure fantasma entre frames. Se incomodar, suba para 31 frames

E os dois de desempenho:

- [ ] DevTools Performance com o cursor parado: nenhuma atividade
- [ ] DevTools Performance movendo o cursor: só `transform`, nenhum layout nem paint fora do mascote

---

## 9. Confiança

| Item | Confiança | Observação |
|---|---|---|
| Sprite tem fidelidade superior ao R3F em tempo real | Alta | Diferença estrutural entre path tracing e rasterização |
| A lista de perdas do R3F item por item | Alta | Limitações conhecidas de renderização em tempo real |
| Supersampling 1,5x melhora borda visivelmente | Média-alta | Efeito real, magnitude depende do conteúdo |
| Fantasma do crossfade some com 25 frames | **Média** | Julgamento perceptual. Só seus olhos decidem |
| Tamanho de 350 a 500 KB para a folha | **Média-baixa** | Grade 3200x3200 é território pouco previsível em AVIF. Meça |
| 41 MB de memória de bitmap | Alta | Aritmética direta, confirmada pelo script |
| 30 a 80 MB do contexto WebGL | **Baixa** | Ordem de grandeza, varia muito com driver e DPR |
| Qual leitura de "fidelidade" você quis dizer | **Baixa** | É a única coisa que pode inverter a recomendação |

---

## 10. Pergunta melhor

Se você quiser destravar uma resposta mais precisa que esta, a pergunta que abre mais portas não é sobre tecnologia:

> Em quantos contextos diferentes esse mascote vai aparecer nos próximos 12 meses, e em quantos deles o fundo, a cor ou o ângulo mudam?

Se a resposta for "um, o hero, sempre igual", sprite fecha a questão e a discussão acaba aqui.

Se for "três ou quatro, com variações por produto", o R3F volta a ganhar por um caminho diferente do que eu vinha argumentando: não por desempenho nem por fidelidade, mas porque cada contexto novo custa um render inteiro no sprite e custa uma prop no WebGL.
