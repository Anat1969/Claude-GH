---
name: 3d-motion-animator
description: יצירת טקסט תלת-ממדי מונפש ואנימציות תנועה לסרטונים, הדגמות והמחשות באפליקציות ענת: Three.js, CSS 3D, GSAP, framer-motion. להפעיל כשנדרש טקסט תלת-ממדי, אנימציה, תנועה, הנפשה, סרטון, הדגמה חזותית, Reel, Shorts, TikTok, או כשמוזכרים "3D", "motion", "אנימציה", "תנועה", "סרטון", "הדגמה".
---

# 3D Motion Animator — סקיל הנפשת תלת-ממד ותנועה

## מהו הפיצ'ר

**טקסט תלת-ממדי מונפש** — הפיכת טקסט שטוח לנפח עם עומק, תאורה, צל, חומר ותנועה.
הטכניקה כוללת: extrusion (הוצאת טקסט מ-2D ל-3D), תאורה ריאליסטית, צל דינמי, וסיבוב/זום/bounce.
השימוש: Reels, TikTok, YouTube Shorts, הדגמות, מצגות, כותרות באפליקציות.

---

## שכבות הטכנולוגיה — מהיר עד עמוק

### שכבה 1: CSS 3D בלבד (אין תלות — מהיר ביותר)
מתאים לאנימציות פשוטות שמספיקות ל-80% מהמקרים.

```css
.text-3d {
  font-family: 'IBM Plex Sans Hebrew', sans-serif;
  font-size: clamp(2rem, 8vw, 6rem);
  font-weight: 900;
  color: #fff;
  text-shadow:
    1px 1px 0 #ccc,
    2px 2px 0 #bbb,
    3px 3px 0 #aaa,
    4px 4px 0 #999,
    5px 5px 0 #888,
    6px 6px 0 #777,
    7px 7px 10px rgba(0,0,0,0.4);
  transform: perspective(400px) rotateX(10deg) rotateY(-5deg);
  animation: float3d 3s ease-in-out infinite;
}

@keyframes float3d {
  0%, 100% { transform: perspective(400px) rotateX(10deg) rotateY(-5deg) translateY(0); }
  50%       { transform: perspective(400px) rotateX(10deg) rotateY(-5deg) translateY(-12px); }
}
```

**סגנונות text-shadow מוכנים:**
- **כרום/מתכת:** `1px 1px #aaa, 2px 2px #bbb, 3px 3px #ccc`
- **זהב:** `1px 1px #b8860b, 2px 2px #daa520, 4px 4px rgba(0,0,0,0.3)`
- **ניאון (זוהר):** `0 0 8px #fff, 0 0 20px currentColor, 0 0 40px currentColor`
- **עמוק/קלאסי:** כל שכבה כהה ב-15° — ראה דוגמה למעלה

---

### שכבה 2: framer-motion (React — מקובץ באפליקציות ענת)
```tsx
import { motion } from 'framer-motion';

const Text3D = ({ text }: { text: string }) => (
  <motion.h1
    style={{
      fontWeight: 900,
      fontSize: 'clamp(2rem, 8vw, 6rem)',
      textShadow: '2px 2px 0 #666, 4px 4px 0 #444, 6px 6px 10px rgba(0,0,0,0.5)',
      perspective: 400,
    }}
    initial={{ opacity: 0, rotateX: 90, y: 60 }}
    animate={{ opacity: 1, rotateX: 10, y: 0 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ scale: 1.05, rotateY: 10 }}
  >
    {text}
  </motion.h1>
);
```

**אנימציות מוכנות ל-framer-motion:**
- **כניסה מלמעלה:** `initial={{ rotateX: 90, opacity: 0 }}` → `animate={{ rotateX: 0, opacity: 1 }}`
- **bounce:** `transition={{ type: 'spring', stiffness: 200, damping: 10 }`
- **wave על אותיות:** כל אות ב-`motion.span` עם delay מדורג
- **zoom-in עם spin:** `initial={{ scale: 0, rotate: -180 }}`

---

### שכבה 3: Three.js — טקסט 3D אמיתי (נפח מלא)
```tsx
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// טעינה עצלנית — לא בבאנדל הראשי
const load3DText = async (scene: THREE.Scene, text: string, color: number) => {
  const loader = new FontLoader();
  const font = await loader.loadAsync(
    'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'
  );

  const geometry = new TextGeometry(text, {
    font,
    size: 1,
    depth: 0.3,        // עומק ה-extrusion
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
  });

  geometry.center(); // מרכוז אוטומטי

  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.6,
    roughness: 0.2,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // סיבוב עדין בלופ
  const animate = () => {
    requestAnimationFrame(animate);
    mesh.rotation.y += 0.005;
    renderer.render(scene, camera);
  };
  animate();
};
```

