# Generador de Números Aleatorios — LCG y MCG

Proyecto de **Modelado y Simulación (Ingeniería de Sistemas)**.  
Implementa en JavaScript dos métodos clásicos de generación de números pseudoaleatorios:

- **Algoritmo Congruencial Lineal (LCG):**
  \[
  X_{n+1} = (aX_n + c) \bmod m
  \]

- **Algoritmo Congruencial Multiplicativo (MCG):**
  \[
  X_{n+1} = (aX_n) \bmod m
  \]

---

## ⚙️ Parámetros

- `X₀`: Semilla inicial (entero, `0 ≤ X₀ < 2^P`)
- `K`: Usado para calcular el multiplicador:
  - En LCG: \(a = 1 + 4K\)  
  - En MCG: \(a = 8K + 3\)
- `c`: Incremento (solo en LCG)
- `P`: Define el módulo \(m = 2^P\)
- `D`: Cantidad de decimales en los números aleatorios
- `N`: Cantidad de valores a generar

---

## ▶️ Cómo ejecutar

### Opción 1: Abrir localmente
1. Descarga o clona este repositorio:
   ```bash
   git clone https://github.com/TU-USUARIO/TU-REPO.git
