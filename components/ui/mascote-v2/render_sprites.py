"""
render_sprites.py v2
Revisão para foco em fidelidade. Mobile deixou de ser restrição de orçamento.

Mudanças em relação à v1:
  - 25 frames (contra 15). Passo angular cai de 4,9° para 2,8°.
  - Supersampling: renderiza a 1,5x e o build reduz com Lanczos.
    Antialiasing melhor do que o Cycles entrega direto na resolução final,
    principalmente na borda do visor e no contorno das mãos.
  - 512 amostras, com denoiser configurado para não borrar o clearcoat.
  - Light Tree ligado, para o mascote receber bounce correto do ambiente.

Uso:
    blender mascote.blend --background --python scripts/render_sprites.py

REGRA DE RESOLUÇÃO: RES precisa ser o tamanho de exibição em CSS px x 2.
Exibindo a 320 px, RES = 640. Renderizar abaixo disso joga fora a fidelidade
que o resto do pipeline está tentando preservar.
"""

import os
import math

import bpy

# --------------------------------------------------------------------------
# CONFIG
# --------------------------------------------------------------------------

FRAMES = 25                 # ímpar seria ideal, mas 25 fecha grade 5x5 exata
COLS = 5                    # grade da folha. rows = ceil(FRAMES / COLS)

YAW_BODY = 0.22             # radianos no extremo, igual ao componente
YAW_HELMET = 0.42           # radianos no extremo, relativo ao corpo
ARM_SWING = 0.045

RES = 640                   # px finais por frame = display CSS x 2
SUPERSAMPLE = 1.5           # renderiza a RES*SS, o build reduz com Lanczos
SAMPLES = 512

OUT_DIR = "//sprites/"

BODY_NAME = "Mascot_Body"
HELMET_NAME = "Helmet_Group"
ARM_NAME = "Arm_R_Group"

SETUP_SHADOW_CATCHER = True
SHADOW_PLANE_SIZE = 3.0

# --------------------------------------------------------------------------


def require(name):
    obj = bpy.data.objects.get(name)
    if obj is None:
        raise RuntimeError(
            f"Objeto '{name}' não encontrado. "
            f"Confira a hierarquia de Empties da spec de modelagem."
        )
    return obj


def setup_render(scene):
    render_res = int(RES * SUPERSAMPLE)

    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.adaptive_threshold = 0.01

    # Denoiser: OPTIX/OIDN borram detalhe especular fino se o prefilter
    # estiver agressivo. ACCURATE preserva o brilho do visor.
    scene.cycles.use_denoising = True
    try:
        scene.cycles.denoising_prefilter = "ACCURATE"
    except (AttributeError, TypeError):
        pass  # nome da propriedade varia entre versões do Blender

    # Light Tree melhora o bounce vindo do ambiente, que é o que dá o
    # preenchimento suave nas sombras do casco branco.
    try:
        scene.cycles.use_light_tree = True
    except AttributeError:
        pass

    # Clamp indirect alto demais corta o highlight do clearcoat.
    scene.cycles.sample_clamp_indirect = 0.0

    scene.render.resolution_x = render_res
    scene.render.resolution_y = render_res
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True

    # Filtro de pixel largo demais amolece a silhueta. 1.2 é o ponto.
    scene.render.filter_size = 1.2

    img = scene.render.image_settings
    img.file_format = "PNG"
    img.color_mode = "RGBA"
    img.color_depth = "16"       # 16 bits evita banding nos gradientes do casco
    img.compression = 15

    # Standard preserva a referência. Filmic e AgX escurecem o branco.
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"

    print(f"[sprites] renderizando a {render_res}px, saída final {RES}px")


def setup_shadow_catcher():
    existing = bpy.data.objects.get("Shadow_Catcher")
    if existing:
        return existing

    bpy.ops.mesh.primitive_plane_add(size=SHADOW_PLANE_SIZE, location=(0, 0, 0))
    plane = bpy.context.active_object
    plane.name = "Shadow_Catcher"
    plane.is_shadow_catcher = True
    plane.visible_diffuse = False
    plane.visible_glossy = False
    return plane


def main():
    scene = bpy.context.scene
    setup_render(scene)

    if SETUP_SHADOW_CATCHER:
        setup_shadow_catcher()

    body = require(BODY_NAME)
    helmet = require(HELMET_NAME)
    arm = bpy.data.objects.get(ARM_NAME)

    original = {
        "body": tuple(body.rotation_euler),
        "helmet": tuple(helmet.rotation_euler),
        "arm": tuple(arm.rotation_euler) if arm else None,
    }

    out = bpy.path.abspath(OUT_DIR)
    os.makedirs(out, exist_ok=True)

    center = FRAMES // 2
    rows = math.ceil(FRAMES / COLS)

    for i in range(FRAMES):
        t = (i / (FRAMES - 1)) * 2.0 - 1.0

        body.rotation_euler.z = original["body"][2] + t * YAW_BODY
        helmet.rotation_euler.z = original["helmet"][2] + t * YAW_HELMET

        if arm:
            arm.rotation_euler.y = original["arm"][1] + math.sin(t * math.pi) * ARM_SWING

        scene.render.filepath = os.path.join(out, f"frame_{i:02d}")
        bpy.ops.render.render(write_still=True)
        print(f"[sprites] frame {i + 1}/{FRAMES} (t={t:+.3f})")

        if i == center:
            scene.render.filepath = os.path.join(out, "poster")
            bpy.ops.render.render(write_still=True)

    body.rotation_euler = original["body"]
    helmet.rotation_euler = original["helmet"]
    if arm and original["arm"]:
        arm.rotation_euler = original["arm"]

    print("")
    print(f"[sprites] {FRAMES} frames + poster em: {out}")
    print(f"[sprites] grade: {COLS}x{rows}   folha final: {COLS * RES}x{rows * RES}px")
    print(f"[sprites] passo angular: {math.degrees(YAW_HELMET * 2) / (FRAMES - 1):.1f}°")
    print("[sprites] próximo passo: bash scripts/build-sprite.sh")
    print(f"[sprites] no componente: frames={FRAMES} cols={COLS}")


if __name__ == "__main__":
    main()