**הגדרת סצנה בסיסית:**
```tsx
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

// תאורה
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(5, 5, 5);
scene.add(ambient, directional);
```

---

### שכבה 4: GSAP (אנימציות מורכבות ורצפים)
```tsx
import { gsap } from 'gsap';

// רצף כניסה לכל אות בנפרד
const animateLetters = (el: HTMLElement) => {
  const letters = el.querySelectorAll('.letter');
  gsap.fromTo(letters,
    { y: 60, opacity: 0, rotationX: 90 },
    {
      y: 0, opacity: 1, rotationX: 0,
      stagger: 0.05,
      duration: 0.6,
      ease: 'back.out(1.7)',
    }
  );
};

// Split text לאותיות
const splitToLetters = (text: string) =>
  text.split('').map(ch =>
    `<span class="letter" style="display:inline-block">${ch}</span>`
  ).join('');
```

---

## תבנית קומפוננט מוכנה (React + framer-motion)

```tsx
import { motion } from 'framer-motion';

type Style3D = 'gold' | 'chrome' | 'neon' | 'deep';

const shadows: Record<Style3D, string> = {
  gold:   '1px 1px 0 #b8860b, 3px 3px 0 #daa520, 6px 6px 15px rgba(0,0,0,0.4)',
  chrome: '1px 1px 0 #ccc, 3px 3px 0 #aaa, 5px 5px 10px rgba(0,0,0,0.3)',
  neon:   '0 0 8px #fff, 0 0 20px currentColor, 0 0 40px currentColor',
  deep:   '1px 1px 0 #ccc,2px 2px 0 #bbb,3px 3px 0 #aaa,4px 4px 0 #999,5px 5px 0 #888,7px 7px 12px rgba(0,0,0,0.5)',
};

export const AnimatedTitle3D = ({
  text,
  style3d = 'deep',
  color = '#ffffff',
}: {
  text: string;
  style3d?: Style3D;
  color?: string;
}) => (
  <motion.h1
    style={{ color, textShadow: shadows[style3d], fontWeight: 900, lineHeight: 1.1 }}
    initial={{ opacity: 0, y: 40, rotateX: 60 }}
    animate={{ opacity: 1, y: 0, rotateX: 8 }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
  >
    {text}
  </motion.h1>
);
```

---

## אנימציות סטנדרטיות — מוכנות להעתקה

| שם | שימוש | טכניקה |
|---|---|---|
| `float` | כותרת ראשית | CSS keyframes, translateY ±12px, 3s |
| `reveal-up` | כניסה לדף | framer-motion, rotateX 90→8 |
| `bounce-in` | הדגמה | spring stiffness:200 |
| `letter-wave` | כותרת ייצוגית | GSAP stagger 0.05s |
| `spin-reveal` | לוגו, Reel | CSS rotate 360 + scale 0→1 |
| `neon-pulse` | ניאון | CSS animation + filter brightness |
| `full-3d-rotate` | Three.js | mesh.rotation.y += 0.005 |

---

## כלים חיצוניים לסרטונים (מחוץ לקוד)

| כלי | שימוש | עלות |
|---|---|---|
| **CapCut / Pippit** | אנימציות טקסט ל-Reels ו-Shorts — מהיר ביותר | חינם |
| **Jitter.video** | אנימציות web-first, ייצוא כ-GIF/MP4 | freemium |
| **Spline** | 3D scene בדפדפן + embed ב-iframe | freemium |
| **Lottie (lottiefile.com)** | אנימציות JSON קלות משקל — מושלם לאיקוני | חינם |

---

## עקרונות שימוש (מתוך שפת העיצוב של ענת)

- **תנועה משרתת הבנה**, לא עצמה. אנימציה שלא מוסיפה משמעות — מורידים אותה.
- **prefers-reduced-motion** — תמיד. עוטפים כל אנימציה:
  ```css
  @media (prefers-reduced-motion: reduce) { animation: none; transition: none; }
  ```
- **Three.js בטעינה עצלנית בלבד** — לא ב-bundle הראשי:
  ```ts
  const THREE = await import('three');
  ```
- **עומק ב-CSS > SVG > Three.js** — בוחרים את הפשוט ביותר שמספיק.
- **גרדיאנט עם משמעות:** חודש, עונה, עוצמה — לא רק קישוט.
- **RTL:** `direction: rtl` על עטיפת הטקסט; Three.js — Font עברי בלבד (Heebo/Rubik typeface.json).

---

## מתי לא להשתמש

- כשהמידע מורכב ודורש קריאה — טקסט סטטי ברור עדיף.
- כשהמשתמש לא מבין מה הכפתור עושה — UI ברור קודם לאנימציה.
- כשה-TTI (Time To Interactive) קריטי — Three.js נטען רק אחרי שהדף פעיל.
