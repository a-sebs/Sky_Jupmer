# Sky Jumper

Juego de plataformas vertical hecho con **Phaser 3 + TypeScript + Vite**.
Salta de plataforma en plataforma. La cámara sube sola y nunca baja: si te quedas abajo, pierdes.

## Tipos de plataforma
| Color | Tipo |
|---|---|
| Verde | Normal |
| Azul | Se mueve de izquierda a derecha |
| Morado | Se mueve de arriba a abajo |
| Café | Se rompe poco después de pisarla |

## Controles
- `←` `→` / `A` `D`: moverse
- `↑` / `W` / `Espacio`: saltar
- En móvil: botones táctiles en pantalla

## Ejecutar en local
```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # compila a dist/
npm run preview  # sirve la build compilada
```

## Estructura
```
public/            assets estáticos (iconos, sonidos, música...)
src/
  main.ts          configuración de Phaser
  config.ts        constantes del juego (gravedad, saltos, velocidades)
  style.css        estilos para centrar el lienzo
  scenes/
    Boot.ts        arranque mínimo
    Preloader.ts   barra de progreso y texturas procedurales
    MainMenu.ts    título, instrucciones y leyenda
    Game.ts        mundo, físicas, plataformas, cámara y HUD
    GameOver.ts    resultados (altura y tiempo) y reinicio
.github/workflows/deploy.yml   despliegue automático a GitHub Pages
```

## Despliegue en GitHub Pages
1. Sube el proyecto a un repositorio en la rama `main`.
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `push` a `main` instala dependencias, compila y publica `dist/`.
4. Revisa la pestaña **Actions** / **Deployments** para ver el enlace público.

`vite.config.ts` usa `base: './'`, así que funciona sin importar el nombre del repositorio.
