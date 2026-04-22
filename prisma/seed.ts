import { PrismaClient, Role, Plan, LessonType } from "../src/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from 'bcryptjs'
import '../envConfig'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // ============================================
  // 1. LIMPIAR BASE DE DATOS (orden importante por FK)
  // ============================================
  console.log('🧹 Limpiando datos existentes...')

  await prisma.lessonProgress.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.categoriesOnCourses.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // ============================================
  // 2. CREAR CATEGORÍAS
  // ============================================
  console.log('📁 Creando categorías...')

  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Desarrollo Web', slug: 'desarrollo-web' }
    }),
    prisma.category.create({
      data: { name: 'Desarrollo Mobile', slug: 'desarrollo-mobile' }
    }),
    prisma.category.create({
      data: { name: 'Base de Datos', slug: 'base-de-datos' }
    }),
    prisma.category.create({
      data: { name: 'DevOps', slug: 'devops' }
    }),
    prisma.category.create({
      data: { name: 'Inteligencia Artificial', slug: 'inteligencia-artificial' }
    }),
    prisma.category.create({
      data: { name: 'Diseño UX/UI', slug: 'diseno-ux-ui' }
    }),
  ])

  console.log(`   ✅ ${categories.length} categorías creadas`)

  // ============================================
  // 3. CREAR TENANTS
  // ============================================
  console.log('🏢 Creando tenants...')

  const tenantAcme = await prisma.tenant.create({
    data: {
      name: 'ACME Academy',
      slug: 'acme',
      plan: Plan.PRO,
      logo: '/tenants/acme-logo.png',
    }
  })

  const tenantTechSchool = await prisma.tenant.create({
    data: {
      name: 'Tech School',
      slug: 'techschool',
      plan: Plan.STARTER,
      logo: '/tenants/techschool-logo.png',
    }
  })

  const tenantFreeLearn = await prisma.tenant.create({
    data: {
      name: 'Free Learn',
      slug: 'freelearn',
      plan: Plan.FREE,
    }
  })

  console.log('   ✅ 3 tenants creados')

  // ============================================
  // 4. CREAR USUARIOS
  // ============================================
  console.log('👥 Creando usuarios...')

  const hashedPassword = await hash('password123', 12)

  // Super Admin (sin tenant - administra la plataforma)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@nextlms.com',
      name: 'Super Administrador',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    }
  })

  // Admin de ACME
  const adminAcme = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      name: 'Admin ACME',
      password: hashedPassword,
      role: Role.ADMIN,
      tenantId: tenantAcme.id,
      emailVerified: new Date(),
    }
  })

  // Instructor de ACME
  const instructorAcme = await prisma.user.create({
    data: {
      email: 'instructor@acme.com',
      name: 'Carlos Instructor',
      password: hashedPassword,
      role: Role.INSTRUCTOR,
      tenantId: tenantAcme.id,
      emailVerified: new Date(),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    }
  })

  // Estudiantes de ACME
  const student1Acme = await prisma.user.create({
    data: {
      email: 'maria@student.com',
      name: 'María García',
      password: hashedPassword,
      role: Role.STUDENT,
      tenantId: tenantAcme.id,
      emailVerified: new Date(),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    }
  })

  const student2Acme = await prisma.user.create({
    data: {
      email: 'juan@student.com',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: Role.STUDENT,
      tenantId: tenantAcme.id,
      emailVerified: new Date(),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
    }
  })

  // Admin de Tech School
  const adminTechSchool = await prisma.user.create({
    data: {
      email: 'admin@techschool.com',
      name: 'Admin Tech School',
      password: hashedPassword,
      role: Role.ADMIN,
      tenantId: tenantTechSchool.id,
      emailVerified: new Date(),
    }
  })

  console.log('   ✅ 6 usuarios creados')

  // ============================================
  // 5. CREAR CURSOS
  // ============================================
  console.log('📚 Creando cursos...')

  // Curso 1: Next.js Completo (ACME)
  const courseNextjs = await prisma.course.create({
    data: {
      title: 'Next.js 16 - Curso Completo',
      slug: 'nextjs-16-curso-completo',
      description: `
        Aprende Next.js 16 desde cero hasta nivel avanzado.

        En este curso aprenderás:
        - App Router y Server Components
        - Data Fetching y Caching
        - Autenticación con NextAuth.js
        - Deployment en Vercel

        ¡Incluye proyecto final de un LMS completo!
      `.trim(),
      thumbnail: '/courses/nextjs-thumbnail.jpg',
      price: 49.99,
      isPublished: true,
      isFree: false,
      tenantId: tenantAcme.id,
      ownerId: instructorAcme.id,
      categories: {
        create: [
          { categoryId: categories[0].id }, // Desarrollo Web
        ]
      },
      modules: {
        create: [
          {
            title: 'Introducción a Next.js',
            position: 1,
            lessons: {
              create: [
                {
                  title: '¿Qué es Next.js?',
                  content: `
# ¿Qué es Next.js?

Next.js es un framework de React que permite crear aplicaciones web fullstack.

## Características principales:

1. **Server Components** - Componentes que se renderizan en el servidor
2. **App Router** - Sistema de rutas basado en el sistema de archivos
3. **API Routes** - Backend integrado
4. **Optimizaciones** - Imágenes, fonts, scripts automáticamente optimizados

## ¿Por qué usar Next.js?

- Mejor SEO
- Mejor rendimiento
- Experiencia de desarrollo superior
                  `.trim(),
                  position: 1,
                  type: LessonType.TEXT,
                  isFree: true,
                  isPublished: true,
                },
                {
                  title: 'Instalación y Configuración',
                  content: `
# Instalación de Next.js

## Requisitos previos

- Node.js 18.17 o superior
- npm, yarn, o pnpm

## Crear un nuevo proyecto

\`\`\`bash
npx create-next-app@latest mi-proyecto
\`\`\`

## Opciones recomendadas

- TypeScript: Sí
- ESLint: Sí
- Tailwind CSS: Sí
- src/ directory: Sí
- App Router: Sí
                  `.trim(),
                  position: 2,
                  type: LessonType.TEXT,
                  isFree: true,
                  isPublished: true,
                },
                {
                  title: 'Estructura del Proyecto',
                  content: 'Contenido sobre la estructura de carpetas...',
                  position: 3,
                  type: LessonType.TEXT,
                  isFree: false,
                  isPublished: true,
                },
              ]
            }
          },
          {
            title: 'App Router en Profundidad',
            position: 2,
            lessons: {
              create: [
                {
                  title: 'Rutas y Layouts',
                  content: 'Contenido sobre rutas y layouts...',
                  position: 1,
                  type: LessonType.TEXT,
                  isPublished: true,
                },
                {
                  title: 'Loading y Error States',
                  content: 'Contenido sobre estados de carga y error...',
                  position: 2,
                  type: LessonType.TEXT,
                  isPublished: true,
                },
                {
                  title: 'Quiz: App Router',
                  content: '{"questions": []}',
                  position: 3,
                  type: LessonType.QUIZ,
                  isPublished: false,
                },
              ]
            }
          },
          {
            title: 'Server Components',
            position: 3,
            lessons: {
              create: [
                {
                  title: 'Server vs Client Components',
                  content: 'Contenido sobre componentes...',
                  position: 1,
                  type: LessonType.TEXT,
                  isPublished: true,
                },
                {
                  title: 'Data Fetching en Server Components',
                  content: 'Contenido sobre data fetching en server components...',
                  videoUrl: 'https://www.youtube.com/watch?v=example',
                  position: 2,
                  type: LessonType.VIDEO,
                  isPublished: true,
                },
              ]
            }
          },
        ]
      }
    }
  })

  // Curso 2: React Fundamentos (ACME - Gratis)
  const courseReact = await prisma.course.create({
    data: {
      title: 'React - Fundamentos',
      slug: 'react-fundamentos',
      description: 'Aprende los fundamentos de React antes de pasar a Next.js',
      thumbnail: '/courses/react-thumbnail.jpg',
      isPublished: true,
      isFree: true,
      tenantId: tenantAcme.id,
      ownerId: instructorAcme.id,
      categories: {
        create: [
          { categoryId: categories[0].id }, // Desarrollo Web
        ]
      },
      modules: {
        create: [
          {
            title: 'Introducción a React',
            position: 1,
            lessons: {
              create: [
                {
                  title: '¿Qué es React?',
                  content: 'Introducción a React...',
                  position: 1,
                  type: LessonType.TEXT,
                  isFree: true,
                  isPublished: true,
                },
                {
                  title: 'JSX y Componentes',
                  content: 'JSX y componentes funcionales...',
                  position: 2,
                  type: LessonType.TEXT,
                  isFree: true,
                  isPublished: true,
                },
              ]
            }
          },
        ]
      }
    }
  })

  // Curso 3: PostgreSQL (Tech School)
  const coursePostgres = await prisma.course.create({
    data: {
      title: 'PostgreSQL desde Cero',
      slug: 'postgresql-desde-cero',
      description: 'Domina PostgreSQL para aplicaciones modernas',
      thumbnail: '/courses/postgres-thumbnail.jpg',
      price: 29.99,
      isPublished: true,
      isFree: false,
      tenantId: tenantTechSchool.id,
      ownerId: adminTechSchool.id,
      categories: {
        create: [
          { categoryId: categories[2].id }, // Base de Datos
        ]
      },
      modules: {
        create: [
          {
            title: 'Fundamentos SQL',
            position: 1,
            lessons: {
              create: [
                {
                  title: 'SELECT, INSERT, UPDATE, DELETE',
                  content: 'Operaciones CRUD básicas...',
                  position: 1,
                  type: LessonType.TEXT,
                  isFree: true,
                  isPublished: true,
                },
              ]
            }
          },
        ]
      }
    }
  })

  console.log('   ✅ 3 cursos creados con módulos y lecciones')

  // ============================================
  // 6. CREAR INSCRIPCIONES Y PROGRESO
  // ============================================
  console.log('📝 Creando inscripciones...')

  // María inscrita en Next.js
  const enrollmentMaria = await prisma.enrollment.create({
    data: {
      userId: student1Acme.id,
      courseId: courseNextjs.id,
    }
  })

  // Juan inscrito en React
  const enrollmentJuan = await prisma.enrollment.create({
    data: {
      userId: student2Acme.id,
      courseId: courseReact.id,
    }
  })

  // Obtener lecciones para crear progreso
  const lessonsNextjs = await prisma.lesson.findMany({
    where: { module: { courseId: courseNextjs.id } },
    orderBy: { position: 'asc' },
    take: 2,
  })

  // María ha completado 2 lecciones
  for (const lesson of lessonsNextjs) {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollmentMaria.id,
        lessonId: lesson.id,
        isCompleted: true,
        completedAt: new Date(),
      }
    })
  }

  console.log('   ✅ 2 inscripciones creadas con progreso')

  // ============================================
  // RESUMEN
  // ============================================
  console.log('')
  console.log('════════════════════════════════════════')
  console.log('🎉 Seed completado exitosamente!')
  console.log('════════════════════════════════════════')
  console.log('')
  console.log('📊 Resumen:')
  console.log(`   - Categorías: ${categories.length}`)
  console.log('   - Tenants: 3')
  console.log('   - Usuarios: 6')
  console.log('   - Cursos: 3')
  console.log('   - Inscripciones: 2')
  console.log('')
  console.log('🔐 Credenciales de prueba:')
  console.log('   Email: superadmin@nextlms.com')
  console.log('   Email: admin@acme.com')
  console.log('   Email: instructor@acme.com')
  console.log('   Email: maria@student.com')
  console.log('   Password: password123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })