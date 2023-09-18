<script>
  import { T, useFrame } from '@threlte/core'
//   import { interactivity } from '@threlte/extras'
  import { spring } from 'svelte/motion'

//   interactivity()

  const gravity = -0.01;
  const drag = 0.995;
  let velY = 0;
  let posY = 4;

  const scale = spring(1)
  let rotation = 0
  useFrame((state, delta) => {
    velY *= drag;
    posY += velY;
    velY += gravity;

    if (posY < 0) {
      velY = -velY;
      posY = 0;
    }

    rotation += delta
  })
</script>

<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
  }}
/>

<T.DirectionalLight position={[0, 10, 10]} castShadow />

<T.Mesh
  rotation.y={rotation}
  position.y={1}
  scale={$scale}
  on:pointerenter={() => scale.set(1.5)}
  on:pointerleave={() => scale.set(1)}
  castShadow
>
  <T.BoxGeometry args={[1, 2, 1]} />
  <T.MeshStandardMaterial color="#f43e5c" />
</T.Mesh>

<T.Mesh
  position.y={2.45 + posY}
  castShadow
>
  <T.SphereGeometry args={[0.5, 32, 32]} />
  <T.MeshStandardMaterial color="#f43e5c" />
</T.Mesh>

<T.Mesh rotation.x={-Math.PI/2} receiveShadow>
  <T.CircleGeometry args={[4, 40]}/>
  <T.MeshStandardMaterial color="#1e1e2e" />
</T.Mesh>
